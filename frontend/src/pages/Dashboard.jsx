import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { Users, CalendarCheck, BookOpen, MessageSquare, TrendingUp, Bell, AlertCircle } from 'lucide-react';

function StatCard({ icon: Icon, label, value, color, sub }) {
  return (
    <div className="card" style={{ padding: 20, display: 'flex', gap: 16, alignItems: 'flex-start' }}>
      <div style={{
        width: 44, height: 44, borderRadius: 12,
        background: `${color}15`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <Icon size={20} color={color} />
      </div>
      <div>
        <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{value}</div>
        <div style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 500 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{sub}</div>}
      </div>
    </div>
  );
}

function AttendanceBar({ name, cls, percentage }) {
  const color = percentage >= 80 ? '#10b981' : percentage >= 60 ? '#f59e0b' : '#ef4444';
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
        <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{name}</span>
        <span style={{ fontSize: 12, color, fontWeight: 600 }}>{percentage}%</span>
      </div>
      <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3 }}>
        <div style={{ height: '100%', width: `${percentage}%`, background: color, borderRadius: 3, transition: 'width 0.6s ease' }} />
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>Class {cls}</div>
    </div>
  );
}

export default function Dashboard() {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [attendanceSummary, setAttendanceSummary] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      api.analytics.dashboard(),
      api.attendance.summary(),
      api.notifications.list({ role: user?.role }),
    ]).then(([dash, att, notifs]) => {
      setData(dash);
      setAttendanceSummary(att.slice(0, 5));
      setNotifications(notifs.filter(n => !n.read).slice(0, 4));
    }).finally(() => setLoading(false));
  }, [user]);

  if (loading) return <div className="loading"><div className="spinner" />Loading dashboard...</div>;

  const greeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">{greeting()}, {user?.name?.split(' ')[0]}</h1>
        <p className="page-subtitle">Here's what's happening at your school today.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 16, marginBottom: 28 }}>
        <StatCard icon={Users} label="Total Students" value={data?.totalStudents} color="#4f46e5" />
        <StatCard icon={CalendarCheck} label="Present Today" value={`${data?.todayPresent}/${data?.todayTotal}`} color="#10b981" sub={`${data?.todayTotal > 0 ? Math.round((data.todayPresent / data.todayTotal) * 100) : 0}% attendance`} />
        <StatCard icon={BookOpen} label="Active Assignments" value={data?.activeHomework} color="#f59e0b" />
        <StatCard icon={MessageSquare} label="Upcoming PTMs" value={data?.pendingMeetings} color="#06b6d4" />
        <StatCard icon={Bell} label="Unread Alerts" value={data?.unreadNotifications} color="#ef4444" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Attendance Overview</h3>
          {attendanceSummary.length === 0 ? (
            <div className="empty-state"><div style={{ fontSize: 13 }}>No attendance data</div></div>
          ) : (
            attendanceSummary.map(s => (
              <AttendanceBar key={s.studentId} name={s.studentName} cls={s.class} percentage={s.percentage} />
            ))
          )}
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Subject Performance</h3>
          {data?.subjectPerformance?.map(sp => (
            <div key={sp.subject} style={{ marginBottom: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 5 }}>
                <span style={{ fontSize: 13, color: 'var(--text-primary)', fontWeight: 500 }}>{sp.subject}</span>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontWeight: 600 }}>{sp.average}%</span>
              </div>
              <div style={{ height: 6, background: 'var(--surface-2)', borderRadius: 3 }}>
                <div style={{ height: '100%', width: `${sp.average}%`, background: 'linear-gradient(90deg, #4f46e5, #06b6d4)', borderRadius: 3, transition: 'width 0.6s ease' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {notifications.length > 0 && (
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 16, color: 'var(--text-primary)' }}>Recent Alerts</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {notifications.map(n => {
              const colors = { info: '#3b82f6', warning: '#f59e0b', alert: '#ef4444' };
              const color = colors[n.type] || '#3b82f6';
              return (
                <div key={n.id} style={{
                  display: 'flex', alignItems: 'flex-start', gap: 12,
                  padding: '12px 14px', background: `${color}08`,
                  borderRadius: 8, border: `1px solid ${color}20`
                }}>
                  <AlertCircle size={16} color={color} style={{ marginTop: 1, flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{n.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{n.message}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
