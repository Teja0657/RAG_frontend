import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const ProtectedRoute = ({ children, requiredRole }) => {
  const { role, isLoggedIn } = useAuth();
  const location = useLocation();

  if (!isLoggedIn) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return <Navigate to={role === 'admin' ? '/admin' : '/chat'} replace />;
  }

  return children;
};

export default ProtectedRoute;