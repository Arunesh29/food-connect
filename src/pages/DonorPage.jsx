import { useState, useMemo, useRef } from 'react';
import { useApp } from '../context/AppContext';
import { useFoods, addFood, deleteFood } from '../services/foodService';
import FoodCard from '../components/FoodCard';
import SkeletonCard from '../components/SkeletonCard';
import { Plus, Upload, X, Trash2, ImageIcon } from 'lucide-react';

const CATEGORIES = ['veg', 'non-veg', 'packed', 'fresh'];

// Compress image to base64 — works without Firebase Storage
function compressToBase64(file, maxWidth = 800, quality = 0.75) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      const scale = Math.min(1, maxWidth / img.width);
      const canvas = document.createElement('canvas');
      canvas.width = img.width * scale;
      canvas.height = img.height * scale;
      canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
    img.onerror = reject;
    img.src = url;
  });
}

export default function DonorPage() {
  const { user, addToast, addNotification } = useApp();
  const myFilter = useMemo(() => (f) => user?.role === 'admin' ? true : f.donorId === user?.uid, [user?.uid, user?.role]);
  const { foods, loading } = useFoods(myFilter);

  const [saving, setSaving] = useState(false);
  const [imgFile, setImgFile] = useState(null);
  const [imgPreview, setImgPreview] = useState('');
  const [uploadStatus, setUploadStatus] = useState(''); // 'uploading' | 'done' | 'local'
  const fileRef = useRef();

  const [form, setForm] = useState({ name: '', quantity: '', category: 'veg', location: '', expiryHours: '4' });
  const set = (k, v) => setForm(f => ({ ...f, [k]: v }));

  async function onFile(e) {
    const f = e.target.files[0];
    if (!f) return;

    // Validate size (max 15MB raw)
    if (f.size > 15 * 1024 * 1024) {
      addToast('error', 'File too large', 'Please choose an image under 15MB.');
      return;
    }

    setImgFile(f);
    setUploadStatus('uploading');

    // Show preview immediately using local URL
    const localUrl = URL.createObjectURL(f);
    setImgPreview(localUrl);
    setUploadStatus('done');
  }

  function removeImage() {
    setImgPreview('');
    setImgFile(null);
    setUploadStatus('');
    if (fileRef.current) fileRef.current.value = '';
  }

  function resetForm() {
    setForm({ name: '', quantity: '', category: 'veg', location: '', expiryHours: '4' });
    removeImage();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!form.name.trim() || !form.quantity.trim() || !form.location.trim()) {
      addToast('error', 'Missing fields', 'Please fill in name, quantity, and location.');
      return;
    }

    setSaving(true);
    let imageUrl = '';

    // Skip Firebase Storage (it hangs) — use base64 directly, it's instant and reliable
    if (imgFile) {
      try {
        imageUrl = await compressToBase64(imgFile);
      } catch {
        addToast('info', 'Photo skipped', 'Could not process the photo, but your listing will still post.');
      }
    }

    try {
      const expiryTime = new Date(Date.now() + parseInt(form.expiryHours) * 3600000).toISOString();
      await addFood({
        ...form,
        name: form.name.trim(),
        quantity: form.quantity.trim(),
        location: form.location.trim(),
        imageUrl,
        expiryTime,
        donorId: user.uid,
        donorName: user.name,
      });

      addToast('success', 'Listing posted!', `"${form.name}" is now live.`);
      addNotification('New listing', `You listed "${form.name}".`);
      resetForm();
    } catch (err) {
      console.error('addFood error:', err);
      addToast('error', 'Post failed', 'Could not save your listing. Please try again.');
    }

    setSaving(false);
  }

  const available = foods.filter(f => f.status === 'available');
  const others = foods.filter(f => f.status !== 'available');

  return (
    <div className="page-shell">
      <div className="wrap section">
        {/* Header */}
        <div style={{ marginBottom: 48 }}>
          <span className="label-caps" style={{ marginBottom: 10, display: 'block' }}>Donor Dashboard</span>
          <h1 className="display-lg">Your listings</h1>
          <p className="body-lg" style={{ marginTop: 10 }}>
            Share surplus food and track requests from your community.
          </p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '360px 1fr', gap: 48, alignItems: 'start' }}>
          {/* ── Post Form ── */}
          <div style={{ position: 'sticky', top: 100 }}>
            <div className="card">
              <div style={{ padding: '24px 24px 0' }}>
                <h2 className="display-sm" style={{ marginBottom: 4 }}>Post a listing</h2>
                <p className="body-sm">Takes about 60 seconds.</p>
              </div>
              <div className="divider" style={{ margin: '20px 0' }} />

              <form onSubmit={handleSubmit} style={{ padding: '0 24px 24px' }}>

                {/* ── Image Upload ── */}
                {imgPreview ? (
                  <div style={{ position: 'relative', marginBottom: 20, borderRadius: 'var(--radius-md)', overflow: 'hidden' }}>
                    <img
                      src={imgPreview}
                      alt="Preview"
                      style={{ width: '100%', height: 180, objectFit: 'cover', display: 'block' }}
                    />
                    <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(0,0,0,0.4) 0%, transparent 50%)' }} />
                    <button
                      type="button"
                      onClick={removeImage}
                      style={{
                        position: 'absolute', top: 10, right: 10,
                        width: 30, height: 30, borderRadius: '50%',
                        background: 'white', border: 'none',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        cursor: 'pointer', boxShadow: 'var(--shadow-md)',
                      }}
                    >
                      <X size={14} />
                    </button>
                    <div style={{ position: 'absolute', bottom: 10, left: 12, color: 'white', fontSize: '0.72rem', display: 'flex', alignItems: 'center', gap: 5 }}>
                      <ImageIcon size={12} /> Photo attached
                    </div>
                  </div>
                ) : (
                  <label
                    style={{
                      display: 'block', marginBottom: 20,
                      border: '2px dashed var(--border-strong)',
                      borderRadius: 'var(--radius-md)',
                      padding: '36px 20px', textAlign: 'center',
                      cursor: 'pointer', transition: 'var(--transition)',
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = 'var(--ink)'; e.currentTarget.style.background = 'var(--canvas-warm)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = 'var(--border-strong)'; e.currentTarget.style.background = 'transparent'; }}
                  >
                    <input
                      ref={fileRef}
                      type="file"
                      accept="image/*"
                      onChange={onFile}
                      style={{ display: 'none' }}
                    />
                    <Upload size={22} color="var(--ink-faint)" style={{ margin: '0 auto 10px' }} />
                    <p className="body-sm" style={{ marginBottom: 4 }}>
                      <strong style={{ color: 'var(--ink)' }}>Click to upload</strong> a photo
                    </p>
                    <p style={{ fontSize: '0.72rem', color: 'var(--ink-faint)' }}>JPG, PNG, WEBP up to 15MB</p>
                  </label>
                )}

                <div className="field">
                  <label className="field-label">Food name *</label>
                  <input
                    type="text" className="field-input"
                    placeholder="e.g. Dal, Biryani, Bread rolls"
                    value={form.name}
                    onChange={e => set('name', e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Quantity *</label>
                  <input
                    type="text" className="field-input"
                    placeholder="e.g. 5 boxes, feeds 10 people"
                    value={form.quantity}
                    onChange={e => set('quantity', e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Category</label>
                  <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {CATEGORIES.map(c => (
                      <button
                        key={c} type="button"
                        onClick={() => set('category', c)}
                        className={`chip ${form.category === c ? 'active' : ''}`}
                        style={{ textTransform: 'capitalize' }}
                      >
                        {c}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="field">
                  <label className="field-label">Pickup location *</label>
                  <input
                    type="text" className="field-input"
                    placeholder="Full address or landmark"
                    value={form.location}
                    onChange={e => set('location', e.target.value)}
                    required
                  />
                </div>

                <div className="field">
                  <label className="field-label">Available for</label>
                  <select className="field-input" value={form.expiryHours} onChange={e => set('expiryHours', e.target.value)}>
                    {[['1','1 hour'], ['2','2 hours'], ['4','4 hours'], ['8','8 hours'], ['12','12 hours'], ['24','24 hours']].map(([v, l]) => (
                      <option key={v} value={v}>{l}</option>
                    ))}
                  </select>
                </div>

                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={saving}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {saving ? <><span className="spinner" /> Posting…</> : <><Plus size={16} /> Post listing</>}
                </button>
              </form>
            </div>
          </div>

          {/* ── Listings ── */}
          <div>
            {loading ? (
              <div className="food-grid"><SkeletonCard count={4} /></div>
            ) : foods.length === 0 ? (
              <div className="empty">
                <div className="empty-icon">🥡</div>
                <h3>No listings yet</h3>
                <p>Post your first food listing using the form. It only takes a minute.</p>
              </div>
            ) : (
              <>
                {available.length > 0 && (
                  <div style={{ marginBottom: 40 }}>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 20, color: 'var(--ink-muted)' }}>
                      Active ({available.length})
                    </h3>
                    <div className="food-grid">
                      {available.map(food => (
                        <FoodCard key={food.id} food={food} actions={
                          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
                            <span className="body-sm">{food.requestedUsers?.length || 0} request(s)</span>
                            <button
                              onClick={async () => {
                                if (window.confirm(`Are you sure you want to delete "${food.name}"?`)) {
                                  try {
                                    await deleteFood(food.id);
                                    addToast('success', 'Deleted', 'Your listing has been removed.');
                                  } catch {
                                    addToast('error', 'Error', 'Could not delete listing.');
                                  }
                                }
                              }}
                              className="btn btn-ghost btn-sm"
                              style={{ color: 'var(--accent)', padding: '6px 10px' }}
                              title="Remove listing"
                            >
                              <Trash2 size={15} />
                            </button>
                          </div>
                        } />
                      ))}
                    </div>
                  </div>
                )}
                {others.length > 0 && (
                  <div>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: '1.2rem', marginBottom: 20, color: 'var(--ink-muted)' }}>
                      Past listings ({others.length})
                    </h3>
                    <div className="food-grid">
                      {others.map(food => <FoodCard key={food.id} food={food} />)}
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
