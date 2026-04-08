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

// Loading screen while auth state resolves
function AuthLoading() {
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      height: '100vh', background: 'var(--slate-50)',
      flexDirection: 'column', gap: '16px'
    }}>
      <div className="navbar-brand-icon" style={{ width: 56, height: 56, animation: 'pulse 1.5s infinite' }}>
        <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
          <path d="M17 8C8 10 5.9 16.17 3.82 21.34l1.89.66L17 8z" />
          <path d="M20.27 5.73l-2.42-2.42a1 1 0 00-1.41 0L14 5.73" />
        </svg>
      </div>
      <span className="spinner" />
      <p style={{ color: 'var(--slate-400)', fontSize: '0.85rem' }}>Authenticating...</p>
    </div>
  );
}

// Protected route — checks auth + role
function ProtectedRoute({ role, adminRedirect, children }) {
  const { user, authLoading } = useApp();

  if (authLoading) return <AuthLoading />;
  if (!user) {
    // Admin routes redirect to admin login, others to regular login
    return <Navigate to={adminRedirect ? '/admin-login' : '/login'} replace />;
  }
  if (role && user.role !== role) return <Navigate to="/" replace />;
  return children;
}

function AppRoutes() {
  const { user, authLoading } = useApp();

  // Show loading while Firebase auth resolves
  if (authLoading) return <AuthLoading />;

  return (
    <div className="app-wrapper">
      <Navbar />
      <ToastContainer />
      <Routes>
        <Route path="/" element={<HomePage />} />

        {/* Regular login */}
        <Route path="/login" element={
          user ? <Navigate to="/select-role" replace /> : <LoginPage />
        } />

        {/* New Role Selection Route */}
        <Route path="/select-role" element={
          <ProtectedRoute><LoginPage selectionOnly /></ProtectedRoute>
        } />

        {/* Admin login — separate secure page */}
        <Route path="/admin-login" element={
          user?.role === 'admin' ? <Navigate to="/admin" replace /> : <AdminLoginPage />
        } />

        {/* Protected role-specific routes */}
        <Route path="/donor" element={
          <ProtectedRoute role="donor"><DonorPage /></ProtectedRoute>
        } />
        <Route path="/receiver" element={
          <ProtectedRoute role="receiver"><ReceiverPage /></ProtectedRoute>
        } />
        <Route path="/volunteer" element={
          <ProtectedRoute role="volunteer"><VolunteerPage /></ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute role="admin" adminRedirect><AdminPage /></ProtectedRoute>
        } />

        {/* Catch-all redirect */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
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
