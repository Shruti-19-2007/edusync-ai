import React, { useState } from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext.jsx';
import {
  LayoutDashboard, Users, CalendarCheck, BookOpen,
  MessageSquare, Bell, BarChart3, LogOut, Menu, X, GraduationCap
} from 'lucide-react';

const navItems = [
  { to: '/', icon: LayoutDashboard, label: 'Dashboard', roles: ['admin', 'teacher', 'parent', 'student'] },
  { to: '/students', icon: Users, label: 'Students', roles: ['admin', 'teacher'] },
  { to: '/attendance', icon: CalendarCheck, label: 'Attendance', roles: ['admin', 'teacher', 'parent', 'student'] },
  { to: '/homework', icon: BookOpen, label: 'Homework', roles: ['admin', 'teacher', 'parent', 'student'] },
  { to: '/ptm', icon: MessageSquare, label: 'PTM Meetings', roles: ['admin', 'teacher', 'parent'] },
  { to: '/notifications', icon: Bell, label: 'Notifications', roles: ['admin', 'teacher', 'parent', 'student'] },
  { to: '/analytics', icon: BarChart3, label: 'Analytics', roles: ['admin', 'teacher'] },
];

export default function Layout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const roleColors = { admin: '#4f46e5', teacher: '#06b6d4', parent: '#f59e0b', student: '#10b981' };
  const roleColor = roleColors[user?.role] || '#4f46e5';

  const filtered = navItems.filter(item => item.roles.includes(user?.role));

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {sidebarOpen && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 40 }}
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <aside style={{
        width: 240,
        background: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        flexShrink: 0,
        position: 'relative',
        zIndex: 50,
        transform: sidebarOpen || window.innerWidth >= 768 ? 'translateX(0)' : 'translateX(-100%)',
        transition: 'transform 0.25s ease',
      }}>
        <div style={{ padding: '24px 20px', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: `linear-gradient(135deg, #4f46e5, #06b6d4)`,
              display: 'flex', alignItems: 'center', justifyContent: 'center'
            }}>
              <GraduationCap size={20} color="white" />
            </div>
            <div>
              <div style={{ color: 'white', fontWeight: 700, fontSize: 15, fontFamily: 'Space Grotesk' }}>EduSync</div>
              <div style={{ color: '#94a3b8', fontSize: 11 }}>AI School Manager</div>
            </div>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '12px 12px', display: 'flex', flexDirection: 'column', gap: 2 }}>
          {filtered.map(({ to, icon: Icon, label }) => (
            <NavLink
              key={to}
              to={to}
              end={to === '/'}
              onClick={() => setSidebarOpen(false)}
              style={({ isActive }) => ({
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                padding: '9px 12px',
                borderRadius: 8,
                color: isActive ? 'white' : '#94a3b8',
                background: isActive ? 'rgba(79,70,229,0.25)' : 'transparent',
                borderLeft: isActive ? '3px solid #4f46e5' : '3px solid transparent',
                fontSize: 13,
                fontWeight: 500,
                transition: 'all 0.15s ease',
                textDecoration: 'none',
              })}
            >
              <Icon size={16} />
              {label}
            </NavLink>
          ))}
        </nav>

        <div style={{ padding: '16px', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{
              width: 34, height: 34, borderRadius: '50%',
              background: roleColor,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              color: 'white', fontSize: 13, fontWeight: 700
            }}>
              {user?.name?.charAt(0)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ color: 'white', fontSize: 13, fontWeight: 600, truncate: true, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.name}</div>
              <div style={{ color: '#64748b', fontSize: 11, textTransform: 'capitalize' }}>{user?.role}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="btn btn-secondary"
            style={{ width: '100%', justifyContent: 'center', background: 'rgba(255,255,255,0.05)', color: '#94a3b8', border: '1px solid rgba(255,255,255,0.08)', fontSize: 12 }}
          >
            <LogOut size={13} /> Sign out
          </button>
        </div>
      </aside>

      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        <header style={{
          height: 56,
          background: 'white',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          padding: '0 20px',
          gap: 12,
          flexShrink: 0,
        }}>
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            style={{ background: 'none', border: 'none', color: '#64748b', padding: 4, display: 'flex' }}
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
          <div style={{ flex: 1 }} />
          <div style={{
            background: `${roleColor}20`,
            color: roleColor,
            padding: '4px 10px',
            borderRadius: 20,
            fontSize: 11,
            fontWeight: 700,
            textTransform: 'uppercase',
            letterSpacing: '0.5px'
          }}>
            {user?.role}
          </div>
        </header>

        <main style={{ flex: 1, overflow: 'auto', padding: 24 }}>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
