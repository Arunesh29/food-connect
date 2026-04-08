import { useState, useMemo } from 'react';
import { useApp } from '../context/AppContext';
import { useFoods, addFood, uploadImage } from '../services/foodService';
import FoodCard from '../components/FoodCard';
import SkeletonCard from '../components/SkeletonCard';
import { Plus, Upload, Clock, Zap, Image as ImageIcon, X, Leaf, Utensils, Box, Apple } from 'lucide-react';

export default function DonorPage() {
  const { user, addToast, addNotification } = useApp();
  const filter = useMemo(() => {
    return (f) => user?.role === 'admin' ? true : f.donorId === user?.uid;
  }, [user?.uid, user?.role]);

  const { foods, loading } = useFoods(filter);
  const [submitting, setSubmitting] = useState(false);
  const [imagePreview, setImagePreview] = useState(null);
  const [imageFile, setImageFile] = useState(null);

  const [form, setForm] = useState({
    name: '',
    quantity: '',
    category: 'veg',
    location: '',
    expiryHours: '2',
    pickupOption: 'ready'
  });

  function updateForm(key, value) {
    setForm(prev => ({ ...prev, [key]: value }));
  }

  function handleImageChange(e) {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  }

  function removeImage() {
    setImagePreview(null);
    setImageFile(null);
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.quantity || !form.location) {
      addToast('error', 'Missing Fields', 'Please fill in all required fields');
      return;
    }

    setSubmitting(true);

    try {
      let imageUrl = '';
      if (imageFile) {
        try {
          imageUrl = await uploadImage(imageFile);
        } catch (storageErr) {
          console.warn('Storage failed/blocked. Falling back to default category image.', storageErr);
          // imageUrl remains empty, addFood will handle the fallback
        }
      }

      const expiryTime = new Date(Date.now() + parseInt(form.expiryHours) * 60 * 60 * 1000).toISOString();

      await addFood({
        name: form.name,
        quantity: form.quantity,
        category: form.category,
        location: form.location,
        imageUrl,
        expiryTime,
        pickupOption: form.pickupOption,
        donorId: user.uid,
        donorName: user.name
      });

      addToast('success', 'Food Posted!', `${form.name} is now listed for pickup`);
      addNotification('Food Posted', `You listed "${form.name}" — ${form.quantity}`);

      setForm({ name: '', quantity: '', category: 'veg', location: '', expiryHours: '2', pickupOption: 'ready' });
      setImagePreview(null);
      setImageFile(null);
    } catch (err) {
      addToast('error', 'Posting Failed', err.message || 'Check your internet or image size.');
      console.error('Firestore/Storage Error:', err);
    }

    setSubmitting(false);
  }

  return (
    <div className="container page-content">
      <div className="page-header">
        <h1 className="page-title">🎁 Donor Dashboard</h1>
        <p className="page-subtitle">Post surplus food and track your donations</p>
      </div>

      <div className="donor-page">
        {/* Form */}
        <div className="donor-form-card animate-fade-in">
          <h3 className="donor-form-title">
            <Plus size={20} /> Post New Food
          </h3>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Food Name *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Fresh Vegetable Platter"
                value={form.name}
                onChange={(e) => updateForm('name', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Quantity *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 10 servings, 5 boxes"
                value={form.quantity}
                onChange={(e) => updateForm('quantity', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '8px' }}>
                {[
                  { value: 'veg', label: 'Veg', icon: <Leaf size={14} />, color: 'var(--green-600)' },
                  { value: 'non-veg', label: 'Non-Veg', icon: <Utensils size={14} />, color: 'var(--error)' },
                  { value: 'packed', label: 'Packed', icon: <Box size={14} />, color: '#6366f1' },
                  { value: 'fresh', label: 'Fresh', icon: <Apple size={14} />, color: '#0891b2' }
                ].map(cat => (
                  <button
                    key={cat.value}
                    type="button"
                    className={`filter-chip ${form.category === cat.value ? 'active' : ''}`}
                    onClick={() => updateForm('category', cat.value)}
                    style={form.category === cat.value ? { background: cat.color, borderColor: cat.color } : {}}
                  >
                    {cat.icon} {cat.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Location *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. 123 Main St, Downtown"
                value={form.location}
                onChange={(e) => updateForm('location', e.target.value)}
              />
            </div>

            <div className="form-group">
              <label className="form-label">Upload Photo</label>
              {imagePreview ? (
                <div className="image-preview">
                  <img src={imagePreview} alt="Preview" />
                  <button type="button" className="image-preview-remove" onClick={removeImage}>
                    <X size={12} />
                  </button>
                </div>
              ) : (
                <div className="form-file-wrapper">
                  <input type="file" accept="image/*" onChange={handleImageChange} />
                  <div className="form-file-icon"><Upload size={28} /></div>
                  <p className="form-file-text">
                    <strong>Click to upload</strong> or drag and drop
                  </p>
                </div>
              )}
            </div>

            <div className="form-group">
              <label className="form-label">Expiry Time</label>
              <select
                className="form-select"
                value={form.expiryHours}
                onChange={(e) => updateForm('expiryHours', e.target.value)}
              >
                <option value="1">1 hour</option>
                <option value="2">2 hours</option>
                <option value="4">4 hours</option>
                <option value="6">6 hours</option>
                <option value="12">12 hours</option>
                <option value="24">24 hours</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Pickup Option</label>
              <div className="form-radio-group">
                <div className="form-radio-option">
                  <input
                    type="radio"
                    id="ready-now"
                    name="pickup"
                    checked={form.pickupOption === 'ready'}
                    onChange={() => updateForm('pickupOption', 'ready')}
                  />
                  <label htmlFor="ready-now" className="form-radio-label">
                    <Zap size={14} /> Ready Now
                  </label>
                </div>
                <div className="form-radio-option">
                  <input
                    type="radio"
                    id="pickup-30"
                    name="pickup"
                    checked={form.pickupOption === '30min'}
                    onChange={() => updateForm('pickupOption', '30min')}
                  />
                  <label htmlFor="pickup-30" className="form-radio-label">
                    <Clock size={14} /> After 30 min
                  </label>
                </div>
              </div>
            </div>

            <button
              type="submit"
              className="btn btn-primary btn-lg"
              style={{ width: '100%', marginTop: '8px' }}
              disabled={submitting}
            >
              {submitting ? (
                <><span className="spinner" /> Posting...</>
              ) : (
                <><Plus size={18} /> Post Food</>
              )}
            </button>
          </form>
        </div>

        {/* My Listings */}
        <div className="donor-listings">
          <div className="donor-listings-header">
            <h3 className="donor-listings-title">My Listings</h3>
            <span className="donor-listings-count">{foods.length} items</span>
          </div>

          {loading ? (
            <div className="food-grid">
              <SkeletonCard count={2} />
            </div>
          ) : foods.length === 0 ? (
            <div className="empty-state">
              <div className="empty-state-icon">🍽️</div>
              <h3>No food posted yet</h3>
              <p>Use the form to share your surplus food with those who need it</p>
            </div>
          ) : (
            <div className="food-grid">
              {foods.map(food => (
                <FoodCard
                  key={food.id}
                  food={food}
                  showRequests
                  actions={
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', width: '100%', justifyContent: 'space-between' }}>
                      <span className={`badge badge-${food.status}`}>{food.status}</span>
                      {food.requestedUsers?.length > 0 && (
                        <span style={{ fontSize: '0.8rem', color: 'var(--orange-600)', fontWeight: 600 }}>
                          {food.requestedUsers.length} request(s)
                        </span>
                      )}
                    </div>
                  }
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
