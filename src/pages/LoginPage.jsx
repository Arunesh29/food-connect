import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Heart, HandHeart, Truck, ArrowRight, Leaf, Lock } from 'lucide-react';

export default function LoginPage() {
  const { loginWithGoogle, setUserRole, addToast } = useApp();
  const navigate = useNavigate();
  const [step, setStep] = useState('login');
  const [googleUser, setGoogleUser] = useState(null);
  const [signingIn, setSigningIn] = useState(false);

  async function handleGoogleSignIn() {
    setSigningIn(true);
    try {
      const gUser = await loginWithGoogle();
      setGoogleUser(gUser);
      setStep('role');
      addToast('success', 'Signed In!', `Welcome, ${gUser.name}`);
    } catch (error) {
      addToast('error', 'Sign-in Failed', error.message || 'Could not sign in with Google');
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

          {step === 'login' ? (
            <>
              <h2>Welcome to Food Connect</h2>
              <p>Sign in with your Google account to get started</p>
            </>
          ) : (
            <>
              <h2>Choose Your Role</h2>
              <p>Hi <strong>{googleUser?.name || 'there'}</strong>! How would you like to participate?</p>
              {googleUser?.email && (
                <p style={{ fontSize: '0.78rem', color: 'var(--slate-400)', marginTop: '4px' }}>
                  {googleUser.email}
                </p>
              )}
            </>
          )}
        </div>

        {step === 'login' ? (
          <div>
            <button
              className="btn btn-lg"
              onClick={handleGoogleSignIn}
              disabled={signingIn}
              style={{
                width: '100%', background: 'white',
                border: '2px solid var(--slate-200)',
                color: 'var(--slate-700)', marginBottom: '20px',
                gap: '12px', fontWeight: 600
              }}
            >
              {signingIn ? (
                <><span className="spinner" /> Signing in...</>
              ) : (
                <>
                  <svg width="20" height="20" viewBox="0 0 24 24">
                    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 01-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
                    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
                    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
                    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
                  </svg>
                  Continue with Google
                </>
              )}
            </button>

            {/* Admin link */}
            <div style={{ textAlign: 'center', paddingTop: '16px', borderTop: '1px solid var(--slate-100)' }}>
              <p style={{ fontSize: '0.82rem', color: 'var(--slate-400)', marginBottom: '8px' }}>
                Are you an administrator?
              </p>
              <a
                href="/admin-login"
                onClick={(e) => { e.preventDefault(); navigate('/admin-login'); }}
                style={{
                  fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-600)',
                  display: 'inline-flex', alignItems: 'center', gap: '6px'
                }}
              >
                <Lock size={14} /> Admin Login →
              </a>
            </div>
          </div>
        ) : (
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
      </div>
    </div>
  );
}
