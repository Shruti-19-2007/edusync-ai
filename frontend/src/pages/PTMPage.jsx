import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, X, Calendar, Clock, User, Trash2 } from 'lucide-react';

const TIME_SLOTS = ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', '14:00', '14:30', '15:00', '15:30', '16:00'];

function BookModal({ onClose, onSave, user, students }) {
  const [form, setForm] = useState({
    teacherId: 'u2',
    parentId: user?.id || 'u3',
    studentId: '',
    meetingDate: '',
    meetingTime: '10:00',
    notes: '',
  });
  const [loading, setLoading] = useState(false);
  const [teachers, setTeachers] = useState([]);

  useEffect(() => {
    api.auth.getUsers().then(users => setTeachers(users.filter(u => u.role === 'teacher')));
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.ptm.create(form);
      onSave();
    } catch (err) {
      alert(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className="modal-header">
          <h2 className="modal-title">Book PTM Meeting</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Teacher</label>
            <select className="form-input" value={form.teacherId} onChange={e => setForm({ ...form, teacherId: e.target.value })}>
              {teachers.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
            </select>
          </div>
          <div className="form-group">
            <label className="form-label">Student (optional)</label>
            <select className="form-input" value={form.studentId} onChange={e => setForm({ ...form, studentId: e.target.value })}>
              <option value="">Select student</option>
              {students.map(s => <option key={s.id} value={s.id}>{s.studentName} - {s.class}</option>)}
            </select>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Date</label>
              <input type="date" className="form-input" value={form.meetingDate} onChange={e => setForm({ ...form, meetingDate: e.target.value })} required />
            </div>
            <div className="form-group">
              <label className="form-label">Time</label>
              <select className="form-input" value={form.meetingTime} onChange={e => setForm({ ...form, meetingTime: e.target.value })}>
                {TIME_SLOTS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Notes (optional)</label>
            <textarea className="form-input" rows={2} value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} placeholder="Topics to discuss..." style={{ resize: 'vertical' }} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Booking...' : 'Book Meeting'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function PTMPage() {
  const { user } = useAuth();
  const [meetings, setMeetings] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const [filterStatus, setFilterStatus] = useState('');
  const canBook = ['parent', 'admin'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterStatus) params.status = filterStatus;
      const [mtgs, studs] = await Promise.all([api.ptm.list(params), api.students.list()]);
      setMeetings(mtgs);
      setStudents(studs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterStatus]);

  const handleCancel = async (id) => {
    if (!confirm('Cancel this meeting?')) return;
    await api.ptm.cancel(id);
    load();
  };

  const statusColors = { scheduled: 'badge-info', completed: 'badge-success', cancelled: 'badge-danger' };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">PTM Meetings</h1>
          <p className="page-subtitle">Parent-Teacher Meeting schedule and bookings</p>
        </div>
        {canBook && (
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={14} /> Book Meeting</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select className="form-input" style={{ width: 150 }} value={filterStatus} onChange={e => setFilterStatus(e.target.value)}>
          <option value="">All Statuses</option>
          <option value="scheduled">Scheduled</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 16 }}>
          {meetings.map(m => (
            <div key={m.id} className="card" style={{ padding: 18 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 14 }}>
                <span className={`badge ${statusColors[m.status] || 'badge-info'}`} style={{ textTransform: 'capitalize' }}>{m.status}</span>
                {m.status === 'scheduled' && (
                  <button className="btn btn-danger btn-sm" onClick={() => handleCancel(m.id)}><Trash2 size={12} /></button>
                )}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                  <User size={14} color="var(--text-muted)" />
                  <div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Teacher</div>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{m.teacherName || 'N/A'}</div>
                  </div>
                </div>
                {m.studentName && (
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <User size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Student</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.studentName}</div>
                    </div>
                  </div>
                )}
                <div style={{ display: 'flex', gap: 12 }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Calendar size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Date</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.meetingDate}</div>
                    </div>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <Clock size={14} color="var(--text-muted)" />
                    <div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>Time</div>
                      <div style={{ fontSize: 13, fontWeight: 600 }}>{m.meetingTime}</div>
                    </div>
                  </div>
                </div>
                {m.notes && (
                  <div style={{ background: 'var(--surface-2)', borderRadius: 8, padding: '8px 10px', fontSize: 12, color: 'var(--text-secondary)', fontStyle: 'italic' }}>
                    {m.notes}
                  </div>
                )}
              </div>
            </div>
          ))}
          {meetings.length === 0 && (
            <div className="card" style={{ gridColumn: '1/-1', padding: 48 }}>
              <div className="empty-state">
                <Calendar size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No meetings found</div>
                <div style={{ fontSize: 13 }}>No PTM meetings have been scheduled yet.</div>
              </div>
            </div>
          )}
        </div>
      )}

      {modal && (
        <BookModal user={user} students={students} onClose={() => setModal(false)} onSave={() => { setModal(false); load(); }} />
      )}
    </div>
  );
}
