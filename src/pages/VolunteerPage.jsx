import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useFoods, acceptDelivery, markDelivered } from '../services/foodService';
import FoodCard from '../components/FoodCard';
import SkeletonCard from '../components/SkeletonCard';
import Modal from '../components/Modal';
import { Truck, CheckCircle, MapPin, Navigation, Clock, Package, Check } from 'lucide-react';

export default function VolunteerPage() {
  const { user, addToast, addNotification } = useApp();
  const { foods, loading } = useFoods();
  const [tab, setTab] = useState('requested');
  const [processing, setProcessing] = useState(null);
  const [showTracking, setShowTracking] = useState(null);

  const filteredFoods = useMemo(() => {
    if (tab === 'requested') {
      return foods.filter(f => f.status === 'requested');
    }
    if (tab === 'assigned') {
      return foods.filter(f => f.status === 'assigned' && f.assignedVolunteer === user?.uid);
    }
    if (tab === 'delivered') {
      return foods.filter(f => f.status === 'delivered');
    }
    return [];
  }, [foods, tab, user]);

  async function handleAccept(food) {
    setProcessing(food.id);
    try {
      await acceptDelivery(food.id, user.uid);
      addToast('success', 'Delivery Accepted!', `You're now delivering "${food.name}"`);
      addNotification('Delivery Accepted', `You accepted delivery of "${food.name}"`);
      setTab('assigned');
    } catch (err) {
      addToast('error', 'Error', 'Failed to accept delivery');
    }
    setProcessing(null);
  }

  async function handleDeliver(food) {
    setProcessing(food.id);
    try {
      await markDelivered(food.id);
      addToast('success', 'Delivered!', `"${food.name}" has been marked as delivered 🎉`);
      addNotification('Delivery Complete', `You delivered "${food.name}" successfully`);
    } catch (err) {
      addToast('error', 'Error', 'Failed to mark as delivered');
    }
    setProcessing(null);
  }

  return (
    <div className="container page-content">
      <div className="page-header">
        <h1 className="page-title">🚚 Volunteer Dashboard</h1>
        <p className="page-subtitle">Accept delivery requests and help food reach those in need</p>
      </div>

      {/* Tabs */}
      <div className="tabs">
        <button className={`tab ${tab === 'requested' ? 'active' : ''}`} onClick={() => setTab('requested')}>
          🟡 Requested
        </button>
        <button className={`tab ${tab === 'assigned' ? 'active' : ''}`} onClick={() => setTab('assigned')}>
          🔵 My Deliveries
        </button>
        <button className={`tab ${tab === 'delivered' ? 'active' : ''}`} onClick={() => setTab('delivered')}>
          ✅ Completed
        </button>
      </div>

      {/* Food Grid */}
      {loading ? (
        <div className="food-grid">
          <SkeletonCard count={4} />
        </div>
      ) : filteredFoods.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon">
            {tab === 'requested' ? '📋' : tab === 'assigned' ? '🚚' : '✅'}
          </div>
          <h3>
            {tab === 'requested' ? 'No pending requests' :
             tab === 'assigned' ? 'No active deliveries' :
             'No completed deliveries'}
          </h3>
          <p>
            {tab === 'requested' ? 'New food requests will appear here' :
             tab === 'assigned' ? 'Accept a request to start delivering' :
             'Completed deliveries will show up here'}
          </p>
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

                  {tab === 'requested' && (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAccept(food)}
                      disabled={processing === food.id}
                    >
                      {processing === food.id ? (
                        <span className="spinner" />
                      ) : (
                        <><Truck size={14} /> Accept Delivery</>
                      )}
                    </button>
                  )}

                  {tab === 'assigned' && (
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setShowTracking(food)}
                      >
                        <Navigation size={14} /> Track
                      </button>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleDeliver(food)}
                        disabled={processing === food.id}
                      >
                        {processing === food.id ? (
                          <span className="spinner" />
                        ) : (
                          <><CheckCircle size={14} /> Mark Delivered</>
                        )}
                      </button>
                    </div>
                  )}

                  {tab === 'delivered' && (
                    <span className="badge badge-delivered">
                      <Check size={12} /> Delivered
                    </span>
                  )}
                </div>
              }
            />
          ))}
        </div>
      )}

      {/* Tracking Modal */}
      <Modal
        isOpen={!!showTracking}
        onClose={() => setShowTracking(null)}
        title="Live Tracking"
        footer={
          <button className="btn btn-primary" onClick={() => {
            if (showTracking) handleDeliver(showTracking);
            setShowTracking(null);
          }}>
            <CheckCircle size={16} /> Mark as Delivered
          </button>
        }
      >
        {showTracking && (
          <div>
            {/* Simulated Map */}
            <div className="map-placeholder" style={{ marginBottom: '24px' }}>
              <div className="map-grid" />
              <div className="map-dot moving" style={{ top: '40%', left: '30%' }} />
              <div className="map-dot destination" style={{ top: '60%', left: '70%' }} />
              <div className="map-line" style={{ top: '50%', left: '30%', width: '40%', transform: 'rotate(25deg)' }} />
              <div style={{ position: 'absolute', bottom: 12, fontSize: '0.78rem', color: 'var(--slate-500)', background: 'white', padding: '4px 12px', borderRadius: 'var(--radius-md)' }}>
                🟢 Volunteer → 🟠 Destination
              </div>
            </div>

            {/* Timeline */}
            <div className="tracking-timeline">
              <div className="tracking-step completed">
                <div className="tracking-step-dot"><Check size={16} /></div>
                <div className="tracking-step-info">
                  <h4>Food Picked Up</h4>
                  <p>Collected from {showTracking.donorName}</p>
                </div>
              </div>
              <div className="tracking-step active">
                <div className="tracking-step-dot"><Truck size={16} /></div>
                <div className="tracking-step-info">
                  <h4>In Transit</h4>
                  <p>On the way to delivery location</p>
                </div>
              </div>
              <div className="tracking-step">
                <div className="tracking-step-dot"><Package size={16} /></div>
                <div className="tracking-step-info">
                  <h4>Delivered</h4>
                  <p>Food delivered to receiver</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
