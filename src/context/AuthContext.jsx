import { createContext, useContext } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext(null);

const ROLES_CLAIM = 'https://myapp.example.com/roles';

export const AuthProvider = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    logout: auth0Logout,
  } = useAuth0();

  const roles = auth0User?.[ROLES_CLAIM] || [];
  const isAdmin = roles.includes('admin');
  const isUser  = isAuthenticated && !isAdmin;

  const role = isAdmin ? 'admin' : isUser ? 'user' : null;
  const isLoggedIn = isAuthenticated;

  const currentUser = auth0User
    ? {
        name:    auth0User.name !== auth0User.email
                   ? auth0User.name
                   : auth0User.nickname || auth0User.email.split('@')[0],
        email:   auth0User.email,
        picture: auth0User.picture,
        role,
      }
    : null;

  const logout = () => {
    localStorage.setItem('rag_logged_out', 'true');
    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      }
    });
  };

  return (
    <AuthContext.Provider value={{
      role,
      currentUser,
      isAdmin,
      isUser,
      isLoggedIn,
      isLoading: auth0Loading,
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