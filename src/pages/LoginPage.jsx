import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, ShoppingBag, Bike, ArrowRight, Chrome } from 'lucide-react';

export default function LoginPage({ selectionOnly }) {
  const { user, loginWithGoogle, setUserRole, loginWithEmail, registerWithEmail, addToast } = useApp();
  const navigate = useNavigate();

  const [mode, setMode] = useState('google'); // 'google' | 'email' | 'register' | 'role'
  const [loading, setLoading] = useState(false);
  const [pendingUser, setPendingUser] = useState(selectionOnly ? user : null);
  const [form, setForm] = useState({ name: '', email: '', password: '' });

  // Redirect if already logged in
  useEffect(() => {
    if (user && user.role && !selectionOnly) {
      navigate(`/${user.role}`);
    }
  }, [user, navigate, selectionOnly]);

  // If selectionOnly (user logged in, no role) go straight to role pick
  if (selectionOnly && !pendingUser && user) {
    setPendingUser(user);
  }

  async function handleGoogle() {
    setLoading(true);
    try {
      const u = await loginWithGoogle();
      if (u.role) {
        navigate(`/${u.role}`);
      } else {
        setPendingUser(u);
        setMode('role');
      }
    } catch {
      addToast('error', 'Sign-in failed', 'Could not sign in with Google.');
    }
    setLoading(false);
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setLoading(true);
    try {
      let u;
      if (mode === 'register') {
        if (!form.name.trim()) throw new Error('Name is required');
        u = await registerWithEmail(form.email, form.password, form.name);
      } else {
        u = await loginWithEmail(form.email, form.password);
      }
      if (u.role) navigate(`/${u.role}`);
      else { setPendingUser(u); setMode('role'); }
    } catch (err) {
      addToast('error', 'Authentication failed', err.message);
    }
    setLoading(false);
  }

  async function handleRoleSelect(role) {
    setLoading(true);
    try {
      await setUserRole(pendingUser, role);
      navigate(`/${role}`);
    } catch {
      addToast('error', 'Something went wrong', 'Could not set your role.');
    }
    setLoading(false);
  }

  const roles = [
    { id: 'donor', label: 'Donor', icon: <Heart size={22} />, desc: 'I have food to share' },
    { id: 'receiver', label: 'Receiver', icon: <ShoppingBag size={22} />, desc: 'I need food' },
    { id: 'volunteer', label: 'Volunteer', icon: <Bike size={22} />, desc: 'I want to deliver' },
  ];

  return (
    <div className="auth-wrap">
      {/* Visual side */}
      <div className="auth-visual">
        <img
          src="https://images.unsplash.com/photo-1593113598332-cd288d649433?w=900&q=85"
          alt="Community sharing food"
        />
        <div className="auth-visual-caption">
          <h2 className="display-md" style={{ color: 'white', marginBottom: 12 }}>
            Every meal shared<br />is waste prevented.
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: '0.95rem' }}>
            Join our community of 150+ donors, volunteers, and receivers making a daily difference.
          </p>
        </div>
      </div>

      {/* Form side */}
      <div className="auth-panel">
        <div className="auth-form">
          <Link to="/" className="navbar-logo" style={{ display: 'inline-flex', marginBottom: 40 }}>
            <div className="navbar-logo-mark" style={{ width: 28, height: 28 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ width: 14 }}>
                <path d="M12 2C8 6 4 8 4 14a8 8 0 0016 0c0-6-4-8-8-12z"/>
              </svg>
            </div>
            Food Connect
          </Link>

          {/* ── Role Selection ── */}
          {(mode === 'role' || selectionOnly) && (
            <>
              <h1 className="display-md" style={{ marginBottom: 8 }}>
                {pendingUser?.name ? `Hi, ${pendingUser.name.split(' ')[0]}!` : 'Welcome!'}
              </h1>
              <p className="body-sm" style={{ marginBottom: 36 }}>What brings you here today?</p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
                {roles.map(role => (
                  <button
                    key={role.id}
                    className="card"
                    onClick={() => handleRoleSelect(role.id)}
                    disabled={loading}
                    style={{ padding: '20px 24px', display: 'flex', alignItems: 'center', gap: 18, textAlign: 'left', width: '100%', cursor: 'pointer', border: '1.5px solid var(--border)' }}
                  >
                    <div className={`role-icon ${role.id}`} style={{ margin: 0 }}>{role.icon}</div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontWeight: 600 }}>{role.label}</div>
                      <div className="body-sm">{role.desc}</div>
                    </div>
                    <ArrowRight size={18} color="var(--ink-faint)" />
                  </button>
                ))}
              </div>
            </>
          )}

          {/* ── Google / Email start ── */}
          {mode === 'google' && (
            <>
              <h1 className="display-md" style={{ marginBottom: 8 }}>Sign in</h1>
              <p className="body-sm" style={{ marginBottom: 36 }}>Join thousands helping their community.</p>

              <button className="btn btn-secondary" onClick={handleGoogle} disabled={loading} style={{ width: '100%', justifyContent: 'center', gap: 12, marginBottom: 20 }}>
                {loading ? <span className="spinner" /> : (
                  <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.6 0 6.5 1.2 8.9 3.2l6.6-6.6C35.3 2.7 29.9 0 24 0 14.7 0 6.7 5.4 2.8 13.3l7.7 6C12.3 13.6 17.7 9.5 24 9.5z"/><path fill="#4285F4" d="M46.1 24.5c0-1.7-.2-3.3-.5-4.9H24v9.4h12.4c-.6 2.9-2.3 5.3-4.7 7l7.4 5.7c4.3-4 6.9-9.9 6.9-17.2z"/><path fill="#FBBC05" d="M10.5 28.7A14.5 14.5 0 0 1 9.5 24c0-1.6.3-3.2.8-4.7l-7.7-6A23.9 23.9 0 0 0 0 24c0 3.9.9 7.5 2.6 10.7l7.9-6z"/><path fill="#34A853" d="M24 48c6.1 0 11.2-2 14.9-5.5l-7.4-5.7c-2 1.4-4.6 2.2-7.5 2.2-6.3 0-11.7-4.1-13.6-9.8l-7.9 6C6.7 42.6 14.7 48 24 48z"/></svg>
                )}
                Continue with Google
              </button>

              <div className="divider-text">
                <span>or</span>
              </div>

              <button className="btn btn-primary" onClick={() => setMode('email')} style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
                Continue with email
              </button>
              <button className="btn btn-ghost" onClick={() => setMode('register')} style={{ width: '100%', justifyContent: 'center' }}>
                Create account
              </button>
            </>
          )}

          {/* ── Email form ── */}
          {(mode === 'email' || mode === 'register') && (
            <>
              <h1 className="display-md" style={{ marginBottom: 8 }}>
                {mode === 'register' ? 'Create account' : 'Welcome back'}
              </h1>
              <p className="body-sm" style={{ marginBottom: 36 }}>
                {mode === 'register' ? 'Join the community today.' : 'Sign in to your account.'}
              </p>

              <form onSubmit={handleEmailAuth}>
                {mode === 'register' && (
                  <div className="field">
                    <label className="field-label">Full name</label>
                    <input
                      type="text" className="field-input"
                      placeholder="Your name"
                      value={form.name}
                      onChange={e => setForm(f => ({ ...f, name: e.target.value }))}
                      required
                    />
                  </div>
                )}
                <div className="field">
                  <label className="field-label">Email address</label>
                  <input
                    type="email" className="field-input"
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
                    required
                  />
                </div>
                <div className="field">
                  <label className="field-label">Password</label>
                  <input
                    type="password" className="field-input"
                    placeholder="••••••••"
                    value={form.password}
                    onChange={e => setForm(f => ({ ...f, password: e.target.value }))}
                    required minLength={6}
                  />
                </div>

                <button type="submit" className="btn btn-primary" disabled={loading} style={{ width: '100%', justifyContent: 'center', marginBottom: 16 }}>
                  {loading ? <span className="spinner" /> : mode === 'register' ? 'Create account' : 'Sign in'}
                </button>
              </form>

              <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8 }}>
                <button className="btn btn-ghost" onClick={() => setMode('google')} style={{ fontSize: '0.8rem' }}>
                  ← Back
                </button>
                <button className="btn btn-ghost" onClick={() => setMode(mode === 'email' ? 'register' : 'email')} style={{ fontSize: '0.8rem' }}>
                  {mode === 'email' ? 'Need an account?' : 'Already have account?'}
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
