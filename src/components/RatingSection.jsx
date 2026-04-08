import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useFoods, rateDelivery } from '../services/foodService';
import FoodCard from '../components/FoodCard';
import Modal from '../components/Modal';
import { Star, ThumbsUp } from 'lucide-react';

export default function RatingSection() {
  const { user, addToast } = useApp();
  const { foods } = useFoods();
  const [showRating, setShowRating] = useState(null);
  const [volunteerRating, setVolunteerRating] = useState(0);
  const [foodRating, setFoodRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);

  const deliveredFoods = useMemo(() => {
    return foods.filter(f =>
      f.status === 'delivered' &&
      !f.rating &&
      f.requestedUsers?.includes(user?.id)
    );
  }, [foods, user]);

  async function handleRate() {
    if (!showRating) return;
    setSubmitting(true);
    try {
      await rateDelivery(showRating.id, volunteerRating, foodRating);
      addToast('success', 'Thanks!', 'Your rating has been submitted');
      setShowRating(null);
      setVolunteerRating(0);
      setFoodRating(0);
    } catch (err) {
      addToast('error', 'Error', 'Failed to submit rating');
    }
    setSubmitting(false);
  }

  if (deliveredFoods.length === 0) return null;

  return (
    <div style={{ marginBottom: '32px' }}>
      <h3 style={{ fontSize: '1rem', fontWeight: 700, marginBottom: '16px', color: 'var(--slate-800)' }}>
        ⭐ Rate Your Deliveries
      </h3>
      <div className="food-grid">
        {deliveredFoods.map(food => (
          <FoodCard
            key={food.id}
            food={food}
            actions={
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setShowRating(food)}
                style={{ width: '100%' }}
              >
                <Star size={14} /> Rate Delivery
              </button>
            }
          />
        ))}
      </div>

      <Modal
        isOpen={!!showRating}
        onClose={() => setShowRating(null)}
        title="Rate Your Experience"
        footer={
          <>
            <button className="btn btn-ghost" onClick={() => setShowRating(null)}>Skip</button>
            <button className="btn btn-primary" onClick={handleRate} disabled={submitting || (volunteerRating === 0 && foodRating === 0)}>
              {submitting ? <span className="spinner" /> : <><ThumbsUp size={14} /> Submit Rating</>}
            </button>
          </>
        }
      >
        {showRating && (
          <div>
            <p style={{ marginBottom: '24px', color: 'var(--slate-600)', fontSize: '0.9rem' }}>
              How was your experience with <strong>{showRating.name}</strong>?
            </p>

            <div style={{ marginBottom: '24px' }}>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--slate-700)' }}>
                Volunteer Rating
              </label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    className={`rating-star ${i <= volunteerRating ? 'filled' : ''}`}
                    onClick={() => setVolunteerRating(i)}
                    style={{ fontSize: '1.5rem', background: 'none', border: 'none' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, marginBottom: '8px', color: 'var(--slate-700)' }}>
                Food Quality Rating
              </label>
              <div className="rating-stars">
                {[1, 2, 3, 4, 5].map(i => (
                  <button
                    key={i}
                    className={`rating-star ${i <= foodRating ? 'filled' : ''}`}
                    onClick={() => setFoodRating(i)}
                    style={{ fontSize: '1.5rem', background: 'none', border: 'none' }}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
