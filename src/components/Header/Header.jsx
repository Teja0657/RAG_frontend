import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header = () => {
  const { currentUser, isAdmin, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login', { replace: true });
  };

  const displayName = currentUser?.name || currentUser?.email || 'User';

  return (
    <header className={styles.header}>

      {/* Logo */}
      <NavLink to={isAdmin ? '/admin' : '/chat'} className={styles.logo}>
        <div className={styles.logoIcon}>R</div>
        <span className={styles.logoText}>RAG<span>Chat</span></span>
      </NavLink>

      {/* Right side */}
      <div className={styles.right}>
        <div className={styles.userBadge}>
          <span className={styles.userDot} />
          <span className={styles.userName}>{displayName}</span>
        </div>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Sign out
        </button>
      </div>

    </header>
  );
};

export default Header;