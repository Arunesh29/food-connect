import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useFoods, acceptDelivery, markDelivered, unassignDelivery } from '../services/foodService';
import FoodCard from '../components/FoodCard';
import SkeletonCard from '../components/SkeletonCard';
import { Truck, CheckCircle, MapPin, X, Package, Navigation } from 'lucide-react';

export default function VolunteerPage() {
  const { user, addToast, addNotification } = useApp();
  const { foods, loading } = useFoods();
  const [tab, setTab] = useState('available');
  const [processing, setProcessing] = useState(null);
  const [tracking, setTracking] = useState(null);

  const filtered = useMemo(() => {
    if (tab === 'available') return foods.filter(f => f.status === 'requested');
    if (tab === 'mine') return foods.filter(f => f.status === 'assigned' && f.assignedVolunteer === user?.uid);
    if (tab === 'done') return foods.filter(f => f.status === 'delivered' && f.assignedVolunteer === user?.uid);
    return [];
  }, [foods, tab, user]);

  async function accept(food) {
    setProcessing(food.id);
    try {
      await acceptDelivery(food.id, user.uid);
      addToast('success', 'Delivery accepted!', `You're now handling "${food.name}".`);
      addNotification('Delivery assigned', `You accepted delivery of "${food.name}".`);
      setTab('mine');
    } catch {
      addToast('error', 'Failed', 'Could not accept this delivery.');
    }
    setProcessing(null);
  }

  async function complete(food) {
    setProcessing(food.id);
    try {
      await markDelivered(food.id);
      addToast('success', 'Delivery complete! 🎉', `"${food.name}" was delivered successfully.`);
      setTracking(null);
    } catch {
      addToast('error', 'Failed', 'Could not mark as delivered.');
    }
    setProcessing(null);
  }

  const tabItems = [
    { id: 'available', label: 'Needs delivery', count: foods.filter(f => f.status === 'requested').length },
    { id: 'mine', label: 'My deliveries', count: foods.filter(f => f.status === 'assigned' && f.assignedVolunteer === user?.uid).length },
    { id: 'done', label: 'Completed', count: foods.filter(f => f.status === 'delivered' && f.assignedVolunteer === user?.uid).length },
  ];

  return (
    <div className="page-shell">
      <div className="wrap section">
        <div style={{ marginBottom: 40 }}>
          <span className="label-caps" style={{ marginBottom: 10, display: 'block' }}>Volunteer Dashboard</span>
          <h1 className="display-lg">Deliveries</h1>
          <p className="body-lg" style={{ marginTop: 10 }}>Pick up food from donors and deliver it to those who need it.</p>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 36, background: 'var(--canvas-warm)', padding: 4, borderRadius: 'var(--radius-pill)', width: 'fit-content' }}>
          {tabItems.map(t => (
            <button key={t.id} className={`tab-btn ${tab === t.id ? 'active' : ''}`} onClick={() => setTab(t.id)}>
              {t.label}
              {t.count > 0 && (
                <span style={{ marginLeft: 6, background: tab === t.id ? 'var(--accent)' : 'var(--border-strong)', color: tab === t.id ? 'white' : 'var(--ink-muted)', fontSize: '0.7rem', fontWeight: 700, padding: '1px 7px', borderRadius: 'var(--radius-pill)' }}>
                  {t.count}
                </span>
              )}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="food-grid"><SkeletonCard count={4} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">{tab === 'available' ? '📋' : tab === 'mine' ? '🚴' : '✅'}</div>
            <h3>{tab === 'available' ? 'No pending deliveries' : tab === 'mine' ? 'No active deliveries' : 'No completed deliveries yet'}</h3>
            <p>{tab === 'available' ? 'Check back soon — food requests appear here when donors list items.' : tab === 'mine' ? 'Accept a delivery from the "Needs delivery" tab.' : 'Deliveries you complete will appear here.'}</p>
          </div>
        ) : (
          <div className="food-grid">
            {filtered.map(food => (
              <FoodCard key={food.id} food={food} actions={
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%', gap: 8 }}>
                  <span className="food-card-detail" style={{ fontSize: '0.8rem' }}>
                    <MapPin size={12} /> {food.location}
                  </span>
                  <div style={{ display: 'flex', gap: 8 }}>
                    {tab === 'available' && (
                      <button className="btn btn-primary btn-sm" onClick={() => accept(food)} disabled={processing === food.id}>
                        {processing === food.id ? <span className="spinner" /> : <><Truck size={13} /> Accept</>}
                      </button>
                    )}
                    {tab === 'mine' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <div style={{ display: 'flex', gap: 8 }}>
                          <button className="btn btn-secondary btn-sm" onClick={() => setTracking(food)} style={{ flex: 1 }}>
                            <Navigation size={13} /> Track
                          </button>
                          <button className="btn btn-primary btn-sm" onClick={() => complete(food)} disabled={processing === food.id} style={{ flex: 1 }}>
                            {processing === food.id ? <span className="spinner" /> : <><CheckCircle size={13} /> Done</>}
                          </button>
                        </div>
                        <button
                          className="btn btn-ghost btn-sm"
                          style={{ color: 'var(--accent)', fontSize: '0.72rem', padding: '4px 0' }}
                          onClick={async () => {
                            if (window.confirm('Unable to deliver this? It will be put back on the "Needs delivery" list.')) {
                              setProcessing(food.id);
                              try {
                                await unassignDelivery(food.id);
                                addToast('info', 'Delivery unassigned', 'The item is back on the public list.');
                              } catch {
                                addToast('error', 'Error', 'Could not unassign delivery.');
                              }
                              setProcessing(null);
                            }
                          }}
                        >
                          Unable to deliver
                        </button>
                      </div>
                    )}
                    {tab === 'done' && (
                      <span style={{ display: 'flex', alignItems: 'center', gap: 5, color: 'var(--green)', fontSize: '0.82rem', fontWeight: 600 }}>
                        <CheckCircle size={14} /> Delivered
                      </span>
                    )}
                  </div>
                </div>
              } />
            ))}
          </div>
        )}
      </div>

      {/* Tracking Modal */}
      {tracking && (
        <div onClick={() => setTracking(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 480, width: '100%', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h2 className="display-sm">Delivery details</h2>
              <button className="icon-btn" onClick={() => setTracking(null)}><X size={16} /></button>
            </div>

            {/* Map placeholder */}
            <div className="map-box" style={{ marginBottom: 24 }}>
              <div style={{ position: 'absolute', inset: 0, backgroundImage: 'radial-gradient(circle, #e0d6c8 1px, transparent 1px)', backgroundSize: '24px 24px', opacity: 0.5 }} />
              <div className="map-dot origin" style={{ top: '42%', left: '25%' }} />
              <div className="map-dot dest" style={{ top: '55%', left: '72%' }} />
              <svg style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}>
                <line x1="25%" y1="42%" x2="72%" y2="55%" stroke="var(--accent)" strokeWidth="2" strokeDasharray="6,4" />
              </svg>
              <div style={{ position: 'absolute', bottom: 12, left: 12, background: 'white', padding: '4px 10px', borderRadius: 'var(--radius-pill)', fontSize: '0.72rem', color: 'var(--ink-muted)', boxShadow: 'var(--shadow-sm)' }}>
                ● Pickup → ● Delivery
              </div>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 28 }}>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--accent-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Package size={16} color="var(--accent)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Pick up from</div>
                  <div style={{ fontWeight: 600 }}>{tracking.donorName}</div>
                  <div className="body-sm">{tracking.location}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 14, alignItems: 'flex-start' }}>
                <div style={{ width: 36, height: 36, borderRadius: 'var(--radius-md)', background: 'var(--green-light)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  <Navigation size={16} color="var(--green)" />
                </div>
                <div>
                  <div style={{ fontSize: '0.78rem', color: 'var(--ink-muted)', marginBottom: 2, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.06em' }}>Deliver to</div>
                  <div style={{ fontWeight: 600 }}>Receiver</div>
                  <div className="body-sm">Contact them to coordinate</div>
                </div>
              </div>
            </div>

            <button className="btn btn-primary" onClick={() => complete(tracking)} disabled={processing === tracking.id} style={{ width: '100%', justifyContent: 'center' }}>
              {processing === tracking.id ? <span className="spinner" /> : <><CheckCircle size={16} /> Mark as delivered</>}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
