import React, { useEffect, useState } from 'react';
import { api } from '../api.js';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell, Legend } from 'recharts';
import { TrendingUp, Users, BookOpen, CalendarCheck } from 'lucide-react';

const COLORS = ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b', '#ef4444'];

function MetricCard({ label, value, icon: Icon, color, suffix = '' }) {
  return (
    <div className="card" style={{ padding: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 6 }}>{label}</div>
          <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'Space Grotesk', color: 'var(--text-primary)' }}>{value}{suffix}</div>
        </div>
        <div style={{ width: 44, height: 44, borderRadius: 12, background: `${color}15`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <Icon size={22} color={color} />
        </div>
      </div>
    </div>
  );
}

export default function AnalyticsPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.analytics.dashboard().then(setData).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="loading"><div className="spinner" />Loading analytics...</div>;

  const attendanceRate = data?.todayTotal > 0 ? Math.round((data.todayPresent / data.todayTotal) * 100) : 0;

  return (
    <div className="fade-in">
      <div className="page-header">
        <h1 className="page-title">Analytics</h1>
        <p className="page-subtitle">School performance overview and insights</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 16, marginBottom: 28 }}>
        <MetricCard label="Total Students" value={data?.totalStudents} icon={Users} color="#4f46e5" />
        <MetricCard label="Today's Attendance" value={attendanceRate} suffix="%" icon={CalendarCheck} color="#10b981" />
        <MetricCard label="Active Homework" value={data?.activeHomework} icon={BookOpen} color="#f59e0b" />
        <MetricCard label="Upcoming PTMs" value={data?.pendingMeetings} icon={TrendingUp} color="#06b6d4" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Subject Performance (Class Average)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.subjectPerformance} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="subject" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}%`, 'Average']}
              />
              <Bar dataKey="average" fill="#4f46e5" radius={[4, 4, 0, 0]}>
                {data?.subjectPerformance?.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Attendance by Class</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.classBreakdown} margin={{ top: 0, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="class" tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <YAxis domain={[0, 100]} tick={{ fontSize: 11, fill: '#94a3b8' }} />
              <Tooltip
                contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }}
                formatter={(v) => [`${v}%`, 'Attendance Rate']}
              />
              <Bar dataKey="attendanceRate" fill="#10b981" radius={[4, 4, 0, 0]}>
                {data?.classBreakdown?.map((_, i) => (
                  <Cell key={i} fill={['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'][i % 4]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>Class Distribution</h3>
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie data={data?.classBreakdown} dataKey="students" nameKey="class" cx="50%" cy="50%" outerRadius={80} label={({ name, value }) => `${name}: ${value}`} labelLine={false}>
                {data?.classBreakdown?.map((_, i) => (
                  <Cell key={i} fill={COLORS[i % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip contentStyle={{ background: 'white', border: '1px solid #e2e8f0', borderRadius: 8, fontSize: 12 }} />
            </PieChart>
          </ResponsiveContainer>
        </div>

        <div className="card" style={{ padding: 20 }}>
          <h3 style={{ fontSize: 14, fontWeight: 700, marginBottom: 20 }}>School Summary</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {[
              { label: 'Total Students', value: data?.totalStudents, color: '#4f46e5' },
              { label: 'Total Teachers', value: data?.totalTeachers, color: '#06b6d4' },
              { label: 'Today Present', value: `${data?.todayPresent}/${data?.todayTotal}`, color: '#10b981' },
              { label: 'Active Assignments', value: data?.activeHomework, color: '#f59e0b' },
              { label: 'Pending PTMs', value: data?.pendingMeetings, color: '#ec4899' },
            ].map(item => (
              <div key={item.label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 14px', background: 'var(--surface-0)', borderRadius: 8 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: item.color }} />
                  <span style={{ fontSize: 13, color: 'var(--text-secondary)' }}>{item.label}</span>
                </div>
                <span style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', fontFamily: 'Space Grotesk' }}>{item.value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
