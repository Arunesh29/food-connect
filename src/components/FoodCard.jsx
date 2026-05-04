import { useState, useEffect } from 'react';
import { Clock, MapPin, Package, Users } from 'lucide-react';

const CATEGORY_COLORS = {
  veg: 'badge-veg',
  'non-veg': 'badge-nonveg',
  packed: 'badge-packed',
  fresh: 'badge-fresh',
};

function useCountdown(expiryTime) {
  const [label, setLabel] = useState('');
  const [urgent, setUrgent] = useState(false);
  useEffect(() => {
    function tick() {
      const diff = new Date(expiryTime) - Date.now();
      if (diff <= 0) { setLabel('Expired'); return; }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      setUrgent(h < 2);
      setLabel(h > 0 ? `${h}h ${m}m left` : `${m}m left`);
    }
    tick();
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, [expiryTime]);
  return { label, urgent };
}

export default function FoodCard({ food, actions }) {
  const { label: timeLeft, urgent } = useCountdown(food.expiryTime);

  const fallback = {
    veg: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80',
    'non-veg': 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80',
    packed: 'https://images.unsplash.com/photo-1536304993881-ff86e6c4f1b6?w=600&q=80',
    fresh: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?w=600&q=80',
  };

  return (
    <div className="food-card">
      <div className="food-card-image">
        <img
          src={food.imageUrl || fallback[food.category] || fallback.veg}
          alt={food.name}
          loading="lazy"
          onError={(e) => { e.target.src = fallback.veg; }}
        />
        <div style={{ position: 'absolute', top: 12, left: 12, display: 'flex', gap: 6 }}>
          <span className={`badge ${CATEGORY_COLORS[food.category] || 'badge-veg'}`}>
            {food.category}
          </span>
        </div>
        <div style={{ position: 'absolute', top: 12, right: 12 }}>
          <span className={`badge badge-${food.status}`}>{food.status}</span>
        </div>
      </div>

      <div className="food-card-body">
        <h3 className="food-card-title">{food.name}</h3>
        <div className="food-card-meta">
          <span className="food-card-detail">
            <Package size={13} /> {food.quantity}
          </span>
          <span className="food-card-detail">
            <MapPin size={13} /> {food.location}
          </span>
          {food.donorName && (
            <span className="food-card-detail">
              <Users size={13} /> {food.donorName}
            </span>
          )}
        </div>
        <span className={`timer ${urgent ? 'urgent' : ''}`}>
          <Clock size={12} /> {timeLeft}
        </span>
      </div>

      {actions && (
        <div className="food-card-footer">
          {actions}
        </div>
      )}
    </div>
  );
}
