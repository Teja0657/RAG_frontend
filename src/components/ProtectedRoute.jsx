import { useEffect } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { role, isLoggedIn, isLoading } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  // Block back navigation after logout
  useEffect(() => {
    const loggedOut = localStorage.getItem('rag_logged_out');
    if (loggedOut === 'true') {
      localStorage.removeItem('rag_logged_out');
      navigate('/login', { replace: true });
    }
  }, [navigate]);

  if (isLoading) {
    return (
      <div style={{
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        height: '100vh', background: 'var(--bg)', color: 'var(--text-secondary)',
        fontFamily: 'var(--font-ui)', fontSize: '14px', gap: '10px',
        flexDirection: 'column',
      }}>
        <div style={{
          width: 32, height: 32,
          border: '3px solid var(--border)',
          borderTopColor: 'var(--accent)',
          borderRadius: '50%',
          animation: 'spin 0.7s linear infinite',
        }} />
        <span style={{ color: 'var(--text-muted)' }}>Loading…</span>
        <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/chat'} replace />;
  }

  return children;
};

export default ProtectedRoute;