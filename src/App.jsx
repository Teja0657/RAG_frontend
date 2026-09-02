import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage      from './pages/Login/LoginPage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ChatPage       from './pages/Chat/ChatPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AboutUs        from './pages/AboutUs/AboutUs';
import ContactUs      from './pages/ContactUs/ContactUs';

const Spinner = () => (
  <div style={{
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    height: '100vh', background: 'var(--bg)', flexDirection: 'column', gap: '10px'
  }}>
    <div style={{
      width: 32, height: 32,
      border: '3px solid var(--border)',
      borderTopColor: 'var(--accent)',
      borderRadius: '50%',
      animation: 'spin 0.7s linear infinite',
    }} />
    <span style={{ color: 'var(--text-muted)', fontFamily: 'var(--font-ui)', fontSize: 14 }}>
      Loading…
    </span>
    <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
  </div>
);

const AppRoutes = () => {
  const { isLoading } = useAuth0();

  // Wait for Auth0 to restore session before rendering any routes
  if (isLoading) return <Spinner />;

  return (
    <Routes>
      {/* Public */}
      <Route path="/"                element={<Navigate to="/login" replace />} />
      <Route path="/login"           element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/about"           element={<AboutUs />} />
      <Route path="/contact"         element={<ContactUs />} />

      {/* Protected: User */}
      <Route path="/chat" element={
        <ProtectedRoute requiredRole="user">
          <ChatPage />
        </ProtectedRoute>
      } />

      {/* Protected: Admin */}
      <Route path="/admin" element={
        <ProtectedRoute requiredRole="admin">
          <AdminDashboard />
        </ProtectedRoute>
      } />

      {/* Catch-all */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
};

const App = () => {
  return (
    <AuthProvider>
      <AppRoutes />
    </AuthProvider>
  );
};

export default App;