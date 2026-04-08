import { useMemo } from 'react';
import { useFoods } from '../services/foodService';
import SkeletonCard from '../components/SkeletonCard';
import { Package, Truck, Clock, TrendingDown, CheckCircle, AlertTriangle, BarChart3, Utensils } from 'lucide-react';

export default function AdminPage() {
  const { foods, loading } = useFoods();

  const stats = useMemo(() => {
    const total = foods.length;
    const available = foods.filter(f => f.status === 'available').length;
    const requested = foods.filter(f => f.status === 'requested').length;
    const assigned = foods.filter(f => f.status === 'assigned').length;
    const delivered = foods.filter(f => f.status === 'delivered').length;
    const expired = foods.filter(f => f.status === 'expired').length;
    const wasteReduced = delivered * 2.5; // kg estimate

    return { total, available, requested, assigned, delivered, expired, wasteReduced };
  }, [foods]);

  const recentFoods = useMemo(() => {
    return [...foods].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 8);
  }, [foods]);

  if (loading) {
    return (
      <div className="container page-content">
        <div className="page-header">
          <h1 className="page-title">📊 Admin Dashboard</h1>
        </div>
        <div className="dashboard-grid">
          {Array.from({ length: 4 }, (_, i) => (
            <div key={i} className="skeleton" style={{ height: '140px', borderRadius: 'var(--radius-xl)' }} />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="container page-content">
      <div className="page-header">
        <h1 className="page-title">📊 Admin Dashboard</h1>
        <p className="page-subtitle">Platform analytics and overview</p>
      </div>

      {/* Stats Grid */}
      <div className="dashboard-grid">
        <div className="dashboard-stat animate-fade-in-up" style={{ animationDelay: '0s' }}>
          <div className="dashboard-stat-header">
            <div>
              <div className="dashboard-stat-value">{stats.total}</div>
              <div className="dashboard-stat-label">Total Food Posted</div>
            </div>
            <div className="dashboard-stat-icon" style={{ background: 'var(--green-100)', color: 'var(--green-600)' }}>
              <Package size={22} />
            </div>
          </div>
          <div className="dashboard-stat-change positive">
            <TrendingDown size={12} style={{ transform: 'rotate(180deg)' }} />
            +12% this week
          </div>
        </div>

        <div className="dashboard-stat animate-fade-in-up" style={{ animationDelay: '0.05s' }}>
          <div className="dashboard-stat-header">
            <div>
              <div className="dashboard-stat-value">{stats.delivered}</div>
              <div className="dashboard-stat-label">Deliveries Completed</div>
            </div>
            <div className="dashboard-stat-icon" style={{ background: 'rgba(59,130,246,0.1)', color: 'var(--info)' }}>
              <Truck size={22} />
            </div>
          </div>
          <div className="dashboard-stat-change positive">
            <CheckCircle size={12} />
            {stats.delivered > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}% completion rate
          </div>
        </div>

        <div className="dashboard-stat animate-fade-in-up" style={{ animationDelay: '0.1s' }}>
          <div className="dashboard-stat-header">
            <div>
              <div className="dashboard-stat-value">{stats.requested + stats.assigned}</div>
              <div className="dashboard-stat-label">Active Requests</div>
            </div>
            <div className="dashboard-stat-icon" style={{ background: 'var(--orange-100)', color: 'var(--orange-600)' }}>
              <Clock size={22} />
            </div>
          </div>
          <div className="dashboard-stat-change positive">
            <Utensils size={12} />
            {stats.requested} requested, {stats.assigned} in transit
          </div>
        </div>

        <div className="dashboard-stat animate-fade-in-up" style={{ animationDelay: '0.15s' }}>
          <div className="dashboard-stat-header">
            <div>
              <div className="dashboard-stat-value">{stats.wasteReduced.toFixed(1)} kg</div>
              <div className="dashboard-stat-label">Waste Reduced</div>
            </div>
            <div className="dashboard-stat-icon" style={{ background: 'rgba(16,185,129,0.1)', color: '#10b981' }}>
              <TrendingDown size={22} />
            </div>
          </div>
          <div className="dashboard-stat-change positive">
            <BarChart3 size={12} />
            ~{(stats.wasteReduced * 2.2).toFixed(0)} meals saved
          </div>
        </div>
      </div>

      {/* Status Breakdown */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px', marginBottom: '32px' }}>
        {/* Status Chart */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--slate-800)' }}>
            Status Breakdown
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {[
              { label: 'Available', count: stats.available, color: 'var(--green-500)', total: stats.total },
              { label: 'Requested', count: stats.requested, color: 'var(--orange-500)', total: stats.total },
              { label: 'Assigned', count: stats.assigned, color: 'var(--info)', total: stats.total },
              { label: 'Delivered', count: stats.delivered, color: '#10b981', total: stats.total },
              { label: 'Expired', count: stats.expired, color: 'var(--error)', total: stats.total }
            ].map((item) => (
              <div key={item.label}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--slate-600)' }}>{item.label}</span>
                  <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--slate-800)' }}>{item.count}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${item.total > 0 ? (item.count / item.total) * 100 : 0}%`,
                      background: item.color,
                      animation: 'progressFill 1s ease both'
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Quick Alerts */}
        <div className="card" style={{ padding: '28px' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--slate-800)' }}>
            Platform Alerts
          </h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {stats.expired > 0 && (
              <div style={{ display: 'flex', gap: '12px', padding: '14px', background: 'rgba(239,68,68,0.05)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(239,68,68,0.15)' }}>
                <AlertTriangle size={18} style={{ color: 'var(--error)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {stats.expired} items expired
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    These items have passed their expiry time
                  </div>
                </div>
              </div>
            )}
            {stats.requested > 0 && (
              <div style={{ display: 'flex', gap: '12px', padding: '14px', background: 'var(--orange-50)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(249,115,22,0.15)' }}>
                <Clock size={18} style={{ color: 'var(--orange-500)', flexShrink: 0, marginTop: 2 }} />
                <div>
                  <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {stats.requested} pending requests
                  </div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                    Awaiting volunteer acceptance
                  </div>
                </div>
              </div>
            )}
            <div style={{ display: 'flex', gap: '12px', padding: '14px', background: 'var(--green-50)', borderRadius: 'var(--radius-lg)', border: '1px solid rgba(34,197,94,0.15)' }}>
              <CheckCircle size={18} style={{ color: 'var(--green-600)', flexShrink: 0, marginTop: 2 }} />
              <div>
                <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                  Platform is healthy
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--slate-500)' }}>
                  {stats.available} foods available, {stats.assigned} in transit
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="card" style={{ padding: '28px' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '20px', color: 'var(--slate-800)' }}>
          Recent Activity
        </h3>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--slate-100)' }}>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Food</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Category</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Location</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Status</th>
                <th style={{ textAlign: 'left', padding: '10px 12px', fontSize: '0.78rem', fontWeight: 600, color: 'var(--slate-500)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Requests</th>
              </tr>
            </thead>
            <tbody>
              {recentFoods.map((food, i) => (
                <tr key={food.id} style={{ borderBottom: '1px solid var(--slate-50)', animation: `fadeIn 0.3s ${i * 0.05}s ease both` }}>
                  <td style={{ padding: '12px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--slate-800)' }}>
                    {food.name}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-${food.category === 'non-veg' ? 'nonveg' : food.category}`}>
                      {food.category}
                    </span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--slate-500)' }}>
                    {food.location}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <span className={`badge badge-${food.status}`}>{food.status}</span>
                  </td>
                  <td style={{ padding: '12px', fontSize: '0.82rem', color: 'var(--slate-600)', fontWeight: 500 }}>
                    {food.requestedUsers?.length || 0}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
