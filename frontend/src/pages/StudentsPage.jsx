import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { Plus, Search, Edit2, Trash2, X, ChevronRight } from 'lucide-react';

const CLASSES = ['9A', '9B', '10A', '10B'];
const SUBJECTS = ['math', 'science', 'english', 'history'];

function StudentModal({ student, onClose, onSave }) {
  const [form, setForm] = useState(student || { studentName: '', class: '10A', parentId: '', marks: { math: 0, science: 0, english: 0, history: 0 } });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { ...form, marks: { math: +form.marks.math, science: +form.marks.science, english: +form.marks.english, history: +form.marks.history } };
      if (student?.id) {
        await api.students.update(student.id, data);
      } else {
        await api.students.create(data);
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
          <h2 className="modal-title">{student?.id ? 'Edit Student' : 'Add Student'}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Full Name</label>
            <input className="form-input" value={form.studentName} onChange={e => setForm({ ...form, studentName: e.target.value })} required />
          </div>
          <div className="form-group">
            <label className="form-label">Class</label>
            <select className="form-input" value={form.class} onChange={e => setForm({ ...form, class: e.target.value })}>
              {CLASSES.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="form-label" style={{ marginBottom: 8, display: 'block' }}>Subject Marks</label>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              {SUBJECTS.map(s => (
                <div key={s} className="form-group">
                  <label className="form-label" style={{ textTransform: 'capitalize' }}>{s}</label>
                  <input className="form-input" type="number" min="0" max="100"
                    value={form.marks[s]} onChange={e => setForm({ ...form, marks: { ...form.marks, [s]: e.target.value } })} />
                </div>
              ))}
            </div>
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

function StudentDetail({ student, onClose, onEdit }) {
  const avg = Object.values(student.marks || {}).reduce((a, b) => a + b, 0) / Object.values(student.marks || {}).length;
  return (
    <div className="modal-overlay">
      <div className="modal" style={{ maxWidth: 520 }}>
        <div className="modal-header">
          <h2 className="modal-title">{student.studentName}</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>
        <div className="modal-body">
          <div style={{ display: 'flex', gap: 16, marginBottom: 8 }}>
            <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Class</div>
              <div style={{ fontSize: 18, fontWeight: 700 }}>{student.class}</div>
            </div>
            <div style={{ flex: 1, background: 'var(--surface-2)', borderRadius: 10, padding: 14 }}>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', marginBottom: 4 }}>Average</div>
              <div style={{ fontSize: 18, fontWeight: 700, color: avg >= 80 ? '#10b981' : avg >= 60 ? '#f59e0b' : '#ef4444' }}>{Math.round(avg)}%</div>
            </div>
          </div>
          <div>
            <div style={{ fontSize: 12, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)', marginBottom: 10 }}>Subject Marks</div>
            {Object.entries(student.marks || {}).map(([sub, mark]) => (
              <div key={sub} style={{ marginBottom: 10 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 4 }}>
                  <span style={{ textTransform: 'capitalize', fontSize: 13, fontWeight: 500 }}>{sub}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: mark >= 80 ? '#10b981' : mark >= 60 ? '#f59e0b' : '#ef4444' }}>{mark}/100</span>
                </div>
                <div style={{ height: 5, background: 'var(--surface-3)', borderRadius: 3 }}>
                  <div style={{ height: '100%', width: `${mark}%`, background: mark >= 80 ? '#10b981' : mark >= 60 ? '#f59e0b' : '#ef4444', borderRadius: 3 }} />
                </div>
              </div>
            ))}
          </div>
          <div className="modal-actions">
            <button className="btn btn-secondary" onClick={onClose}>Close</button>
            <button className="btn btn-primary" onClick={onEdit}><Edit2 size={13} /> Edit</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function StudentsPage() {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterClass, setFilterClass] = useState('');
  const [modal, setModal] = useState(null);
  const [detail, setDetail] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.students.list();
      setStudents(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const filtered = students.filter(s =>
    (!search || s.studentName.toLowerCase().includes(search.toLowerCase())) &&
    (!filterClass || s.class === filterClass)
  );

  const handleDelete = async (id) => {
    if (!confirm('Delete this student?')) return;
    await api.students.delete(id);
    load();
  };

  const avg = (marks) => {
    const vals = Object.values(marks || {});
    return vals.length ? Math.round(vals.reduce((a, b) => a + b, 0) / vals.length) : 0;
  };

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Students</h1>
          <p className="page-subtitle">{filtered.length} students found</p>
        </div>
        <button className="btn btn-primary" onClick={() => setModal({})}>
          <Plus size={14} /> Add Student
        </button>
      </div>

      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <div style={{ position: 'relative', flex: 1, maxWidth: 300 }}>
          <Search size={14} style={{ position: 'absolute', left: 10, top: '50%', transform: 'translateY(-50%)', color: 'var(--text-muted)' }} />
          <input className="form-input" style={{ paddingLeft: 32 }} placeholder="Search students..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <select className="form-input" style={{ width: 120 }} value={filterClass} onChange={e => setFilterClass(e.target.value)}>
          <option value="">All Classes</option>
          {CLASSES.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="card">
        {loading ? <div className="loading"><div className="spinner" />Loading...</div> : (
          <div className="table-wrapper">
            <table>
              <thead>
                <tr>
                  <th>Student Name</th>
                  <th>Class</th>
                  <th>Math</th>
                  <th>Science</th>
                  <th>English</th>
                  <th>History</th>
                  <th>Average</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(s => {
                  const a = avg(s.marks);
                  return (
                    <tr key={s.id}>
                      <td>
                        <button onClick={() => setDetail(s)} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--brand-primary)', fontWeight: 600, fontSize: 13, cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 4 }}>
                          {s.studentName} <ChevronRight size={12} />
                        </button>
                      </td>
                      <td><span className="badge badge-purple">{s.class}</span></td>
                      <td>{s.marks?.math ?? '-'}</td>
                      <td>{s.marks?.science ?? '-'}</td>
                      <td>{s.marks?.english ?? '-'}</td>
                      <td>{s.marks?.history ?? '-'}</td>
                      <td>
                        <span style={{ fontWeight: 700, color: a >= 80 ? '#10b981' : a >= 60 ? '#f59e0b' : '#ef4444' }}>{a}%</span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setModal(s)}><Edit2 size={12} /></button>
                          <button className="btn btn-danger btn-sm" onClick={() => handleDelete(s.id)}><Trash2 size={12} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
                {filtered.length === 0 && (
                  <tr><td colSpan={8}><div className="empty-state">No students found</div></td></tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {modal !== null && (
        <StudentModal student={modal} onClose={() => setModal(null)} onSave={() => { setModal(null); load(); }} />
      )}
      {detail && !modal && (
        <StudentDetail student={detail} onClose={() => setDetail(null)} onEdit={() => { setModal(detail); setDetail(null); }} />
      )}
    </div>
  );
}
