import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [role, setRole]         = useState('user');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { adminLogin, userLogin, isLoggedIn, isAdmin } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (isLoggedIn) {
      navigate(isAdmin ? '/admin' : '/chat', { replace: true });
    }
  }, [isLoggedIn, isAdmin, navigate]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = role === 'admin'
      ? adminLogin(email, password)
      : userLogin(email, password);
    setLoading(false);
    if (result.success) {
      navigate(role === 'admin' ? '/admin' : '/chat', { replace: true });
    } else {
      setError(result.error);
    }
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>R</div>
          <span className={styles.logoText}>RAG<span>Chat</span></span>
        </div>

        <h1 className={styles.heading}>Welcome back</h1>
        <p className={styles.sub}>Sign in to continue to your workspace.</p>

        <div className={styles.roleToggle}>
          <button
            className={`${styles.roleBtn} ${role === 'user' ? styles.selected : ''}`}
            onClick={() => { setRole('user'); setError(''); }}
          >
            User
          </button>
          <button
            className={`${styles.roleBtn} ${role === 'admin' ? styles.adminSelected : ''}`}
            onClick={() => { setRole('admin'); setError(''); }}
          >
            Admin
          </button>
        </div>

        <form className={styles.form} onSubmit={handleSubmit}>
          {error && <p className={styles.error}>{error}</p>}
          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              type="email"
              className={`${styles.input} ${role === 'admin' ? styles.adminFocus : ''}`}
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              type="password"
              className={`${styles.input} ${role === 'admin' ? styles.adminFocus : ''}`}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {role === 'user' && (
            <div className={styles.forgotRow}>
              <Link to="/forgot-password" className={styles.forgotLink}>
                Forgot password?
              </Link>
            </div>
          )}
          <button
            type="submit"
            className={`${styles.submitBtn} ${role === 'admin' ? styles.adminBtn : ''}`}
            disabled={loading}
          >
            {loading ? 'Signing in…' : role === 'admin' ? 'Sign in as Admin' : 'Sign in'}
          </button>
        </form>

        {role === 'user' && (
          <div className={styles.footer}>
            Don't have an account? <Link to="/register">Create one</Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default LoginPage;