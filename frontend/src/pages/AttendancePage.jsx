import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Check, X, Minus, Save } from 'lucide-react';

const CLASSES = ['9A', '9B', '10A', '10B'];
const today = new Date().toISOString().split('T')[0];

export default function AttendancePage() {
  const { user } = useAuth();
  const [students, setStudents] = useState([]);
  const [attendance, setAttendance] = useState({});
  const [selectedClass, setSelectedClass] = useState('10A');
  const [selectedDate, setSelectedDate] = useState(today);
  const [summary, setSummary] = useState([]);
  const [tab, setTab] = useState('mark');
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const loadClassData = async () => {
    setLoading(true);
    try {
      const [studs, att] = await Promise.all([
        api.students.list({ class: selectedClass }),
        api.attendance.list({ date: selectedDate, class: selectedClass }),
      ]);
      setStudents(studs);
      const map = {};
      att.forEach(a => { map[a.studentId] = a.status; });
      studs.forEach(s => { if (!map[s.id]) map[s.id] = 'present'; });
      setAttendance(map);
    } finally {
      setLoading(false);
    }
  };

  const loadSummary = async () => {
    const data = await api.attendance.summary();
    setSummary(data);
  };

  useEffect(() => {
    if (tab === 'mark') loadClassData();
    else loadSummary();
  }, [selectedClass, selectedDate, tab]);

  const handleSave = async () => {
    setSaving(true);
    try {
      const records = students.map(s => ({ studentId: s.id, date: selectedDate, status: attendance[s.id] || 'present' }));
      await api.attendance.mark(records);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const canEdit = ['admin', 'teacher'].includes(user?.role);
  const present = Object.values(attendance).filter(v => v === 'present').length;
  const absent = Object.values(attendance).filter(v => v === 'absent').length;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Attendance</h1>
        <p className="page-subtitle">Track and manage student attendance records</p>
      </div>

      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        {['mark', 'summary'].map(t => (
          <button
            key={t}
            onClick={() => setTab(t)}
            style={{
              padding: '8px 18px',
              borderRadius: 8,
              border: 'none',
              background: tab === t ? 'var(--brand-primary)' : 'var(--surface-2)',
              color: tab === t ? 'white' : 'var(--text-secondary)',
              fontWeight: 600,
              fontSize: 13,
              cursor: 'pointer',
              textTransform: 'capitalize',
            }}
          >
            {t === 'mark' ? 'Mark Attendance' : 'Summary'}
          </button>
        ))}
      </div>

      {tab === 'mark' && (
        <>
          <div style={{ display: 'flex', gap: 10, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
            <select className="form-input" style={{ width: 120 }} value={selectedClass} onChange={e => setSelectedClass(e.target.value)}>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
            <input type="date" className="form-input" style={{ width: 160 }} value={selectedDate} onChange={e => setSelectedDate(e.target.value)} />
            <div style={{ display: 'flex', gap: 12, marginLeft: 'auto', alignItems: 'center' }}>
              <span className="badge badge-success">Present: {present}</span>
              <span className="badge badge-danger">Absent: {absent}</span>
              {canEdit && (
                <button className="btn btn-primary" onClick={handleSave} disabled={saving || students.length === 0}>
                  <Save size={13} /> {saving ? 'Saving...' : saved ? 'Saved!' : 'Save Attendance'}
                </button>
              )}
            </div>
          </div>

          <div className="card">
            {loading ? <div className="loading"><div className="spinner" />Loading...</div> : (
              <div className="table-wrapper">
                <table>
                  <thead>
                    <tr>
                      <th>Student</th>
                      <th>Class</th>
                      {canEdit ? <th>Status</th> : <th>Status</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {students.map(s => {
                      const status = attendance[s.id] || 'present';
                      return (
                        <tr key={s.id}>
                          <td style={{ fontWeight: 500 }}>{s.studentName}</td>
                          <td><span className="badge badge-purple">{s.class}</span></td>
                          <td>
                            {canEdit ? (
                              <div style={{ display: 'flex', gap: 6 }}>
                                {['present', 'absent', 'late'].map(st => (
                                  <button
                                    key={st}
                                    onClick={() => setAttendance({ ...attendance, [s.id]: st })}
                                    style={{
                                      padding: '4px 10px',
                                      borderRadius: 6,
                                      border: `1.5px solid ${status === st ? (st === 'present' ? '#10b981' : st === 'absent' ? '#ef4444' : '#f59e0b') : 'var(--surface-3)'}`,
                                      background: status === st ? (st === 'present' ? '#d1fae5' : st === 'absent' ? '#fee2e2' : '#fef3c7') : 'transparent',
                                      color: status === st ? (st === 'present' ? '#065f46' : st === 'absent' ? '#991b1b' : '#92400e') : 'var(--text-muted)',
                                      fontSize: 11,
                                      fontWeight: 600,
                                      cursor: 'pointer',
                                      textTransform: 'capitalize',
                                    }}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            ) : (
                              <span className={`badge ${status === 'present' ? 'badge-success' : status === 'absent' ? 'badge-danger' : 'badge-warning'}`} style={{ textTransform: 'capitalize' }}>{status}</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                    {students.length === 0 && (
                      <tr><td colSpan={3}><div className="empty-state">No students in this class</div></td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {tab === 'summary' && (
        <div className="card">
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Class</th>
                  <th>Present</th>
                  <th>Absent</th>
                  <th>Total Days</th>
                  <th>Attendance %</th>
                </tr>
              </thead>
              <tbody>
                {summary.map(s => (
                  <tr key={s.studentId}>
                    <td style={{ fontWeight: 500 }}>{s.studentName}</td>
                    <td><span className="badge badge-purple">{s.class}</span></td>
                    <td style={{ color: '#10b981', fontWeight: 600 }}>{s.present}</td>
                    <td style={{ color: '#ef4444', fontWeight: 600 }}>{s.absent}</td>
                    <td>{s.total}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{ width: 60, height: 5, background: 'var(--surface-3)', borderRadius: 3 }}>
                          <div style={{ height: '100%', width: `${s.percentage}%`, background: s.percentage >= 80 ? '#10b981' : s.percentage >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                        </div>
                        <span style={{ fontWeight: 700, color: s.percentage >= 80 ? '#10b981' : s.percentage >= 60 ? '#f59e0b' : '#ef4444', fontSize: 13 }}>{s.percentage}%</span>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
