import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useFoods, requestFood } from '../services/foodService';
import FoodCard from '../components/FoodCard';
import SkeletonCard from '../components/SkeletonCard';
import Modal from '../components/Modal';
import RatingSection from '../components/RatingSection';
import { Search, MapPin, HandHeart, Check, Filter } from 'lucide-react';

export default function ReceiverPage() {
  const { user, addToast, addNotification } = useApp();
  const { foods, loading } = useFoods();
  const [search, setSearch] = useState('');
  const [statusTab, setStatusTab] = useState('available');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [requesting, setRequesting] = useState(null);
  const [showConfirm, setShowConfirm] = useState(null);

  const filteredFoods = useMemo(() => {
    return foods.filter(f => {
      if (f.status === 'expired' || f.status === 'delivered') return false;
      if (statusTab === 'available' && f.status !== 'available') return false;
      if (statusTab === 'requested' && f.status !== 'requested') return false;
      if (categoryFilter !== 'all' && f.category !== categoryFilter) return false;
      if (search && !f.location.toLowerCase().includes(search.toLowerCase()) &&
          !f.name.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [foods, search, statusTab, categoryFilter]);

  async function handleRequest(food) {
    setRequesting(food.id);
    try {
      await requestFood(food.id, user.id);
      addToast('success', 'Food Requested!', `You requested "${food.name}"`);
      addNotification('Request Sent', `Your request for "${food.name}" has been submitted`);
      setShowConfirm(null);
    } catch (err) {
      addToast('error', 'Error', 'Failed to request food');
    }
    setRequesting(null);
  }

  const alreadyRequested = (food) => food.requestedUsers?.includes(user?.id);

  return (
    <div className="container page-content">
      <div className="page-header">
        <h1 className="page-title">🍛 Find Food</h1>
        <p className="page-subtitle">Browse available food near you and request with one click</p>
      </div>

      {/* Search & Filters */}
      <div className="filters-bar">
        <div className="search-bar">
          <Search size={18} style={{ color: 'var(--slate-400)' }} />
          <input
            type="text"
            placeholder="Search by food name or location..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          {search && (
            <button className="btn btn-ghost btn-sm" onClick={() => setSearch('')}>Clear</button>
          )}
        </div>
      </div>

      {/* Status Tabs */}
      <div className="tabs">
        <button className={`tab ${statusTab === 'available' ? 'active' : ''}`} onClick={() => setStatusTab('available')}>
          🟢 Available
        </button>
        <button className={`tab ${statusTab === 'requested' ? 'active' : ''}`} onClick={() => setStatusTab('requested')}>
          🟡 Requested
        </button>
      </div>

      {/* Category Filter */}
      <div className="filter-chips" style={{ marginBottom: '24px' }}>
        <span style={{ fontSize: '0.82rem', color: 'var(--slate-500)', alignSelf: 'center', fontWeight: 500 }}>
          <Filter size={14} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
          Filter:
        </span>
        {[
          { value: 'all', label: 'All' },
          { value: 'veg', label: '🥬 Veg' },
          { value: 'non-veg', label: '🍖 Non-Veg' },
          { value: 'packed', label: '📦 Packed' },
          { value: 'fresh', label: '🍎 Fresh' }
        ].map(cat => (
          <button
            key={cat.value}
            className={`filter-chip ${categoryFilter === cat.value ? 'active' : ''}`}
            onClick={() => setCategoryFilter(cat.value)}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Rating Section */}
      <RatingSection />

      {/* Food Grid */}
      {loading ? (
        <div className="food-grid">
          <SkeletonCard count={6} />
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">🔍</div>
          <h3>No food found</h3>
          <p>Try adjusting your filters or search criteria</p>
        </div>
      ) : (
        <div className="food-grid">
          {filteredFoods.map(food => (
            <FoodCard
              key={food.id}
              food={food}
              actions={
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                  <span className="food-card-detail">
                    <MapPin size={14} /> {food.location}
                  </span>
                  {alreadyRequested(food) ? (
                    <span className="btn btn-ghost btn-sm" style={{ color: 'var(--green-600)' }}>
                      <Check size={14} /> Requested
                    </span>
                  ) : food.status === 'available' ? (
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => setShowConfirm(food)}
                      disabled={requesting === food.id}
                    >
                      {requesting === food.id ? (
                        <span className="spinner" />
                      ) : (
                        <><HandHeart size={14} /> Request</>
                      )}
                    </button>
                  ) : (
                    <span className={`badge badge-${food.status}`}>{food.status}</span>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Confirm Modal */}
      <Modal
        isOpen={!!showConfirm}
        onClose={() => setShowConfirm(null)}
        title="Request Food"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowConfirm(null)}>Cancel</button>
            <button
              className="btn btn-secondary"
              onClick={() => handleRequest(showConfirm)}
              disabled={requesting}
            >
              {requesting ? <span className="spinner" /> : <><HandHeart size={16} /> Confirm Request</>}
            </button>
          </>
        }
      >
        {showConfirm && (
          <div>
            <p style={{ marginBottom: '16px', color: 'var(--slate-600)' }}>
              You're requesting <strong>{showConfirm.name}</strong> ({showConfirm.quantity}) from{' '}
              <strong>{showConfirm.donorName}</strong>.
            </p>
            <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
              <span className={`badge badge-${showConfirm.category === 'non-veg' ? 'nonveg' : showConfirm.category}`}>
                {showConfirm.category}
              </span>
              <span className="food-card-detail">
                <MapPin size={14} /> {showConfirm.location}
              </span>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
