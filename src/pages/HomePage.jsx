import { Link } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useFoods } from '../services/foodService';
import { Heart, HandHeart, Truck, ArrowRight, Sparkles, TrendingUp, Users, Utensils } from 'lucide-react';

export default function HomePage() {
  const { user } = useApp();
  const { foods } = useFoods();

  const stats = {
    mealsShared: foods.filter(f => f.status === 'delivered').length * 12 + 847,
    activeVolunteers: 23,
    listings: foods.filter(f => f.status === 'available' || f.status === 'requested').length
  };

  return (
    <div>
      {/* Hero */}
      <section className="hero">
        <div className="hero-bg" />
        <div className="container" style={{ position: 'relative' }}>
          <div className="hero-badge">
            <Sparkles size={14} />
            Reducing food waste, one meal at a time
          </div>
          <h1>
            Share Food,{' '}
            <span className="text-green">Share Hope</span>
            <br />
            <span className="text-orange">Feed Communities</span>
          </h1>
          <p className="hero-subtitle">
            Food Connect bridges the gap between surplus food and hungry hearts.
            Donate, receive, or volunteer — every action counts.
          </p>
          <div className="hero-actions">
            {user ? (
              <>
                {user.role === 'donor' && (
                  <Link to="/donor" className="btn btn-primary btn-lg">
                    <Heart size={18} /> Post Food Now
                  </Link>
                )}
                {user.role === 'receiver' && (
                  <Link to="/receiver" className="btn btn-secondary btn-lg">
                    <HandHeart size={18} /> Find Food
                  </Link>
                )}
                {user.role === 'volunteer' && (
                  <Link to="/volunteer" className="btn btn-primary btn-lg">
                    <Truck size={18} /> View Deliveries
                  </Link>
                )}
                {user.role === 'admin' && (
                  <Link to="/admin" className="btn btn-primary btn-lg">
                    Dashboard
                  </Link>
                )}
              </>
            ) : (
              <>
                <Link to="/login" className="btn btn-primary btn-lg">
                  Get Started <ArrowRight size={16} />
                </Link>
                <Link to="/login" className="btn btn-outline btn-lg">
                  Learn More
                </Link>
              </>
            )}
          </div>
        </div>
      </section>

      {/* Roles */}
      <section className="roles-section">
        <div className="container">
          <h2 className="section-title">Choose Your Role</h2>
          <p className="section-subtitle">Join the movement — whether you have food to give, need a meal, or want to help deliver</p>
          <div className="roles-grid">
            <Link to="/login" className="role-card donor animate-fade-in-up" style={{ animationDelay: '0s' }}>
              <div className="role-card-icon">
                <Heart size={28} />
              </div>
              <h3 className="role-card-title">Food Donor</h3>
              <p className="role-card-desc">
                Have surplus food? Post it on the platform and help reduce waste while feeding those in need.
              </p>
              <span className="btn btn-primary btn-sm">
                Start Donating <ArrowRight size={14} />
              </span>
            </Link>

            <Link to="/login" className="role-card receiver animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
              <div className="role-card-icon">
                <HandHeart size={28} />
              </div>
              <h3 className="role-card-title">Food Receiver</h3>
              <p className="role-card-desc">
                Browse available food near you, request it with one click, and get it delivered to your doorstep.
              </p>
              <span className="btn btn-secondary btn-sm">
                Find Food <ArrowRight size={14} />
              </span>
            </Link>

            <Link to="/login" className="role-card volunteer animate-fade-in-up" style={{ animationDelay: '0.2s' }}>
              <div className="role-card-icon">
                <Truck size={28} />
              </div>
              <h3 className="role-card-title">Volunteer</h3>
              <p className="role-card-desc">
                Help bridge the gap! Pick up food from donors and deliver it to receivers in your area.
              </p>
              <span className="btn btn-outline btn-sm">
                Start Delivering <ArrowRight size={14} />
              </span>
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="container">
          <div className="stats-grid">
            <div className="stat-item" style={{ animationDelay: '0s' }}>
              <div className="stat-number">
                <Utensils size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                {stats.mealsShared.toLocaleString()}
              </div>
              <div className="stat-label">Meals Shared</div>
            </div>
            <div className="stat-item" style={{ animationDelay: '0.1s' }}>
              <div className="stat-number">
                <Users size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                {stats.activeVolunteers}
              </div>
              <div className="stat-label">Active Volunteers</div>
            </div>
            <div className="stat-item" style={{ animationDelay: '0.2s' }}>
              <div className="stat-number">
                <TrendingUp size={28} style={{ display: 'inline', marginRight: 8, verticalAlign: 'middle' }} />
                {stats.listings}
              </div>
              <div className="stat-label">Live Listings</div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer style={{
        textAlign: 'center',
        padding: '32px 24px',
        color: 'var(--slate-400)',
        fontSize: '0.82rem',
        borderTop: '1px solid var(--slate-100)'
      }}>
        <p>© 2026 Food Connect — Built with 💚 to reduce food waste</p>
      </footer>
    </div>
  );
}
