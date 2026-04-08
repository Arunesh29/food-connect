import { useState, useEffect } from 'react';
import { Clock, MapPin, Package, Users, Utensils, Leaf, Box, Apple } from 'lucide-react';

const categoryIcons = {
  veg: <Leaf size={12} />,
  'non-veg': <Utensils size={12} />,
  packed: <Box size={12} />,
  fresh: <Apple size={12} />
};

const categoryEmojis = {
  veg: '🥗',
  'non-veg': '🍖',
  packed: '📦',
  fresh: '🍎'
};

export default function FoodCard({ food, actions, showRequests }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    function updateTimer() {
      const expiry = new Date(food.expiryTime);
      const now = new Date();
      const diff = expiry - now;

      if (diff <= 0) {
        setTimeLeft('Expired');
        setIsExpired(true);
        return;
      }

      const hours = Math.floor(diff / (1000 * 60 * 60));
      const mins = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (hours > 0) {
        setTimeLeft(`${hours}h ${mins}m left`);
      } else {
        setTimeLeft(`${mins}m left`);
      }
      setIsExpired(false);
    }

    updateTimer();
    const interval = setInterval(updateTimer, 30000);
    return () => clearInterval(interval);
  }, [food.expiryTime]);

  const statusText = food.status === 'expired' ? 'expired' : food.status;

  return (
    <div className="food-card" style={{ animationDelay: `${Math.random() * 0.2}s` }}>
      <div className="food-card-image">
        {food.imageUrl ? (
          <img src={food.imageUrl} alt={food.name} loading="lazy" />
        ) : (
          <div className="food-card-image-placeholder">
            {categoryEmojis[food.category] || '🍽️'}
          </div>
        )}
        <div className="food-card-image-overlay">
          <span className={`badge badge-${food.category === 'non-veg' ? 'nonveg' : food.category}`}>
            {categoryIcons[food.category]}
            {food.category}
          </span>
          <span className={`badge badge-${statusText}`}>
            {statusText}
          </span>
        </div>
      </div>

      <div className="food-card-body">
        <h3 className="food-card-name">{food.name}</h3>
        <div className="food-card-meta">
          <span className="food-card-detail">
            <Package size={14} /> {food.quantity}
          </span>
          <span className="food-card-detail">
            <MapPin size={14} /> {food.location}
          </span>
          {food.donorName && (
            <span className="food-card-detail">
              <Users size={14} /> {food.donorName}
            </span>
          )}
        </div>

        <div className={`food-card-timer ${isExpired || food.status === 'expired' ? 'expired' : ''}`}>
          <Clock size={14} />
          {isExpired || food.status === 'expired' ? '⏰ Expired' : `⏰ ${timeLeft}`}
        </div>

        {showRequests && food.requestedUsers && food.requestedUsers.length > 0 && (
          <div style={{ fontSize: '0.8rem', color: 'var(--slate-500)', marginBottom: '12px' }}>
            <Users size={12} style={{ display: 'inline', verticalAlign: 'middle', marginRight: 4 }} />
            {food.requestedUsers.length} request{food.requestedUsers.length > 1 ? 's' : ''}
          </div>
        )}

        {food.rating && (
          <div style={{ display: 'flex', gap: '4px', marginBottom: '12px' }}>
            {[1, 2, 3, 4, 5].map(i => (
              <span key={i} style={{ color: i <= food.rating ? '#fbbf24' : 'var(--slate-300)', fontSize: '0.9rem' }}>★</span>
            ))}
            <span style={{ fontSize: '0.78rem', color: 'var(--slate-500)', marginLeft: '4px' }}>Delivery Rating</span>
          </div>
        )}
      </div>

      {actions && (
        <div className="food-card-footer">
          {actions}
        </div>
      )}
    </div>
  );
}
