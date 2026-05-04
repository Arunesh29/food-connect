import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, useApp } from './context/AppContext';
import Navbar from './components/Navbar';
import ToastContainer from './components/ToastContainer';
import HomePage from './pages/HomePage';
import LoginPage from './pages/LoginPage';
import AdminLoginPage from './pages/AdminLoginPage';
import DonorPage from './pages/DonorPage';
import ReceiverPage from './pages/ReceiverPage';
import VolunteerPage from './pages/VolunteerPage';
import AdminPage from './pages/AdminPage';
import ProfilePage from './pages/ProfilePage';
import { useEffect } from 'react';

function AuthLoading() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh', background: 'var(--canvas)' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '3px solid var(--border)', borderTopColor: 'var(--ink)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }} />
        <p style={{ color: 'var(--ink-muted)', fontSize: '0.9rem' }}>Loading…</p>
      </div>
    </div>
  );
}

function ProtectedRoute({ role, adminRedirect, children }) {
  const { user, authLoading } = useApp();
  if (authLoading) return <AuthLoading />;
  if (!user) return <Navigate to={adminRedirect ? '/admin-login' : '/login'} replace />;
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { authLoading } = useApp();

  useEffect(() => {
    if (window.gsap && window.ScrollTrigger) {
      window.gsap.registerPlugin(window.ScrollTrigger);
    }
  }, []);

  if (authLoading) return <AuthLoading />;

  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/select-role" element={<ProtectedRoute><LoginPage selectionOnly /></ProtectedRoute>} />
        <Route path="/admin-login" element={<AdminLoginPage />} />
        <Route path="/donor" element={<ProtectedRoute role="donor"><DonorPage /></ProtectedRoute>} />
        <Route path="/receiver" element={<ProtectedRoute role="receiver"><ReceiverPage /></ProtectedRoute>} />
        <Route path="/volunteer" element={<ProtectedRoute role="volunteer"><VolunteerPage /></ProtectedRoute>} />
        <Route path="/admin" element={<ProtectedRoute role="admin" adminRedirect><AdminPage /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
      <ToastContainer />
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppProvider>
        <AppRoutes />
      </AppProvider>
    </BrowserRouter>
  );
}
