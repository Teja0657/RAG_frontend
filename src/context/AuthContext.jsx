import { createContext, useContext, useState } from 'react';

const ADMIN_EMAIL    = 'admin@gmail.com';
const ADMIN_PASSWORD = 'Admin@123';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [role, setRole]       = useState(() => sessionStorage.getItem('rag_role') || null);
  const [currentUser, setCurrentUser] = useState(() => {
    const saved = sessionStorage.getItem('rag_user');
    return saved ? JSON.parse(saved) : null;
  });

  const adminLogin = (email, password) => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const user = { email, name: 'Administrator', role: 'admin' };
      setCurrentUser(user);
      setRole('admin');
      sessionStorage.setItem('rag_role', 'admin');
      sessionStorage.setItem('rag_user', JSON.stringify(user));
      return { success: true };
    }
    return { success: false, error: 'Invalid admin credentials.' };
  };

  const userLogin = (email, password) => {
    if (!email || !password) {
      return { success: false, error: 'Email and password are required.' };
    }
    // Mock user login — replace with real API call later
    const user = { email, name: email.split('@')[0], role: 'user' };
    setCurrentUser(user);
    setRole('user');
    sessionStorage.setItem('rag_role', 'user');
    sessionStorage.setItem('rag_user', JSON.stringify(user));
    return { success: true };
  };

  const logout = () => {
    setRole(null);
    setCurrentUser(null);
    sessionStorage.removeItem('rag_role');
    sessionStorage.removeItem('rag_user');
  };

  const isAdmin    = role === 'admin';
  const isUser     = role === 'user';
  const isLoggedIn = isAdmin || isUser;

  return (
    <AuthContext.Provider value={{
      role,
      currentUser,
      isAdmin,
      isUser,
      isLoggedIn,
      adminLogin,
      userLogin,
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