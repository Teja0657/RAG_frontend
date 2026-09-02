import { createContext, useContext, useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    logout: auth0Logout,
  } = useAuth0();

  const [adminUser, setAdminUser] = useState(() => {
    const saved = sessionStorage.getItem('rag_admin');
    return saved ? JSON.parse(saved) : null;
  });

  const [role, setRole] = useState(() => sessionStorage.getItem('rag_role') || null);

  useEffect(() => {
    if (auth0Loading) return;
    if (isAuthenticated && auth0User) {
      setRole('user');
      sessionStorage.setItem('rag_role', 'user');
    } else if (!isAuthenticated && !adminUser) {
      setRole(null);
      sessionStorage.removeItem('rag_role');
    }
  }, [isAuthenticated, auth0User, auth0Loading, adminUser]);

  const adminLogin = (email, password) => {
    const ADMIN_EMAIL    = import.meta.env.VITE_ADMIN_EMAIL;
    const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD;
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const user = { email, name: 'Administrator', role: 'admin' };
      setAdminUser(user);
      setRole('admin');
      sessionStorage.setItem('rag_role', 'admin');
      sessionStorage.setItem('rag_admin', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, error: 'Invalid admin credentials.' };
  };

  const logout = () => {
    setAdminUser(null);
    setRole(null);
    sessionStorage.clear();
    localStorage.removeItem('rag_logged_out');

    // Mark as logged out to block back navigation
    localStorage.setItem('rag_logged_out', 'true');

    if (isAuthenticated) {
      auth0Logout({
        logoutParams: {
          returnTo: window.location.origin,
        }
      });
    }
  };

  const isAdmin    = role === 'admin';
  const isUser     = role === 'user';
  const isLoggedIn = isAdmin || isUser;

  const currentUser = isAdmin
    ? adminUser
    : auth0User
      ? {
          name:    auth0User.name !== auth0User.email
                     ? auth0User.name
                     : auth0User.nickname || auth0User.email.split('@')[0],
          email:   auth0User.email,
          picture: auth0User.picture,
          role:    'user'
        }
      : null;

  return (
    <AuthContext.Provider value={{
      role,
      currentUser,
      isAdmin,
      isUser,
      isLoggedIn,
      isLoading: auth0Loading,
      adminLogin,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};