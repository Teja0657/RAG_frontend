import { useState, useRef, useEffect } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Header.module.css';

const Header = ({ showNav = true }) => {
  const { currentUser, isAdmin, isLoggedIn, logout } = useAuth();
  const navigate = useNavigate();

  const [open, setOpen]           = useState(false);
  const [panel, setPanel]         = useState(null); // 'edit' | 'reset' | null
  const [editForm, setEditForm]   = useState({ name: '', email: '' });
  const [resetForm, setResetForm] = useState({ current: '', newPass: '', confirm: '' });
  const [resetError, setResetError]     = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const [editSuccess, setEditSuccess]   = useState(false);
  const dropdownRef = useRef(null);

  const displayName = currentUser?.name || currentUser?.email?.split('@')[0] || 'User';
  const email       = currentUser?.email || '';
  const initials    = displayName
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  // Sync edit form with current user
  useEffect(() => {
    if (currentUser) {
      setEditForm({ name: currentUser.name || '', email: currentUser.email || '' });
    }
  }, [currentUser]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setPanel(null);
        setResetError('');
        setResetSuccess(false);
        setEditSuccess(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleLogout = () => {
    setOpen(false);
    logout();
    navigate('/login', { replace: true });
  };

  const handleEditSave = () => {
    // Will connect to backend later
    setEditSuccess(true);
    setTimeout(() => {
      setEditSuccess(false);
      setPanel(null);
    }, 1500);
  };

  const handleResetPassword = () => {
    setResetError('');
    if (!resetForm.current) {
      setResetError('Enter your current password.');
      return;
    }
    if (resetForm.newPass.length < 8) {
      setResetError('New password must be at least 8 characters.');
      return;
    }
    if (resetForm.newPass !== resetForm.confirm) {
      setResetError('Passwords do not match.');
      return;
    }
    setResetSuccess(true);
    setTimeout(() => {
      setResetSuccess(false);
      setResetForm({ current: '', newPass: '', confirm: '' });
      setPanel(null);
    }, 1500);
  };

  return (
    <header className={styles.header}>

      {/* Logo */}
      <NavLink to={isAdmin ? '/admin' : isLoggedIn ? '/chat' : '/'} className={styles.logo}>
        <div className={styles.logoIcon}>R</div>
        <span className={styles.logoText}>RAG<span>Chat</span></span>
      </NavLink>

      {/* Nav links — About Us + Contact Us */}
      {showNav && (
        <nav className={styles.nav}>
          <NavLink
            to="/about"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            About Us
          </NavLink>
          <NavLink
            to="/contact"
            className={({ isActive }) =>
              isActive ? `${styles.navLink} ${styles.active}` : styles.navLink
            }
          >
            Contact Us
          </NavLink>
        </nav>
      )}

      {/* Right — Profile or Sign out */}
      <div className={styles.right} ref={dropdownRef}>

        {isLoggedIn ? (
          <>
            {/* Profile button */}
            <button
              className={styles.profileBtn}
              onClick={() => { setOpen(p => !p); setPanel(null); }}
            >
              <div className={`${styles.avatar} ${isAdmin ? styles.admin : ''}`}>
                {initials}
              </div>
              <span className={styles.profileName}>{displayName}</span>
              <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
            </button>

            {/* Dropdown */}
            {open && panel === null && (
              <div className={styles.dropdown}>
                <div className={styles.dropdownHeader}>
                  <p className={styles.dropdownName}>{displayName}</p>
                  <p className={styles.dropdownEmail}>{email}</p>
                </div>
                <button
                  className={styles.dropdownItem}
                  onClick={() => setPanel('edit')}
                >
                  ✏️ Edit Profile
                </button>
                <button
                  className={styles.dropdownItem}
                  onClick={() => setPanel('reset')}
                >
                  🔑 Reset Password
                </button>
                <div className={styles.dropdownDivider} />
                <button
                  className={`${styles.dropdownItem} ${styles.danger}`}
                  onClick={handleLogout}
                >
                  🚪 Sign out
                </button>
              </div>
            )}

            {/* Edit Profile panel */}
            {open && panel === 'edit' && (
              <div className={styles.dropdown}>
                <div className={styles.subPanel}>
                  <p className={styles.subTitle}>Edit Profile</p>
                  {editSuccess && (
                    <p className={styles.subSuccess}>✅ Profile updated!</p>
                  )}
                  {!editSuccess && (
                    <>
                      <div className={styles.subField}>
                        <label className={styles.subLabel}>Name</label>
                        <input
                          className={styles.subInput}
                          value={editForm.name}
                          placeholder="Your name"
                          onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                        />
                      </div>
                      <div className={styles.subField}>
                        <label className={styles.subLabel}>Email</label>
                        <input
                          className={styles.subInput}
                          value={editForm.email}
                          placeholder="your@email.com"
                          onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                        />
                      </div>
                      <button className={styles.subBtn} onClick={handleEditSave}>
                        Save Changes
                      </button>
                      <button className={styles.subBtnGhost} onClick={() => setPanel(null)}>
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}

            {/* Reset Password panel */}
            {open && panel === 'reset' && (
              <div className={styles.dropdown}>
                <div className={styles.subPanel}>
                  <p className={styles.subTitle}>Reset Password</p>
                  {resetSuccess ? (
                    <p className={styles.subSuccess}>✅ Password updated!</p>
                  ) : (
                    <>
                      {resetError && (
                        <p className={styles.subError}>{resetError}</p>
                      )}
                      <div className={styles.subField}>
                        <label className={styles.subLabel}>Current Password</label>
                        <input
                          type="password"
                          className={styles.subInput}
                          placeholder="••••••••"
                          value={resetForm.current}
                          onChange={e => setResetForm({ ...resetForm, current: e.target.value })}
                        />
                      </div>
                      <div className={styles.subField}>
                        <label className={styles.subLabel}>New Password</label>
                        <input
                          type="password"
                          className={styles.subInput}
                          placeholder="Min. 8 characters"
                          value={resetForm.newPass}
                          onChange={e => setResetForm({ ...resetForm, newPass: e.target.value })}
                        />
                      </div>
                      <div className={styles.subField}>
                        <label className={styles.subLabel}>Confirm Password</label>
                        <input
                          type="password"
                          className={styles.subInput}
                          placeholder="Repeat new password"
                          value={resetForm.confirm}
                          onChange={e => setResetForm({ ...resetForm, confirm: e.target.value })}
                        />
                      </div>
                      <button className={styles.subBtn} onClick={handleResetPassword}>
                        Update Password
                      </button>
                      <button
                        className={styles.subBtnGhost}
                        onClick={() => { setPanel(null); setResetError(''); }}
                      >
                        Cancel
                      </button>
                    </>
                  )}
                </div>
              </div>
            )}
          </>
        ) : (
          /* Not logged in — show nothing or login link */
          null
        )}

      </div>
    </header>
  );
};

export default Header;