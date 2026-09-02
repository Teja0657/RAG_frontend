import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth0 } from '@auth0/auth0-react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import styles from './LoginPage.module.css';

const LoginPage = () => {
  const [role, setRole]         = useState('user');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  const { loginWithRedirect, isLoading: auth0Loading } = useAuth0();
  const { adminLogin, isLoggedIn, isAdmin, isLoading }  = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!isLoading && isLoggedIn) {
      navigate(isAdmin ? '/admin' : '/chat', { replace: true });
    }
  }, [isLoggedIn, isAdmin, isLoading, navigate]);

  if (auth0Loading) {
    return (
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
  }

  const handleAdminSubmit = (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    const result = adminLogin(email, password);
    setLoading(false);
    if (result.success) {
      navigate('/admin', { replace: true });
    } else {
      setError(result.error);
    }
  };

  const handleUserLogin = () => {
    loginWithRedirect({ appState: { returnTo: '/chat' } });
  };

  const handleSignUp = () => {
    loginWithRedirect({
      authorizationParams: { screen_hint: 'signup' },
      appState: { returnTo: '/chat' },
    });
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg)' }}>

      {/* Public header — no profile, just logo + nav */}
      <Header showNav={true} />

      {/* Login card */}
      <div style={{
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px',
      }}>
        <div className={styles.card}>

          {/* Logo */}
          <div className={styles.logoRow}>
            <div className={styles.logoIcon}>R</div>
            <span className={styles.logoText}>RAG<span>Chat</span></span>
          </div>

          <h1 className={styles.heading}>Welcome back</h1>
          <p className={styles.sub}>Sign in to continue to your workspace.</p>

          {/* Role toggle */}
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

          {/* User — Auth0 */}
          {role === 'user' && (
            <div className={styles.form}>
              <div style={{
                background: 'var(--bg-elevated)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius-sm)',
                padding: '12px 16px',
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                🔐 User login is handled securely by{' '}
                <strong style={{ color: 'var(--text-primary)' }}>Auth0</strong>.
                You'll be redirected to sign in with your email or Google account.
              </div>

              <button className={styles.submitBtn} onClick={handleUserLogin}>
                Sign in
              </button>

              <div className={styles.footer}>
                Don't have an account?{' '}
                <span
                  style={{ color: 'var(--accent)', cursor: 'pointer', fontWeight: 500 }}
                  onClick={handleSignUp}
                >
                  Sign up
                </span>
              </div>
            </div>
          )}

          {/* Admin — local */}
          {role === 'admin' && (
            <form className={styles.form} onSubmit={handleAdminSubmit}>
              {error && <p className={styles.error}>{error}</p>}

              <div className={styles.field}>
                <label className={styles.label}>Email</label>
                <input
                  type="email"
                  className={`${styles.input} ${styles.adminFocus}`}
                  placeholder="admin@gmail.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Password</label>
                <input
                  type="password"
                  className={`${styles.input} ${styles.adminFocus}`}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className={`${styles.submitBtn} ${styles.adminBtn}`}
                disabled={loading}
              >
                {loading ? 'Signing in…' : 'Sign in as Admin'}
              </button>
            </form>
          )}

        </div>
      </div>
    </div>
  );
};

export default LoginPage;