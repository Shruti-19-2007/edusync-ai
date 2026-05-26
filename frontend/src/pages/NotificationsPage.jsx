import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Bell, Plus, X, AlertCircle, Info, AlertTriangle } from 'lucide-react';

function NotificationModal({ onClose, onSave }) {
  const [form, setForm] = useState({ title: '', message: '', type: 'info', targetRole: 'all' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.notifications.create(form);
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
          <h2 className="modal-title">Send Notification</h2>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', padding: 4 }}><X size={18} /></button>
        </div>
        <form onSubmit={handleSubmit} className="modal-body">
          <div className="form-group">
            <label className="form-label">Title</label>
            <input className="form-input" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required placeholder="Notification title" />
          </div>
          <div className="form-group">
            <label className="form-label">Message</label>
            <textarea className="form-input" rows={3} value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required placeholder="Notification message..." style={{ resize: 'vertical' }} />
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div className="form-group">
              <label className="form-label">Type</label>
              <select className="form-input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
                <option value="info">Info</option>
                <option value="warning">Warning</option>
                <option value="alert">Alert</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Target Role</label>
              <select className="form-input" value={form.targetRole} onChange={e => setForm({ ...form, targetRole: e.target.value })}>
                <option value="all">All</option>
                <option value="teacher">Teachers</option>
                <option value="parent">Parents</option>
                <option value="student">Students</option>
              </select>
            </div>
          </div>
          <div className="modal-actions">
            <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Sending...' : 'Send'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function NotificationsPage() {
  const { user } = useAuth();
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(false);
  const canCreate = ['admin', 'teacher'].includes(user?.role);

  const load = async () => {
    setLoading(true);
    try {
      const data = await api.notifications.list({ role: user?.role });
      setNotifications(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, []);

  const handleMarkRead = async (id) => {
    await api.notifications.markRead(id);
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  };

  const typeConfig = {
    info: { icon: Info, color: '#3b82f6', bg: '#dbeafe' },
    warning: { icon: AlertTriangle, color: '#f59e0b', bg: '#fef3c7' },
    alert: { icon: AlertCircle, color: '#ef4444', bg: '#fee2e2' },
  };

  const unread = notifications.filter(n => !n.read).length;

  return (
    <div className="fade-in">
      <div className="page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 className="page-title">Notifications</h1>
          <p className="page-subtitle">{unread > 0 ? `${unread} unread` : 'All caught up'}</p>
        </div>
        {canCreate && (
          <button className="btn btn-primary" onClick={() => setModal(true)}><Plus size={14} /> Send Notification</button>
        )}
      </div>

      {loading ? (
        <div className="loading"><div className="spinner" />Loading...</div>
      ) : notifications.length === 0 ? (
        <div className="card" style={{ padding: 48 }}>
          <div className="empty-state">
            <Bell size={40} color="var(--text-muted)" style={{ margin: '0 auto 12px' }} />
            <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 4 }}>No notifications</div>
            <div style={{ fontSize: 13 }}>You're all caught up!</div>
          </div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {notifications.map(n => {
            const cfg = typeConfig[n.type] || typeConfig.info;
            const Icon = cfg.icon;
            return (
              <div
                key={n.id}
                className="card"
                style={{
                  padding: '14px 18px',
                  display: 'flex',
                  gap: 14,
                  alignItems: 'flex-start',
                  opacity: n.read ? 0.7 : 1,
                  borderLeft: n.read ? '3px solid transparent' : `3px solid ${cfg.color}`,
                }}
              >
                <div style={{ width: 36, height: 36, borderRadius: 10, background: cfg.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Icon size={16} color={cfg.color} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                    <div style={{ fontSize: 14, fontWeight: n.read ? 500 : 700 }}>{n.title}</div>
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0, marginLeft: 10 }}>
                      {!n.read && <span style={{ width: 8, height: 8, borderRadius: '50%', background: cfg.color, display: 'block' }} />}
                      <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{new Date(n.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                  <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 8 }}>{n.message}</div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <span style={{ fontSize: 11, color: 'var(--text-muted)', background: 'var(--surface-2)', padding: '2px 8px', borderRadius: 20, textTransform: 'capitalize' }}>
                      For: {n.targetRole}
                    </span>
                    {!n.read && (
                      <button onClick={() => handleMarkRead(n.id)} className="btn btn-secondary btn-sm">Mark as read</button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {modal && (
        <NotificationModal onClose={() => setModal(false)} onSave={() => { setModal(false); load(); }} />
      )}
    </div>
  );
}
