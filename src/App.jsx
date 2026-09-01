import { Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

import LoginPage      from './pages/Login/LoginPage';
import RegisterPage   from './pages/Register/RegisterPage';
import ForgotPassword from './pages/ForgotPassword/ForgotPassword';
import ChatPage       from './pages/Chat/ChatPage';
import AdminDashboard from './pages/Admin/AdminDashboard';
import AboutUs        from './pages/AboutUs/AboutUs';
import ContactUs      from './pages/ContactUs/ContactUs';

const App = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Public */}
        <Route path="/"                element={<Navigate to="/login" replace />} />
        <Route path="/login"           element={<LoginPage />} />
        <Route path="/register"        element={<RegisterPage />} />
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
    </AuthProvider>
  );
};

export default App;