import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Eye, EyeOff, ArrowLeft, AlertTriangle, Fingerprint } from 'lucide-react';

export default function AdminLoginPage() {
  const { loginAsAdmin, addToast } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');

    if (!email.trim() || !password.trim()) {
      setError('Please fill in all fields');
      return;
    }

    if (attempts >= 5) {
      setError('Too many failed attempts. Please try again later.');
      return;
    }

    setLoading(true);
    try {
      await loginAsAdmin(email, password);
      addToast('success', 'Welcome, Admin!', 'You have full dashboard access');
      navigate('/admin');
    } catch (err) {
      setAttempts(prev => prev + 1);
      setError(err.message || 'Authentication failed');
      addToast('error', 'Access Denied', err.message || 'Invalid credentials');
    }
    setLoading(false);
  }

  return (
    <div className="login-page" style={{
      background: 'linear-gradient(135deg, var(--slate-900) 0%, var(--slate-800) 50%, var(--slate-900) 100%)'
    }}>
      <div className="login-card" style={{
        background: 'rgba(255,255,255,0.05)',
        backdropFilter: 'blur(20px)',
        border: '1px solid rgba(255,255,255,0.1)',
        color: 'white',
        maxWidth: '420px'
      }}>
        {/* Header */}
        <div className="login-header">
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(239,68,68,0.2), rgba(249,115,22,0.2))',
            border: '1px solid rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
            boxShadow: '0 0 30px rgba(239,68,68,0.15)'
          }}>
            <Shield size={28} style={{ color: '#f87171' }} />
          </div>
          <h2 style={{ color: 'white', fontSize: '1.4rem' }}>Admin Access</h2>
          <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>
            Restricted area — authorized personnel only
          </p>
        </div>

        {/* Security Badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          padding: '10px 14px', background: 'rgba(255,255,255,0.05)',
          borderRadius: 'var(--radius-md)', marginBottom: '24px',
          border: '1px solid rgba(255,255,255,0.08)'
        }}>
          <Fingerprint size={16} style={{ color: 'var(--slate-400)' }} />
          <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', letterSpacing: '0.03em' }}>
            🔒 Encrypted connection • Session monitored
          </span>
        </div>

        {/* Error Message */}
        {error && (
          <div style={{
            display: 'flex', gap: '10px', padding: '12px 14px',
            background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239,68,68,0.3)', marginBottom: '20px',
            animation: 'scaleIn 0.3s ease'
          }}>
            <AlertTriangle size={16} style={{ color: '#f87171', flexShrink: 0, marginTop: 2 }} />
            <p style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>
              {error}
            </p>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--slate-300)' }}>
              Admin Email
            </label>
            <input
              type="email"
              className="form-input"
              placeholder="admin@foodconnect.com"
              value={email}
              onChange={(e) => { setEmail(e.target.value); setError(''); }}
              autoFocus
              autoComplete="email"
              style={{
                background: 'rgba(255,255,255,0.06)',
                border: '2px solid rgba(255,255,255,0.1)',
                color: 'white',
              }}
            />
          </div>

          <div className="form-group">
            <label className="form-label" style={{ color: 'var(--slate-300)' }}>
              Password
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="form-input"
                placeholder="Enter admin password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '2px solid rgba(255,255,255,0.1)',
                  color: 'white',
                  paddingRight: '48px'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '12px', top: '50%',
                  transform: 'translateY(-50%)', color: 'var(--slate-400)',
                  background: 'none', border: 'none', cursor: 'pointer',
                  padding: '4px'
                }}
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          {/* Attempt counter */}
          {attempts > 0 && (
            <p style={{
              fontSize: '0.75rem', color: attempts >= 3 ? '#f87171' : 'var(--slate-400)',
              marginBottom: '16px', textAlign: 'right'
            }}>
              {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
            </p>
          )}

          <button
            type="submit"
            className="btn btn-lg"
            disabled={loading || attempts >= 5}
            style={{
              width: '100%',
              background: 'linear-gradient(135deg, #ef4444, #dc2626)',
              color: 'white',
              boxShadow: '0 4px 14px rgba(239,68,68,0.3)',
              marginBottom: '16px'
            }}
          >
            {loading ? (
              <><span className="spinner" /> Authenticating...</>
            ) : (
              <><Lock size={16} /> Sign In as Admin</>
            )}
          </button>
        </form>

        {/* Back to regular login */}
        <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button
            onClick={() => navigate('/login')}
            style={{
              fontSize: '0.82rem', color: 'var(--slate-400)',
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              background: 'none', border: 'none', cursor: 'pointer'
            }}
          >
            <ArrowLeft size={14} /> Back to regular login
          </button>
        </div>
      </div>
    </div>
  );
}
