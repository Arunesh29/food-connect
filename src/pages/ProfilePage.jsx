import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useFoods } from '../services/foodService';
import { saveUserProfile } from '../services/userService';
import { User, Mail, Shield, Save, LogOut, Heart, ShoppingBag, Bike, Package, CheckCircle, Clock, RefreshCw, ArrowRight } from 'lucide-react';

const ROLE_META = {
  donor:     { icon: <Heart size={18} />,       label: 'Donor',     desc: 'Post surplus food for the community', color: 'var(--accent)',  bg: 'var(--accent-light)',  link: '/donor',     linkLabel: 'My listings' },
  receiver:  { icon: <ShoppingBag size={18} />, label: 'Receiver',  desc: 'Browse and request available food',   color: 'var(--green)',   bg: 'var(--green-light)',   link: '/receiver',  linkLabel: 'Find food' },
  volunteer: { icon: <Bike size={18} />,         label: 'Volunteer', desc: 'Deliver food to those who need it',   color: '#2a4a8f',        bg: '#e8eef9',              link: '/volunteer', linkLabel: 'Deliveries' },
  admin:     { icon: <Shield size={18} />,       label: 'Admin',     desc: 'Manage and oversee the platform',     color: 'var(--ink)',     bg: 'var(--canvas-warm)',   link: '/admin',     linkLabel: 'Dashboard' },
};

const SWITCHABLE_ROLES = ['donor', 'receiver', 'volunteer'];

