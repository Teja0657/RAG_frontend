import { createContext, useContext, useEffect, useState } from 'react';
import { useAuth0 } from '@auth0/auth0-react';

const AuthContext = createContext(null);

const ROLES_CLAIM = 'https://myapp.example.com/roles';

export const AuthProvider = ({ children }) => {
  const {
    isAuthenticated,
    isLoading: auth0Loading,
    user: auth0User,
    logout: auth0Logout,
    getAccessTokenSilently,
  } = useAuth0();

  const [role, setRole] = useState(null);
  const [roleLoading, setRoleLoading] = useState(true);

  useEffect(() => {
    const loadRole = async () => {
      if (!isAuthenticated) {
        setRole(null);
        setRoleLoading(false);
        return;
      }

      try {
        const token = await getAccessTokenSilently();

        const response = await fetch(
          `${import.meta.env.VITE_API_URL || 'http://localhost:8000'}/api/me`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        if (!response.ok) {
          throw new Error('Failed to load user role');
        }

        const data = await response.json();

        const roles = data.claims?.[ROLES_CLAIM] || [];

        setRole(
          roles.includes('admin')
            ? 'admin'
            : 'user'
        );
      } catch (error) {
        console.error('Failed to load user role:', error);
        setRole(null);
      } finally {
        setRoleLoading(false);
      }
    };

    loadRole();
  }, [isAuthenticated, getAccessTokenSilently]);

  const isAdmin = role === 'admin';
  const isUser = role === 'user';
  const isLoggedIn = isAuthenticated;

  const currentUser = auth0User
    ? {
        name:
          auth0User.name !== auth0User.email
            ? auth0User.name
            : auth0User.nickname || auth0User.email.split('@')[0],
        email: auth0User.email,
        picture: auth0User.picture,
        role,
      }
    : null;

  const logout = () => {
    localStorage.setItem('rag_logged_out', 'true');

    auth0Logout({
      logoutParams: {
        returnTo: window.location.origin,
      },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        role,
        currentUser,
        isAdmin,
        isUser,
        isLoggedIn,
        isLoading: auth0Loading || roleLoading,
        logout,
        getAccessTokenSilently,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);

  if (!ctx) {
    throw new Error('useAuth must be used inside AuthProvider');
  }

 return ctx;
};