import { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useFoods } from '../services/foodService';
import { ArrowRight, Heart, ShoppingBag, Bike, Star } from 'lucide-react';

const MARQUEE_ITEMS = ['Zero Waste', 'Real Impact', 'Community Driven', 'Fresh Food', 'Daily Giving', 'Local Heroes'];

export default function HomePage() {
  const { user } = useApp();
  const { foods } = useFoods();
  const heroRef = useRef(null);

  const stats = {
    meals: foods.filter(f => f.status === 'delivered').length * 8 + 1240,
    active: foods.filter(f => f.status === 'available').length,
    donors: 148,
  };

  // GSAP reveal
  useEffect(() => {
    if (!window.gsap) return;
    const ctx = window.gsap.context(() => {
      window.gsap.from('.gs-hero-title', { y: 60, opacity: 0, duration: 1.1, ease: 'power3.out', delay: 0.1 });
      window.gsap.from('.gs-hero-sub', { y: 40, opacity: 0, duration: 1.0, ease: 'power3.out', delay: 0.35 });
      window.gsap.from('.gs-hero-actions', { y: 30, opacity: 0, duration: 0.9, ease: 'power3.out', delay: 0.55 });
      window.gsap.from('.gs-role-card', { y: 50, opacity: 0, duration: 0.8, ease: 'power3.out', stagger: 0.15, delay: 0.3,
        scrollTrigger: { trigger: '.gs-roles-section', start: 'top 80%' }
      });
      window.gsap.from('.gs-stat', { y: 30, opacity: 0, duration: 0.7, ease: 'power3.out', stagger: 0.1, delay: 0.2,
        scrollTrigger: { trigger: '.gs-stats', start: 'top 85%' }
      });
    }, heroRef);
    return () => ctx.revert();
  }, []);

  const roles = [
    {
      id: 'donor',
      icon: <Heart size={26} />,
      title: 'I want to donate',
      desc: 'You have extra food from an event, restaurant, or home. List it in under a minute and let your community benefit.',
      cta: 'Start Donating',
    },
    {
      id: 'receiver',
      icon: <ShoppingBag size={26} />,
      title: 'I need food',
      desc: 'Browse available listings near you and request with one tap. No awkward questions, just helpful neighbors.',
      cta: 'Find Food',
    },
    {
      id: 'volunteer',
      icon: <Bike size={26} />,
      title: 'I want to help deliver',
      desc: 'Pick up food from donors and deliver it to those who need it. Be the link that makes it all work.',
      cta: 'Start Volunteering',
    },
  ];

  return (
    <div ref={heroRef}>
      {/* ── Hero ── */}
      <section style={{ padding: '80px 0 64px', background: 'var(--canvas)' }}>
        <div className="wrap" style={{ maxWidth: 900 }}>
          <div style={{ marginBottom: 20 }}>
            <span className="badge badge-available" style={{ fontSize: '0.78rem', padding: '6px 14px' }}>
              🌱 Community Food Sharing
            </span>
          </div>

          <h1 className="display-xl gs-hero-title" style={{ marginBottom: 28 }}>
            Good food deserves<br />
            <em style={{ fontStyle: 'italic', color: 'var(--accent)' }}>a second chance.</em>
          </h1>

          <p className="body-lg gs-hero-sub" style={{ maxWidth: 560, marginBottom: 40 }}>
            Food Connect bridges the gap between surplus and need. Donors, receivers, and volunteers — all in one place.
          </p>

          <div className="gs-hero-actions" style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
            {user ? (
              <Link to={`/${user.role}`} className="btn btn-primary btn-lg">
                Go to my dashboard <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg">
                  Join for free <ArrowRight size={18} />
                </Link>
                <Link to="/login" className="btn btn-secondary btn-lg">
                  Browse listings
                </Link>
              </>
            )}
          </div>

          {/* Trust bar */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 48, flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              {[1,2,3,4,5].map(i => <Star key={i} size={14} fill="var(--amber)" color="var(--amber)" />)}
              <span className="body-sm" style={{ marginLeft: 4 }}>4.9 from 200+ users</span>
            </div>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span className="body-sm">Free forever for receivers</span>
            <span style={{ color: 'var(--border-strong)' }}>·</span>
            <span className="body-sm">No sign-up fee</span>
          </div>
        </div>
      </section>

      {/* ── Marquee ── */}
      <div style={{ borderTop: '1px solid var(--border)', borderBottom: '1px solid var(--border)', padding: '14px 0', background: 'var(--canvas-card)' }}>
        <div className="marquee-track">
          <div className="marquee-content" aria-hidden="true">
            {[...MARQUEE_ITEMS, ...MARQUEE_ITEMS].map((item, i) => (
              <span key={i}>
                {item} <span className="marquee-sep">✦</span>
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* ── Stats ── */}
      <section className="section-sm">
        <div className="wrap">
          <div className="stats-strip gs-stats">
            <div className="stat-item gs-stat">
              <div className="stat-num">{stats.meals.toLocaleString()}</div>
              <div className="stat-label">Meals rescued</div>
            </div>
            <div className="stat-item gs-stat">
              <div className="stat-num">{stats.active}</div>
              <div className="stat-label">Listings right now</div>
            </div>
            <div className="stat-item gs-stat">
              <div className="stat-num">{stats.donors}+</div>
              <div className="stat-label">Active donors</div>
            </div>
          </div>
        </div>
      </section>

      {/* ── How it works ── */}
      <section className="section gs-roles-section" style={{ background: 'var(--canvas-card)', borderTop: '1px solid var(--border)' }}>
        <div className="wrap">
          <div className="section-header">
            <span className="label-caps" style={{ marginBottom: 12, display: 'block' }}>Who is this for?</span>
            <h2 className="display-lg">Choose your role</h2>
            <p className="body-lg" style={{ maxWidth: 480, marginTop: 12 }}>
              Whether you're giving, receiving, or delivering — there's a place for you here.
            </p>
          </div>

          <div className="grid-3">
            {roles.map(role => (
              <Link key={role.id} to="/login" className={`role-card ${role.id} gs-role-card`}>
                <div className={`role-icon ${role.id}`}>{role.icon}</div>
                <div className="role-title">{role.title}</div>
                <p className="role-desc">{role.desc}</p>
                <div className="role-arrow">
                  {role.cta} <ArrowRight size={15} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ── */}
      <section className="section">
        <div className="wrap">
          <div style={{
            background: 'var(--ink)', borderRadius: 'var(--radius-xl)',
            padding: '72px 64px', display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', flexWrap: 'wrap', gap: 32
          }}>
            <div>
              <h2 className="display-md" style={{ color: 'white', marginBottom: 14 }}>
                Ready to make a difference?
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.6)', maxWidth: 420 }}>
                Join hundreds of people in your city already sharing food, reducing waste, and building community.
              </p>
            </div>
            <Link to="/login" className="btn btn-accent btn-lg">
              Get started free <ArrowRight size={18} />
            </Link>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: '1px solid var(--border)', padding: '40px 0' }}>
        <div className="wrap" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div className="navbar-logo">
            <div className="navbar-logo-mark" style={{ width: 24, height: 24 }}>
              <svg viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" style={{ width: 12 }}>
                <path d="M12 2C8 6 4 8 4 14a8 8 0 0016 0c0-6-4-8-8-12z"/>
              </svg>
            </div>
            Food Connect
          </div>
          <p className="body-sm">© 2026 Food Connect. Built for communities.</p>
          <Link to="/admin-login" className="body-sm" style={{ opacity: 0.4 }}>Admin</Link>
        </div>
      </footer>
    </div>
  );
}
