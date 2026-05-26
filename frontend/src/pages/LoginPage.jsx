import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.jsx';
import { api } from '../api.js';
import { GraduationCap, Eye, EyeOff } from 'lucide-react';

const demoAccounts = [
  { label: 'Admin', email: 'admin@edusync.com', password: 'admin123', color: '#4f46e5' },
  { label: 'Teacher', email: 'teacher@edusync.com', password: 'teacher123', color: '#06b6d4' },
  { label: 'Parent', email: 'parent@edusync.com', password: 'parent123', color: '#f59e0b' },
  { label: 'Student', email: 'student@edusync.com', password: 'student123', color: '#10b981' },
];

export default function LoginPage() {
  const { login } = useAuth();
  const [email, setEmail] = useState('admin@edusync.com');
  const [password, setPassword] = useState('admin123');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const { user } = await api.auth.login(email, password);
      login(user);
    } catch (err) {
      setError(err.message || 'Invalid credentials');
    } finally {
      setLoading(false);
    }
  };

  const fillDemo = (account) => {
    setEmail(account.email);
    setPassword(account.password);
    setError('');
  };

  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f172a 0%, #1e1b4b 50%, #0f172a 100%)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: 20,
    }}>
      <div style={{ width: '100%', maxWidth: 420 }}>
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64,
            background: 'linear-gradient(135deg, #4f46e5, #06b6d4)',
            borderRadius: 18,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 40px rgba(79,70,229,0.4)',
          }}>
            <GraduationCap size={32} color="white" />
          </div>
          <h1 style={{ color: 'white', fontSize: 28, fontFamily: 'Space Grotesk', marginBottom: 6 }}>EduSync AI</h1>
          <p style={{ color: '#94a3b8', fontSize: 14 }}>Smart School Management Platform</p>
        </div>

        <div style={{ background: 'rgba(255,255,255,0.05)', borderRadius: 20, border: '1px solid rgba(255,255,255,0.1)', padding: 32, backdropFilter: 'blur(12px)' }}>
          <h2 style={{ color: 'white', fontSize: 18, marginBottom: 24, fontFamily: 'Space Grotesk' }}>Sign in to your account</h2>

          <div style={{ marginBottom: 20 }}>
            <p style={{ color: '#94a3b8', fontSize: 11, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 10 }}>Quick demo access</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8 }}>
              {demoAccounts.map(acc => (
                <button
                  key={acc.label}
                  onClick={() => fillDemo(acc)}
                  style={{
                    padding: '8px 12px',
                    borderRadius: 8,
                    border: `1.5px solid ${email === acc.email ? acc.color : 'rgba(255,255,255,0.1)'}`,
                    background: email === acc.email ? `${acc.color}20` : 'rgba(255,255,255,0.03)',
                    color: email === acc.email ? acc.color : '#94a3b8',
                    fontSize: 12,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.15s',
                  }}
                >
                  {acc.label}
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="form-group">
              <label className="form-label" style={{ color: '#94a3b8' }}>Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="form-input"
                style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: 'white' }}
                placeholder="Enter your email"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" style={{ color: '#94a3b8' }}>Password</label>
              <div style={{ position: 'relative' }}>
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="form-input"
                  style={{ background: 'rgba(255,255,255,0.07)', borderColor: 'rgba(255,255,255,0.12)', color: 'white', width: '100%', paddingRight: 42 }}
                  placeholder="Enter your password"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', background: 'none', border: 'none', color: '#94a3b8', padding: 0 }}
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
            </div>

            {error && (
              <div style={{ background: 'rgba(239,68,68,0.15)', border: '1px solid rgba(239,68,68,0.3)', color: '#fca5a5', padding: '10px 14px', borderRadius: 8, fontSize: 13 }}>
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              style={{
                padding: '12px',
                background: loading ? '#3730a3' : 'linear-gradient(135deg, #4f46e5, #06b6d4)',
                color: 'white',
                border: 'none',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: loading ? 'not-allowed' : 'pointer',
                transition: 'all 0.2s',
                boxShadow: '0 4px 15px rgba(79,70,229,0.3)',
              }}
            >
              {loading ? 'Signing in...' : 'Sign in'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
