import { useState, useRef, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { useLocation, Link } from 'react-router-dom';
import { Home, Heart, Truck, LayoutDashboard, Bell, LogOut, Menu, X, Leaf } from 'lucide-react';

export default function Navbar() {
  const { user, logout, notifications, markAllNotificationsRead } = useApp();
  const location = useLocation();
  const [showNotif, setShowNotif] = useState(false);
  const [mobileMenu, setMobileMenu] = useState(false);
  const notifRef = useRef(null);

  const unreadCount = notifications.filter(n => !n.read).length;

  useEffect(() => {
    function handleClick(e) {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setShowNotif(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const navLinks = user ? getNavLinks(user.role) : [];

  function getNavLinks(role) {
    const links = [{ to: '/', label: 'Home', icon: <Home size={16} /> }];
    if (role === 'donor') links.push({ to: '/donor', label: 'My Donations', icon: <Heart size={16} /> });
    if (role === 'receiver') links.push({ to: '/receiver', label: 'Find Food', icon: <Heart size={16} /> });
    if (role === 'volunteer') links.push({ to: '/volunteer', label: 'Deliveries', icon: <Truck size={16} /> });
    if (role === 'admin') links.push({ to: '/admin', label: 'Dashboard', icon: <LayoutDashboard size={16} /> });
    return links;
  }

  function formatTime(date) {
    const diff = Date.now() - new Date(date).getTime();
    const mins = Math.floor(diff / 60000);
    if (mins < 1) return 'Just now';
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    return `${Math.floor(hrs / 24)}d ago`;
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-brand">
          <div className="navbar-brand-icon">
            <Leaf size={20} />
          </div>
          Food Connect
        </Link>

        <div className="navbar-nav" style={mobileMenu ? { display: 'flex', position: 'fixed', inset: 0, background: 'white', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', gap: '16px', zIndex: 200 } : {}}>
          {mobileMenu && (
            <button onClick={() => setMobileMenu(false)} style={{ position: 'absolute', top: 20, right: 20 }}>
              <X size={24} />
            </button>
          )}
          {navLinks.map(link => (
            <Link
              key={link.to}
              to={link.to}
              className={`nav-link ${location.pathname === link.to ? 'active' : ''}`}
              onClick={() => setMobileMenu(false)}
            >
              {link.icon}
              {link.label}
            </Link>
          ))}
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {user && (
            <>
              <div className="notification-bell" ref={notifRef}>
                <button
                  className="btn btn-ghost btn-icon"
                  onClick={() => { setShowNotif(!showNotif); if (!showNotif) markAllNotificationsRead(); }}
                  style={{ position: 'relative' }}
                >
                  <Bell size={20} />
                  {unreadCount > 0 && (
                    <span className="notification-count">{unreadCount}</span>
                  )}
                </button>

                {showNotif && (
                  <div className="notification-dropdown">
                    <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--slate-100)', fontWeight: 700, fontSize: '0.9rem' }}>
                      Notifications
                    </div>
                    {notifications.length === 0 ? (
                      <div style={{ padding: '32px 20px', textAlign: 'center', color: 'var(--slate-400)', fontSize: '0.85rem' }}>
                        No notifications yet
                      </div>
                    ) : notifications.map(n => (
                      <div key={n.id} className="notification-item">
                        {!n.read && <div className="notification-item-dot" />}
                        <div className="notification-item-content">
                          <h4>{n.title}</h4>
                          <p>{n.message}</p>
                        </div>
                        <span className="notification-item-time">{formatTime(n.time)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="nav-user">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.name}
                    style={{
                      width: 36, height: 36, borderRadius: '50%',
                      border: '2px solid var(--green-300)',
                      objectFit: 'cover'
                    }}
                  />
                ) : (
                  <div className={`nav-user-avatar ${user.role}`}>
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
                <div className="nav-user-info">
                  <span className="nav-user-name">{user.name}</span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span className="nav-user-role">{user.role}</span>
                    <Link to="/select-role" style={{ fontSize: '0.65rem', color: 'var(--blue-600)', fontWeight: 600, textDecoration: 'underline' }}>
                      Switch
                    </Link>
                  </div>
                </div>
                <button className="btn-logout" onClick={logout}>
                  <LogOut size={14} />
                </button>
              </div>
            </>
          )}

          <button
            className="btn btn-ghost btn-icon"
            onClick={() => setMobileMenu(true)}
            style={{ display: 'none' }}
            id="mobile-menu-toggle"
          >
            <Menu size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}