export default function ProfilePage() {
  const { user, setUserRole, logout, addToast } = useApp();
  const navigate = useNavigate();
  const { foods } = useFoods();

  const [saving, setSaving] = useState(false);
  const [switching, setSwitching] = useState(null); // which role is being switched to
  const [showSwitch, setShowSwitch] = useState(false);
  const [name, setName] = useState(user?.name || '');

  const role = ROLE_META[user?.role] || ROLE_META.donor;

  // Role-aware stats
  const myStats = (() => {
    if (user?.role === 'donor') {
      const mine = foods.filter(f => f.donorId === user.uid);
      return [
        { icon: <Package size={18} />, label: 'Total posted', value: mine.length },
        { icon: <CheckCircle size={18} />, label: 'Delivered', value: mine.filter(f => f.status === 'delivered').length },
        { icon: <Clock size={18} />, label: 'Active now', value: mine.filter(f => f.status === 'available').length },
      ];
    }
    if (user?.role === 'receiver') {
      const requested = foods.filter(f => f.requestedUsers?.includes(user.uid));
      return [
        { icon: <ShoppingBag size={18} />, label: 'Requests made', value: requested.length },
        { icon: <CheckCircle size={18} />, label: 'Received', value: requested.filter(f => f.status === 'delivered').length },
        { icon: <Clock size={18} />, label: 'Pending', value: requested.filter(f => ['requested','assigned'].includes(f.status)).length },
      ];
    }
    if (user?.role === 'volunteer') {
      const mine = foods.filter(f => f.assignedVolunteer === user.uid);
      return [
        { icon: <Bike size={18} />, label: 'Trips taken', value: mine.length },
        { icon: <CheckCircle size={18} />, label: 'Completed', value: mine.filter(f => f.status === 'delivered').length },
        { icon: <Clock size={18} />, label: 'In progress', value: mine.filter(f => f.status === 'assigned').length },
      ];
    }
    return [];
  })();

  async function handleSave(e) {
    e.preventDefault();
    if (!name.trim()) { addToast('error', 'Name required', 'Please enter your name.'); return; }
    setSaving(true);
    try {
      await saveUserProfile(user.uid, { name: name.trim() });
      addToast('success', 'Saved!', 'Your profile has been updated.');
    } catch {
      addToast('error', 'Save failed', 'Could not update profile right now.');
    }
    setSaving(false);
  }

  async function handleRoleSwitch(newRole) {
    if (newRole === user.role) { setShowSwitch(false); return; }
    setSwitching(newRole);
    try {
      await setUserRole(user, newRole);
      addToast('success', `Switched to ${ROLE_META[newRole].label}`, 'Your role has been updated.');
      setShowSwitch(false);
      navigate(`/${newRole}`);
    } catch {
      addToast('error', 'Switch failed', 'Could not change your role. Please try again.');
    }
    setSwitching(null);
  }

  return (
    <div className="page-shell">
      <div className="wrap" style={{ maxWidth: 860, padding: '64px 48px' }}>

        {/* ── Identity strip ── */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 48, flexWrap: 'wrap' }}>
          {/* Avatar */}
          <div style={{
            width: 80, height: 80, borderRadius: '50%', flexShrink: 0,
            background: role.bg, border: `3px solid ${role.color}33`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            overflow: 'hidden', fontSize: '1.8rem', fontWeight: 700, color: role.color,
          }}>
            {user?.photoURL
              ? <img src={user.photoURL} alt={user.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : user?.name?.charAt(0).toUpperCase()
            }
          </div>

          <div style={{ flex: 1 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 5, flexWrap: 'wrap' }}>
              <h1 style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', fontWeight: 400 }}>{user?.name}</h1>
              <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, padding: '4px 12px', borderRadius: 'var(--radius-pill)', background: role.bg, color: role.color, fontSize: '0.78rem', fontWeight: 600 }}>
                {role.icon} {role.label}
              </span>
            </div>
            <p style={{ color: 'var(--ink-muted)', fontSize: '0.875rem' }}>{user?.email}</p>
          </div>

          <Link to={role.link} className="btn btn-secondary btn-sm">
            {role.linkLabel} →
          </Link>
        </div>

        {/* ── Stats ── */}
        {myStats.length > 0 && (
          <div className="grid-3" style={{ marginBottom: 40 }}>
            {myStats.map((s, i) => (
              <div key={i} className="card" style={{ padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: role.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: role.color, flexShrink: 0 }}>
                  {s.icon}
                </div>
                <div>
                  <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem', lineHeight: 1 }}>{s.value}</div>
                  <div className="body-sm" style={{ marginTop: 3 }}>{s.label}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── Switch Role Card ── */}
        {user?.role !== 'admin' && (
          <div className="card" style={{ marginBottom: 24, overflow: 'hidden' }}>
            <button
              onClick={() => setShowSwitch(v => !v)}
              style={{
                width: '100%', padding: '20px 24px', display: 'flex',
                alignItems: 'center', justifyContent: 'space-between',
                cursor: 'pointer', background: 'none', border: 'none',
                transition: 'background var(--transition)',
              }}
              onMouseEnter={e => e.currentTarget.style.background = 'var(--canvas)'}
              onMouseLeave={e => e.currentTarget.style.background = 'none'}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 14 }}>
                <div style={{ width: 40, height: 40, borderRadius: 'var(--radius-md)', background: 'var(--canvas-warm)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--ink-muted)' }}>
                  <RefreshCw size={18} />
                </div>
                <div style={{ textAlign: 'left' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Switch role</div>
                  <div className="body-sm">Currently: <strong style={{ color: role.color }}>{role.label}</strong> — tap to change</div>
                </div>
              </div>
              <span style={{ color: 'var(--ink-faint)', fontSize: '1.2rem', transform: showSwitch ? 'rotate(180deg)' : 'none', transition: 'transform 0.3s ease' }}>‹</span>
            </button>

            {showSwitch && (
              <div style={{ borderTop: '1px solid var(--border)', padding: '16px 24px 20px' }}>
                <p className="body-sm" style={{ marginBottom: 16 }}>
                  Choose a different role. Your account data stays intact — you can always switch back.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                  {SWITCHABLE_ROLES.map(r => {
                    const meta = ROLE_META[r];
                    const isCurrent = r === user.role;
                    const isLoading = switching === r;
                    return (
                      <button
                        key={r}
                        onClick={() => handleRoleSwitch(r)}
                        disabled={isCurrent || switching !== null}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 14,
                          padding: '14px 18px', borderRadius: 'var(--radius-md)',
                          border: isCurrent ? `1.5px solid ${meta.color}` : '1.5px solid var(--border)',
                          background: isCurrent ? meta.bg : 'white',
                          cursor: isCurrent ? 'default' : 'pointer',
                          opacity: switching !== null && !isLoading ? 0.5 : 1,
                          transition: 'var(--transition)',
                          textAlign: 'left',
                        }}
                        onMouseEnter={e => { if (!isCurrent) e.currentTarget.style.borderColor = meta.color; }}
                        onMouseLeave={e => { if (!isCurrent) e.currentTarget.style.borderColor = 'var(--border)'; }}
                      >
                        <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: meta.bg, display: 'flex', alignItems: 'center', justifyContent: 'center', color: meta.color, flexShrink: 0 }}>
                          {isLoading ? <span className="spinner" style={{ width: 16, height: 16, borderWidth: 2 }} /> : meta.icon}
                        </div>
                        <div style={{ flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.9rem', color: isCurrent ? meta.color : 'var(--ink)' }}>
                            {meta.label}
                            {isCurrent && <span style={{ marginLeft: 8, fontSize: '0.72rem', background: meta.color, color: 'white', padding: '2px 8px', borderRadius: 'var(--radius-pill)' }}>Current</span>}
                          </div>
                          <div className="body-sm">{meta.desc}</div>
                        </div>
                        {!isCurrent && <ArrowRight size={16} color="var(--ink-faint)" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── Account Settings ── */}
        <div className="card" style={{ marginBottom: 24 }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)' }}>
            <h2 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', fontWeight: 400 }}>Account settings</h2>
          </div>
          <form onSubmit={handleSave} style={{ padding: '24px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label"><User size={12} style={{ display: 'inline', marginRight: 4 }} />Display name</label>
                <input type="text" className="field-input" value={name} onChange={e => setName(e.target.value)} placeholder="Your name" />
              </div>
              <div className="field" style={{ marginBottom: 0 }}>
                <label className="field-label"><Mail size={12} style={{ display: 'inline', marginRight: 4 }} />Email address</label>
                <input type="email" className="field-input" value={user?.email || ''} disabled style={{ background: 'var(--canvas)', color: 'var(--ink-muted)', cursor: 'not-allowed' }} />
                <p style={{ fontSize: '0.72rem', color: 'var(--ink-faint)', marginTop: 5 }}>Cannot be changed</p>
              </div>
            </div>
            <button type="submit" className="btn btn-primary" disabled={saving}>
              {saving ? <span className="spinner" /> : <><Save size={15} /> Save changes</>}
            </button>
          </form>
        </div>

        {/* ── Sign out ── */}
        <div style={{ padding: '18px 22px', borderRadius: 'var(--radius-lg)', border: '1px solid #fce8e8', background: '#fffafa', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', marginBottom: 2 }}>Sign out</div>
            <p className="body-sm">You can sign back in anytime.</p>
          </div>
          <button className="btn btn-sm" onClick={logout} style={{ background: '#fce8e8', color: 'var(--accent)', border: 'none' }}>
            <LogOut size={14} /> Sign out
          </button>
        </div>

      </div>
    </div>
  );
}
