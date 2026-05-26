import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Plus, X, Edit2, Trash2, BookOpen, Clock, CheckCircle } from 'lucide-react';

const CLASSES = ['9A', '9B', '10A', '10B'];
const SUBJECTS = ['Math', 'Science', 'English', 'History', 'Computer Science'];

function HomeworkModal({ hw, onClose, onSave, user }) {
  const [form, setForm] = useState(hw || { title: '', subject: 'Math', deadline: '', class: '10A', description: '', teacherId: user?.id });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (hw?.id) {
        await api.homework.update(hw.id, form);
      } else {
        await api.homework.create({ ...form, teacherId: user?.id });
      }
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
          <h2 className="modal-title">{hw?.id ? 'Edit Assignment' : 'New Assignment'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Assignment title" />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Subject</label>
              <select className="form-input" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })}>
                {SUBJECTS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Class</label>
              <select className="form-input" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
                {CLASSES.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
          </div>
          <div className="form-group">
            <label className="form-label">Deadline</label>
            <input type="date" className="form-input" value={form.deadline} onChange={e => setForm({ ...form, deadline: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea className="form-input" rows={3} value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} placeholder="Assignment instructions..." style={{ resize: 'vertical' }} />
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : 'Save'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

function HomeworkCard({ hw, onEdit, onDelete, canEdit, user, students }) {
  const [submitting, setSubmitting] = useState(false);
  const deadline = new Date(hw.deadline);
  const isOverdue = deadline < new Date() && hw.deadline;
  const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
  const subjectColors = { Math: '#4f46e5', Science: '#06b6d4', English: '#10b981', History: '#f59e0b', 'Computer Science': '#ec4899' };
  const color = subjectColors[hw.subject] || '#94a3b8';

  const myStudent = students.find(s => s.class === hw.class);
  const hasSubmitted = myStudent && hw.submissions?.includes(myStudent.id);

  const handleSubmit = async () => {
    if (!myStudent) return;
    setSubmitting(true);
    try {
      await api.homework.submit(hw.id, myStudent.id);
      onEdit();
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="card" style={{ padding: 18 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 10 }}>
        <div style={{ display: 'flex', gap: 10, alignItems: 'flex-start', flex: 1 }}>
          <div style={{ width: 38, height: 38, borderRadius: 10, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            <BookOpen size={18} color={color} />
          </div>
          <div>
            <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 3 }}>{hw.title}</h3>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              <span style={{ background: `${color}15`, color, fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20 }}>{hw.subject}</span>
              <span className="badge badge-purple">{hw.class}</span>
            </div>
          </div>
        </div>
        {canEdit && (
          <div style={{ display: 'flex', gap: 6 }}>
            <button className="btn btn-secondary btn-sm" onClick={() => onEdit(hw)}><Edit2 size={12} /></button>
            <button className="btn btn-danger btn-sm" onClick={() => onDelete(hw.id)}><Trash2 size={12} /></button>
          </div>
        )}
      </div>
      {hw.description && <p style={{ fontSize: 12, color: 'var(--text-secondary)', marginBottom: 12, lineHeight: 1.5 }}>{hw.description}</p>}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--surface-2)', paddingTop: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 5 }}>
          <Clock size={12} color={isOverdue ? '#ef4444' : 'var(--text-muted)'} />
          <span style={{ fontSize: 11, color: isOverdue ? '#ef4444' : 'var(--text-muted)', fontWeight: 500 }}>
            {isOverdue ? 'Overdue' : `Due ${hw.deadline}`} {!isOverdue && daysLeft <= 3 && `(${daysLeft}d left)`}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{hw.submissions?.length || 0} submitted</span>
          {user?.role === 'student' && (
            hasSubmitted ? (
              <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11, color: '#10b981', fontWeight: 600 }}>
                <CheckCircle size={13} /> Submitted
              </span>
            ) : (
              <button className="btn btn-primary btn-sm" onClick={handleSubmit} disabled={submitting}>
                {submitting ? 'Submitting...' : 'Submit'}
              </button>
            )
          )}
        </div>
      </div>
    </div>
  );
}

export default function HomeworkPage() {
  const { user } = useAuth();
  const [homework, setHomework] = useState([]);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [filterClass, setFilterClass] = useState('');
  const [filterSubject, setFilterSubject] = useState('');
  const canEdit = ['admin', 'teacher'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const params = {};
      if (filterClass) params.class = filterClass;
      if (filterSubject) params.subject = filterSubject;
      const [hw, studs] = await Promise.all([api.homework.list(params), api.students.list()]);
      setHomework(hw);
      setStudents(studs);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [filterClass, filterSubject]);

  const handleDelete = async (id) => {
    if (!confirm('Delete this assignment?')) return;
    await api.homework.delete(id);
    load();
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Homework</h1>
          <p className="page-subtitle">{homework.length} assignments</p>
        </div>
        {canEdit && (
          <button className="btn btn-primary" onClick={() => setModal({})}><Plus size={14} /> New Assignment</button>
        )}
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <select className="form-input" style={{ width: 130 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>
        <select className="form-input" style={{ width: 160 }} value={filterSubject} onChange={e => setFilterSubject(e.target.value)}>
          <option value="">All Subjects</option>
          {SUBJECTS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : homework.length === 0 ? (
        <div className="empty-state card" style={{ padding: 48 }}>
          <BookOpen size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
          <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No assignments found</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>No homework has been posted yet.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
          {homework.map(hw => (
            <HomeworkCard key={hw.id} hw={hw} canEdit={canEdit} user={user} students={students}
              onEdit={(h) => h ? setModal(h) : load()} onDelete={handleDelete} />
          ))}
        </div>
      )}

      {modal !== null && (
        <HomeworkModal hw={modal} user={user} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />
      )}
    </div>
  );
}
