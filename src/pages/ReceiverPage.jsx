import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useFoods, requestFood, cancelRequest } from '../services/foodService';
import FoodCard from '../components/FoodCard';
import SkeletonCard from '../components/SkeletonCard';
import { Search, Check, HandHeart, X } from 'lucide-react';

const CATEGORIES = [
  { id: 'all', label: 'All' },
  { id: 'veg', label: 'Veg' },
  { id: 'non-veg', label: 'Non-Veg' },
  { id: 'packed', label: 'Packed' },
  { id: 'fresh', label: 'Fresh' },
];

export default function ReceiverPage() {
  const { user, addToast, addNotification } = useApp();
  const { foods, loading } = useFoods();
  const [search, setSearch] = useState('');
  const [cat, setCat] = useState('all');
  const [tab, setTab] = useState('available');
  const [requesting, setRequesting] = useState(null);
  const [confirm, setConfirm] = useState(null);

  const filtered = useMemo(() => {
    return foods.filter(f => {
      if (f.status === 'expired' || f.status === 'delivered') return false;
      if (tab === 'available' && f.status !== 'available') return false;
      if (tab === 'mine' && !f.requestedUsers?.includes(user?.uid)) return false;
      if (cat !== 'all' && f.category !== cat) return false;
      const q = search.toLowerCase();
      if (q && !f.name.toLowerCase().includes(q) && !f.location.toLowerCase().includes(q)) return false;
      return true;
    });
  }, [foods, tab, cat, search, user]);

  async function doRequest(food) {
    setRequesting(food.id);
    try {
      await requestFood(food.id, user.uid);
      addToast('success', 'Request sent!', `You requested "${food.name}". The donor will reach out.`);
      addNotification('Request sent', `Your request for "${food.name}" is pending.`);
      setConfirm(null);
    } catch {
      addToast('error', 'Request failed', 'Something went wrong. Please try again.');
    }
    setRequesting(null);
  }

  return (
    <div className="page-shell">
      <div className="wrap section">
        {/* Header */}
        <div style={{ marginBottom: 40 }}>
          <span className="label-caps" style={{ marginBottom: 10, display: 'block' }}>Food Browser</span>
          <h1 className="display-lg">Available near you</h1>
          <p className="body-lg" style={{ marginTop: 10 }}>Browse listings posted by donors in your community.</p>
        </div>

        {/* Controls */}
        <div style={{ display: 'flex', gap: 16, marginBottom: 28, flexWrap: 'wrap', alignItems: 'center' }}>
          {/* Search */}
          <div style={{ position: 'relative', flex: 1, minWidth: 240 }}>
            <Search size={16} style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', color: 'var(--ink-faint)', pointerEvents: 'none' }} />
            <input
              type="text" className="field-input" placeholder="Search food or location…"
              value={search} onChange={e => setSearch(e.target.value)}
              style={{ paddingLeft: 40, marginBottom: 0 }}
            />
          </div>

          {/* Tabs */}
          <div className="tabs">
            <button className={`tab-btn ${tab === 'available' ? 'active' : ''}`} onClick={() => setTab('available')}>Available</button>
            <button className={`tab-btn ${tab === 'mine' ? 'active' : ''}`} onClick={() => setTab('mine')}>My requests</button>
          </div>
        </div>

        {/* Category chips */}
        <div className="chips">
          {CATEGORIES.map(c => (
            <button key={c.id} className={`chip ${cat === c.id ? 'active' : ''}`} onClick={() => setCat(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        {/* Grid */}
        {loading ? (
          <div className="food-grid"><SkeletonCard count={6} /></div>
        ) : filtered.length === 0 ? (
          <div className="empty">
            <div className="empty-icon">🔍</div>
            <h3>Nothing found</h3>
            <p>Try different search terms or check back later when new listings are posted.</p>
            {search && <button className="btn btn-secondary btn-sm" onClick={() => setSearch('')}>Clear search</button>}
          </div>
        ) : (
          <div className="food-grid">
            {filtered.map(food => {
              const isMine = food.requestedUsers?.includes(user?.uid);
              return (
                <FoodCard key={food.id} food={food} actions={
                  isMine ? (
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 6, color: 'var(--green)', fontSize: '0.85rem', fontWeight: 600 }}>
                        <Check size={15} /> Requested
                      </span>
                      <button
                        className="btn btn-ghost btn-sm"
                        style={{ color: 'var(--accent)', fontSize: '0.75rem', fontWeight: 600 }}
                        onClick={async () => {
                          if (window.confirm(`Cancel request for "${food.name}"?`)) {
                            try {
                              await cancelRequest(food.id, user.uid);
                              addToast('info', 'Request cancelled', 'Your request has been removed.');
                            } catch {
                              addToast('error', 'Error', 'Could not cancel request.');
                            }
                          }
                        }}
                      >
                        Cancel
                      </button>
                    </div>
                  ) : food.status === 'available' ? (
                    <button
                      className="btn btn-accent btn-sm"
                      onClick={() => setConfirm(food)}
                      disabled={requesting === food.id}
                    >
                      {requesting === food.id ? <span className="spinner" /> : <><HandHeart size={14} /> Request</>}
                    </button>
                  ) : (
                    <span className={`badge badge-${food.status}`}>{food.status}</span>
                  )
                } />
              );
            })}
          </div>
        )}
      </div>

      {/* Confirm modal */}
      {confirm && (
        <div onClick={() => setConfirm(null)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 999, padding: 20 }}>
          <div onClick={e => e.stopPropagation()} className="card" style={{ maxWidth: 420, width: '100%', padding: 32 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
              <h2 className="display-sm">Confirm request</h2>
              <button onClick={() => setConfirm(null)} className="icon-btn"><X size={16} /></button>
            </div>
            <p className="body-sm" style={{ marginBottom: 24 }}>
              You're requesting <strong>{confirm.name}</strong> ({confirm.quantity}) from <strong>{confirm.donorName}</strong>.
              They'll be notified and can coordinate pickup with you.
            </p>
            <div style={{ display: 'flex', gap: 12 }}>
              <button className="btn btn-secondary" onClick={() => setConfirm(null)}>Cancel</button>
              <button className="btn btn-accent" onClick={() => doRequest(confirm)} disabled={requesting === confirm.id} style={{ flex: 1, justifyContent: 'center' }}>
                {requesting === confirm.id ? <span className="spinner" /> : 'Yes, request this'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
