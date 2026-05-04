import { useState } from 'react';
import { useApp } from '../context/AppContext';
import { saveUserProfile } from '../services/userService';
import { User, Mail, Shield, Camera, Save, LogOut } from 'lucide-react';

export default function ProfilePage() {
  const { user, logout, addToast } = useApp();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    photoURL: user?.photoURL || ''
  });

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await saveUserProfile(user.uid, {
        name: formData.name,
        photoURL: formData.photoURL
      });
      addToast('success', 'Profile Updated', 'Your changes have been saved successfully');
    } catch (err) {
      addToast('error', 'Update Failed', 'Failed to save profile changes');
    }
    setLoading(false);
  }

  return (
    <div className="container page-content">
      <div className="page-header">
        <h1 className="page-title">👤 My Profile</h1>
        <p className="page-subtitle">Manage your account settings and preferences</p>
      </div>

      <div className="card animate-fade-in" style={{ maxWidth: '600px', margin: '0 auto' }}>
        <div className="card-body">
          <div style={{ textAlign: 'center', marginBottom: '32px' }}>
            <div style={{ position: 'relative', display: 'inline-block' }}>
              {formData.photoURL ? (
                <img 
                  src={formData.photoURL} 
                  alt="Profile" 
                  style={{ width: '100px', height: '100px', borderRadius: '50%', objectFit: 'cover', border: '4px solid var(--green-100)' }} 
                />
              ) : (
                <div style={{ width: '100px', height: '100px', borderRadius: '50%', background: 'var(--slate-100)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--slate-400)' }}>
                  <User size={48} />
                </div>
              )}
              <button className="btn btn-icon" style={{ position: 'absolute', bottom: 0, right: 0, background: 'white', boxShadow: 'var(--shadow-md)', borderRadius: '50%', padding: '8px' }}>
                <Camera size={16} />
              </button>
            </div>
            <h2 style={{ marginTop: '16px', fontSize: '1.25rem', fontWeight: 700 }}>{user?.name}</h2>
            <span className={`badge badge-${user?.role}`} style={{ marginTop: '8px' }}>{user?.role}</span>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Full Name</label>
              <div style={{ position: 'relative' }}>
                <User size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input 
                  type="text" 
                  className="form-input" 
                  style={{ paddingLeft: '40px' }}
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <Mail size={18} style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--slate-400)' }} />
                <input 
                  type="email" 
                  className="form-input" 
                  style={{ paddingLeft: '40px', background: 'var(--slate-50)', cursor: 'not-allowed' }}
                  value={formData.email}
                  disabled
                />
              </div>
              <p style={{ fontSize: '0.75rem', color: 'var(--slate-400)', marginTop: '4px' }}>Email cannot be changed.</p>
            </div>

            <div className="form-group">
              <label className="form-label">Profile Image URL</label>
              <input 
                type="text" 
                className="form-input" 
                placeholder="https://example.com/photo.jpg"
                value={formData.photoURL}
                onChange={(e) => setFormData({...formData, photoURL: e.target.value})}
              />
            </div>

            <div style={{ display: 'flex', gap: '12px', marginTop: '32px' }}>
              <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={loading}>
                {loading ? <span className="spinner" /> : <><Save size={18} /> Save Changes</>}
              </button>
              <button type="button" className="btn btn-outline" onClick={logout} style={{ color: 'var(--error)', borderColor: 'var(--error)' }}>
                <LogOut size={18} /> Logout
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
