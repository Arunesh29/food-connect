import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, HandHeart, Truck, ArrowRight, Leaf, Lock } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, setUserRole, addToast, loginWithEmail, registerWithEmail } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState('login'); // login, email, role
  const [isRegister, setIsRegister] = useState(false);
  const [googleUser, setGoogleUser] = useState(null);
  const [signingIn, setSigningIn] = useState(false);
  const [formData, setFormData] = useState({ email: '', password: '', name: '' });

  async function handleGoogleSignIn() {
    setSigningIn(true);
    try {
      const gUser = await loginWithGoogle();
      setGoogleUser(gUser);
      setStep('role');
      addToast('success', 'Signed In!', `Welcome, ${gUser.name}`);
    } catch (error) {
      console.error('Login Error:', error);
      if (error.code === 'auth/unauthorized-domain') {
        addToast('error', 'Security Block', 'Domain not authorized in Firebase Console. Adding soon...');
      } else {
        addToast('error', 'Sign-in Failed', error.message || 'Could not sign in with Google');
      }
    }
    setSigningIn(false);
  }

  async function handleEmailAuth(e) {
    e.preventDefault();
    setSigningIn(true);
    try {
      let userData;
      if (isRegister) {
        if (!formData.name) throw new Error('Please enter your name');
        userData = await registerWithEmail(formData.email, formData.password, formData.name);
        addToast('success', 'Account Created!', 'Please now pick your role.');
      } else {
        userData = await loginWithEmail(formData.email, formData.password);
        addToast('success', 'Welcome Back!', `Logged in as ${userData.name}`);
      }

      setGoogleUser(userData);
      
      if (userData.role) {
        // If they already have a role (and it's a login), go straight to it
        navigate(`/${userData.role}`);
      } else {
        setStep('role');
      }
    } catch (err) {
      addToast('error', 'Auth Failed', err.message);
    }
    setSigningIn(false);
  }

  async function handleRoleSelect(role) {
    if (!googleUser) return;
    await setUserRole(googleUser, role);
    const routes = { donor: '/donor', receiver: '/receiver', volunteer: '/volunteer' };
    navigate(routes[role]);
  }

  return (
    <div className="login-page">
      <div className="login-card">
        <div className="login-header">
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', marginBottom: '16px' }}>
            {googleUser?.photoURL ? (
              <img
                src={googleUser.photoURL}
                alt={googleUser.name}
                style={{
                  width: 56, height: 56, borderRadius: '50%',
                  border: '3px solid var(--green-400)',
                  boxShadow: 'var(--shadow-green)'
                }}
              />
            ) : (
              <div className="navbar-brand-icon" style={{ width: 48, height: 48 }}>
                <Leaf size={24} />
              </div>
            )}
          </div>

          {(step === 'login' || step === 'email') && (
            <>
              <h2>Welcome to Food Connect</h2>
              <p>Join the movement to reduce food waste</p>
            </>
          )}

          {step === 'role' && (
            <>
              <h2>Choose Your Role</h2>
              <p>Hi <strong>{googleUser?.name || 'there'}</strong>! How would you like to participate?</p>
            </>
          )}
        </div>

        {step === 'login' && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <button
              className="btn btn-lg"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              style={{
                width: '100%', background: 'white',
                border: '2px solid var(--slate-200)',
                color: 'var(--slate-700)',
                gap: '12px', fontWeight: 600
              }}
            >
              {signingIn ? <span className="spinner" /> : (
                <svg width="20" height="20" viewBox="0 0 24 24">
                  <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                  <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                  <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                  <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                </svg>
              )}
              Continue with Google
            </button>

            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', margin: '10px 0' }}>
              <div style={{ flex: 1, height: '1px', background: 'var(--slate-100)' }} />
              <span style={{ fontSize: '0.75rem', color: 'var(--slate-400)', fontWeight: 600 }}>OR</span>
              <div style={{ flex: 1, height: '1px', background: 'var(--slate-100)' }} />
            </div>

            <button
              className="btn btn-lg btn-outline"
              onClick={() => setStep('email')}
              style={{ width: '100%', gap: '10px' }}
            >
              Sign in with Email
            </button>
          </div>
        )}

        {step === 'email' && (
          <form onSubmit={handleEmailAuth} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            {isRegister && (
              <div className="form-group">
                <label>Full Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Your Name"
                  required
                  value={formData.name}
                  onChange={e => setFormData({ ...formData, name: e.target.value })}
                />
              </div>
            )}
            <div className="form-group">
              <label>Email Address</label>
              <input
                type="email"
                className="form-control"
                placeholder="email@example.com"
                required
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
              />
            </div>
            <div className="form-group">
              <label>Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="Min. 6 characters"
                required
                minLength={6}
                value={formData.password}
                onChange={e => setFormData({ ...formData, password: e.target.value })}
              />
            </div>

            <button type="submit" className="btn btn-lg btn-primary" disabled={signingIn} style={{ width: '100%' }}>
              {signingIn ? <span className="spinner" /> : (isRegister ? 'Create Account' : 'Sign In')}
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setIsRegister(!isRegister)}
              style={{ fontSize: '0.85rem' }}
            >
              {isRegister ? 'Already have an account? Sign in' : "Don't have an account? Sign up"}
            </button>

            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => setStep('login')}
              style={{ fontSize: '0.8rem', color: 'var(--slate-400)' }}
            >
              ← Back to Google Sign-in
            </button>
          </form>
        )}

        {step === 'role' && (
          <div className="login-roles">
            <button className="login-role-btn donor" onClick={() => handleRoleSelect('donor')}>
              <div className="login-role-icon"><Heart size={22} /></div>
              <div className="login-role-info">
                <h3>Food Donor</h3>
                <p>Post surplus food for those in need</p>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--slate-400)' }} />
            </button>

            <button className="login-role-btn receiver" onClick={() => handleRoleSelect('receiver')}>
              <div className="login-role-icon"><HandHeart size={22} /></div>
              <div className="login-role-info">
                <h3>Food Receiver</h3>
                <p>Find and request available food</p>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--slate-400)' }} />
            </button>

            <button className="login-role-btn volunteer" onClick={() => handleRoleSelect('volunteer')}>
              <div className="login-role-icon"><Truck size={22} /></div>
              <div className="login-role-info">
                <h3>Volunteer</h3>
                <p>Pick up and deliver food donations</p>
              </div>
              <ArrowRight size={16} style={{ marginLeft: 'auto', color: 'var(--slate-400)' }} />
            </button>
          </div>
        )}

        {step !== 'role' && (
          <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid var(--slate-100)', marginTop: '20px' }}>
            <p style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginBottom: '4px' }}>
              Are you an administrator?
            </p>
            <a
              href="/admin-login"
              onClick={(e) => { e.preventDefault(); navigate('/admin-login'); }}
              style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--slate-500)' }}
            >
              <Lock size={12} /> Secure Admin Access
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
