import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Shield, Lock, Eye, EyeOff, ArrowLeft, AlertTriangle, Fingerprint } from 'lucide-react';

export default function AdminLoginPage() {
  const { user, loginAsAdmin, addToast } = useApp();

  // Redirect if already logged in as admin
  useEffect(() => {
    if (user && user.role === 'admin') {
      navigate('/admin');
    }
  }, [user, navigate]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (!email.trim() || !password.trim()) { setError('Please fill in all fields.'); return; }
    if (attempts >= 5) { setError('Too many failed attempts. Please try again later.'); return; }

    setLoading(true);
    try {
      await loginAsAdmin(email, password);
      addToast('success', 'Welcome, Admin!', 'You have full dashboard access.');
      navigate('/admin');
    } catch (err) {
      setAttempts(p => p + 1);
      setError(err.message || 'Authentication failed.');
    }
    setLoading(false);
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: '#0f0f0f', padding: 20,
    }}>
      <div style={{
        width: '100%', maxWidth: 420,
        background: 'rgba(255,255,255,0.04)',
        border: '1px solid rgba(255,255,255,0.09)',
        borderRadius: 'var(--radius-xl)',
        padding: '48px 40px',
        backdropFilter: 'blur(20px)',
      }}>
        {/* Icon */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{
            width: 64, height: 64, borderRadius: 'var(--radius-lg)',
            background: 'rgba(239,68,68,0.12)',
            border: '1px solid rgba(239,68,68,0.25)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <Shield size={28} color="#f87171" />
          </div>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', color: 'white', marginBottom: 6 }}>
            Admin Access
          </h1>
          <p style={{ fontSize: '0.875rem', color: 'rgba(255,255,255,0.4)' }}>
            Restricted area — authorized personnel only
          </p>
        </div>

        {/* Security badge */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 8,
          padding: '10px 14px', background: 'rgba(255,255,255,0.04)',
          borderRadius: 'var(--radius-md)', marginBottom: 28,
          border: '1px solid rgba(255,255,255,0.07)',
        }}>
          <Fingerprint size={14} color="rgba(255,255,255,0.35)" />
          <span style={{ fontSize: '0.75rem', color: 'rgba(255,255,255,0.35)' }}>
            🔒 Encrypted connection · Session monitored
          </span>
        </div>

        {/* Error */}
        {error && (
          <div style={{
            display: 'flex', gap: 10, padding: '12px 14px',
            background: 'rgba(239,68,68,0.1)', borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(239,68,68,0.25)', marginBottom: 20,
          }}>
            <AlertTriangle size={15} color="#f87171" style={{ flexShrink: 0, marginTop: 1 }} />
            <p style={{ fontSize: '0.82rem', color: '#fca5a5', lineHeight: 1.5 }}>{error}</p>
          </div>
        )}

        <form onSubmit={handleSubmit}>
          {/* Email */}
          <div className="field">
            <label className="field-label" style={{ color: 'rgba(255,255,255,0.5)' }}>Admin email</label>
            <input
              type="email"
              className="field-input"
              placeholder="admin@foodconnect.com"
              value={email}
              onChange={e => { setEmail(e.target.value); setError(''); }}
              autoFocus
              autoComplete="email"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'white' }}
            />
          </div>

          {/* Password */}
          <div className="field">
            <label className="field-label" style={{ color: 'rgba(255,255,255,0.5)' }}>Password</label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                className="field-input"
                placeholder="Enter admin password"
                value={password}
                onChange={e => { setPassword(e.target.value); setError(''); }}
                autoComplete="current-password"
                style={{ background: 'rgba(255,255,255,0.06)', border: '1.5px solid rgba(255,255,255,0.1)', color: 'white', paddingRight: 44 }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(v => !v)}
                style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: 'rgba(255,255,255,0.4)', background: 'none', border: 'none', cursor: 'pointer', padding: 4 }}
              >
                {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
              </button>
            </div>
          </div>

          {/* Attempt counter */}
          {attempts > 0 && (
            <p style={{ fontSize: '0.75rem', color: attempts >= 3 ? '#f87171' : 'rgba(255,255,255,0.3)', marginBottom: 16, textAlign: 'right' }}>
              {5 - attempts} attempt{5 - attempts !== 1 ? 's' : ''} remaining
            </p>
          )}

          <button
            type="submit"
            className="btn btn-lg"
            disabled={loading || attempts >= 5}
            style={{ width: '100%', justifyContent: 'center', background: 'linear-gradient(135deg, #ef4444, #dc2626)', color: 'white', border: 'none', marginBottom: 20 }}
          >
            {loading ? <><span className="spinner" style={{ borderColor: 'white', borderRightColor: 'transparent' }} /> Authenticating…</> : <><Lock size={16} /> Sign in as Admin</>}
          </button>
        </form>

        <div style={{ textAlign: 'center', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
          <Link to="/login" style={{ fontSize: '0.82rem', color: 'rgba(255,255,255,0.35)', display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <ArrowLeft size={13} /> Back to regular login
          </Link>
        </div>
      </div>
    </div>
  );
}
