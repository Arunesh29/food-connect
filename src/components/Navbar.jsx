import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Bell, LogOut, ChevronDown, X, Menu } from 'lucide-react';

export default function Navbar() {
  const { user, logout, notifications, markAllNotificationsRead } = useApp();
  const location = useLocation();
  const [scrolled, setScrolled] = useState(false);
  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const notifRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', fn);
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Close notif panel on outside click
  useEffect(() => {
    const fn = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) setShowNotif(false);
    };
    document.addEventListener('mousedown', fn);
    return () => document.removeEventListener('mousedown', fn);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setMobileMenu(false);
  }, [location.pathname]);

  const unread = notifications.filter(n => !n.read).length;

  const navItems = user ? (() => {
    const base = [{ to: '/', label: 'Home' }];
    if (user.role === 'donor') base.push({ to: '/donor', label: 'My Donations' });
    if (user.role === 'receiver') base.push({ to: '/receiver', label: 'Find Food' });
    if (user.role === 'volunteer') base.push({ to: '/volunteer', label: 'Deliveries' });
    if (user.role === 'admin') base.push({ to: '/admin', label: 'Dashboard' });
    base.push({ to: '/profile', label: 'Profile' });
    return base;
  })() : [];

  return (
    <nav className={`navbar ${scrolled ? 'solid' : ''}`}>
      {/* Logo */}
      <Link to="/" className="navbar-logo" style={{ zIndex: 1100 }}>
        <div className="navbar-logo-mark">
          <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 2C8 6 4 8 4 14a8 8 0 0016 0c0-6-4-8-8-12z"/>
          </svg>
        </div>
        Food Connect
      </Link>

      {/* Nav links */}
      {user && (
        <div className={`navbar-links ${mobileMenu ? 'mobile-open' : ''}`}>
          {navItems.map(item => (
            <Link
              key={item.to}
              to={item.to}
              className={location.pathname === item.to ? 'active' : ''}
              onClick={() => setMobileMenu(false)}
            >
              {item.label}
            </Link>
          ))}
          {mobileMenu && (
            <button className="btn btn-secondary" onClick={logout} style={{ marginTop: 20 }}>
              <LogOut size={18} /> Sign Out
            </button>
          )}
        </div>
      )}

      {/* Right side */}
      <div className="navbar-user">
        {!user ? (
          <>
            <Link to="/login" className="btn btn-secondary btn-sm" style={{ display: window.innerWidth < 480 ? 'none' : 'flex' }}>Sign In</Link>
            <Link to="/login" className="btn btn-primary btn-sm">Get Started</Link>
          </>
        ) : (
          <>
            {/* Notifications */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button
                className="icon-btn"
                onClick={() => { setShowNotif(v => !v); if (!showNotif) markAllNotificationsRead(); }}
                title="Notifications"
              >
                <Bell size={18} />
                {unread > 0 && (
                  <span style={{
                    position: 'absolute', top: -2, right: -2,
                    width: 16, height: 16, borderRadius: '50%',
                    background: 'var(--accent)', color: 'white',
                    fontSize: '0.6rem', fontWeight: 700,
                    display: 'flex', alignItems: 'center', justifyContent: 'center'
                  }}>{unread}</span>
                )}
              </button>

              {showNotif && (
                <div className="notif-panel">
                  <div className="notif-header">
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>Notifications</span>
                    <button className="btn btn-ghost" style={{ padding: '4px 8px', fontSize: '0.75rem' }} onClick={() => setShowNotif(false)}>
                      <X size={14} />
                    </button>
                  </div>
                  {notifications.length === 0 ? (
                    <p style={{ padding: '24px', textAlign: 'center', color: 'var(--ink-muted)', fontSize: '0.85rem' }}>All caught up ✓</p>
                  ) : (
                    notifications.slice(0, 8).map(n => (
                      <div key={n.id} className={`notif-item ${n.read ? '' : 'unread'}`}>
                        <div style={{ fontSize: '0.85rem', fontWeight: 600 }}>{n.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginTop: 2 }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Toggle */}
            <button
              className="icon-btn"
              onClick={() => setMobileMenu(!mobileMenu)}
              style={{ display: 'none' }} /* controlled via CSS media query if I added one, but I'll add inline for safety */
              id="mobile-menu-btn"
            >
              {mobileMenu ? <X size={20} /> : <Menu size={20} />}
            </button>

            {/* Avatar - hidden on very small mobile if menu is open */}
            {!mobileMenu && (
              <Link to="/profile" className="navbar-avatar" title={user.name}>
                {user.photoURL
                  ? <img src={user.photoURL} alt={user.name} />
                  : user.name.charAt(0).toUpperCase()
                }
              </Link>
            )}

            {/* Logout - hidden on mobile (moved to menu) */}
            <button className="icon-btn desktop-only" onClick={logout} title="Sign out" style={{ display: window.innerWidth < 860 ? 'none' : 'flex' }}>
              <LogOut size={17} />
            </button>
          </>
        )}
      </div>
    </nav>
  );
}
