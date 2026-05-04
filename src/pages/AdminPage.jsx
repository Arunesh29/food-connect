import { useMemo } from 'react';
import { useFoods } from '../services/foodService';
import { Package, Truck, CheckCircle, Clock, TrendingUp } from 'lucide-react';

function StatCard({ icon, label, value, color }) {
  return (
    <div className="card" style={{ padding: '28px 24px', display: 'flex', alignItems: 'center', gap: 18 }}>
      <div style={{ width: 48, height: 48, borderRadius: 'var(--radius-md)', background: color + '20', display: 'flex', alignItems: 'center', justifyContent: 'center', color, flexShrink: 0 }}>
        {icon}
      </div>
      <div>
        <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', lineHeight: 1 }}>{value}</div>
        <div className="body-sm" style={{ marginTop: 4 }}>{label}</div>
      </div>
    </div>
  );
}

export default function AdminPage() {
  const { foods, loading } = useFoods();

  const stats = useMemo(() => ({
    total: foods.length,
    available: foods.filter(f => f.status === 'available').length,
    requested: foods.filter(f => f.status === 'requested').length,
    assigned: foods.filter(f => f.status === 'assigned').length,
    delivered: foods.filter(f => f.status === 'delivered').length,
    expired: foods.filter(f => f.status === 'expired').length,
  }), [foods]);

  const recent = useMemo(() =>
    [...foods].sort((a, b) => {
      const ta = a.createdAt?.toDate ? a.createdAt.toDate() : new Date(a.createdAt || 0);
      const tb = b.createdAt?.toDate ? b.createdAt.toDate() : new Date(b.createdAt || 0);
      return tb - ta;
    }).slice(0, 12)
  , [foods]);

  if (loading) return (
    <div className="page-shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
      <span className="spinner" style={{ width: 32, height: 32 }} />
    </div>
  );

  return (
    <div className="page-shell">
      <div className="wrap section">
        <div style={{ marginBottom: 48 }}>
          <span className="label-caps" style={{ marginBottom: 10, display: 'block' }}>Admin Panel</span>
          <h1 className="display-lg">Dashboard</h1>
          <p className="body-lg" style={{ marginTop: 10 }}>Overview of all food listings across the platform.</p>
        </div>

        {/* Stat cards */}
        <div className="grid-4" style={{ marginBottom: 48 }}>
          <StatCard icon={<Package size={22} />} label="Total listings" value={stats.total} color="var(--ink)" />
          <StatCard icon={<Clock size={22} />} label="Available" value={stats.available} color="var(--green)" />
          <StatCard icon={<Truck size={22} />} label="In transit" value={stats.assigned} color="var(--amber)" />
          <StatCard icon={<CheckCircle size={22} />} label="Delivered" value={stats.delivered} color="var(--accent)" />
        </div>

        {/* Progress bar */}
        <div className="card" style={{ padding: 28, marginBottom: 48 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Delivery success rate</h3>
            <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.8rem' }}>
              {stats.total > 0 ? Math.round((stats.delivered / stats.total) * 100) : 0}%
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--canvas-warm)', borderRadius: 8, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${stats.total > 0 ? (stats.delivered / stats.total) * 100 : 0}%`, background: 'var(--green)', borderRadius: 8, transition: 'width 1s ease' }} />
          </div>
          <div style={{ display: 'flex', gap: 24, marginTop: 12, flexWrap: 'wrap' }}>
            {[
              { label: 'Available', val: stats.available, color: 'var(--green)' },
              { label: 'Requested', val: stats.requested, color: 'var(--amber)' },
              { label: 'Assigned', val: stats.assigned, color: '#2a4a8f' },
              { label: 'Expired', val: stats.expired, color: 'var(--accent)' },
            ].map(s => (
              <span key={s.label} className="body-sm" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, display: 'inline-block' }} />
                {s.label}: <strong>{s.val}</strong>
              </span>
            ))}
          </div>
        </div>

        {/* Recent listings table */}
        <div className="card" style={{ overflow: 'hidden' }}>
          <div style={{ padding: '20px 24px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem' }}>Recent listings</h3>
            <span className="label-caps">{recent.length} shown</span>
          </div>
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Food</th>
                  <th>Donor</th>
                  <th>Category</th>
                  <th>Location</th>
                  <th>Status</th>
                  <th>Posted</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(food => {
                  const date = food.createdAt?.toDate ? food.createdAt.toDate() : new Date(food.createdAt || 0);
                  return (
                    <tr key={food.id}>
                      <td style={{ fontWeight: 600 }}>{food.name}</td>
                      <td>{food.donorName}</td>
                      <td><span className={`badge badge-${food.category === 'non-veg' ? 'nonveg' : food.category}`} style={{ textTransform: 'capitalize' }}>{food.category}</span></td>
                      <td className="body-sm">{food.location}</td>
                      <td><span className={`badge badge-${food.status}`} style={{ textTransform: 'capitalize' }}>{food.status}</span></td>
                      <td className="body-sm">{date.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
