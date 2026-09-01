import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import styles from './Footer.module.css';

const Footer = () => {
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();
  const [open, setOpen]           = useState(false);
  const [editOpen, setEditOpen]   = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [editForm, setEditForm]   = useState({
    name: currentUser?.name || '', email: currentUser?.email || ''
  });
  const [resetForm, setResetForm] = useState({
    current: '', newPass: '', confirm: ''
  });
  const [resetError, setResetError]     = useState('');
  const [resetSuccess, setResetSuccess] = useState(false);
  const dropdownRef = useRef(null);

  const displayName = currentUser?.name || currentUser?.email || 'User';
  const email       = currentUser?.email || '';
  const initials    = displayName
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setOpen(false);
        setEditOpen(false);
        setResetOpen(false);
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
    setEditOpen(false);
    setOpen(false);
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
      setResetOpen(false);
      setResetSuccess(false);
      setResetForm({ current: '', newPass: '', confirm: '' });
      setOpen(false);
    }, 1500);
  };

  const inputStyle = {
    width: '100%',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)',
    padding: '8px 10px',
    color: 'var(--text-primary)',
    fontSize: '13px',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    marginTop: '4px',
  };

  const labelStyle = {
    fontSize: '11px',
    color: 'var(--text-muted)',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    display: 'block',
    marginBottom: '2px',
  };

  const saveBtn = {
    width: '100%',
    padding: '8px',
    background: 'var(--accent)',
    color: '#fff',
    border: 'none',
    borderRadius: 'var(--radius-sm)',
    fontSize: '13px',
    fontFamily: 'var(--font-ui)',
    fontWeight: 500,
    cursor: 'pointer',
    marginTop: '8px',
  };

  return (
    <footer className={styles.footer}>

      {/* Left — Profile button */}
      <div ref={dropdownRef}>
        <button
          className={styles.profileBtn}
          onClick={() => {
            setOpen(prev => !prev);
            setEditOpen(false);
            setResetOpen(false);
          }}
        >
          <div className={styles.avatar}>{initials}</div>
          <div className={styles.profileInfo}>
            <p className={styles.profileName}>{displayName}</p>
            <p className={styles.profileEmail}>{email}</p>
          </div>
          <span className={styles.chevron}>{open ? '▲' : '▼'}</span>
        </button>

        {/* Main dropdown */}
        {open && !editOpen && !resetOpen && (
          <div className={styles.dropdown}>
            <div className={styles.dropdownHeader}>
              <p className={styles.dropdownName}>{displayName}</p>
              <p className={styles.dropdownEmail}>{email}</p>
            </div>
            <button
              className={styles.dropdownItem}
              onClick={() => setEditOpen(true)}
            >
              ✏️ Edit Profile
            </button>
            <button
              className={styles.dropdownItem}
              onClick={() => setResetOpen(true)}
            >
              🔑 Reset Password
            </button>
            <button
              className={`${styles.dropdownItem} ${styles.danger}`}
              onClick={handleLogout}
            >
              🚪 Sign out
            </button>
          </div>
        )}

        {/* Edit Profile panel */}
        {editOpen && (
          <div className={styles.dropdown} style={{ padding: '16px' }}>
            <p style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
              fontFamily: 'var(--font-ui)', marginBottom: 12
            }}>
              Edit Profile
            </p>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Name</label>
              <input
                style={inputStyle}
                value={editForm.name}
                onChange={e => setEditForm({ ...editForm, name: e.target.value })}
                placeholder="Your name"
              />
            </div>
            <div style={{ marginBottom: 10 }}>
              <label style={labelStyle}>Email</label>
              <input
                style={inputStyle}
                value={editForm.email}
                onChange={e => setEditForm({ ...editForm, email: e.target.value })}
                placeholder="your@email.com"
              />
            </div>
            <button style={saveBtn} onClick={handleEditSave}>Save Changes</button>
            <button
              style={{ ...saveBtn, background: 'transparent',
                color: 'var(--text-muted)', border: '1px solid var(--border)', marginTop: 6 }}
              onClick={() => setEditOpen(false)}
            >
              Cancel
            </button>
          </div>
        )}

        {/* Reset Password panel */}
        {resetOpen && (
          <div className={styles.dropdown} style={{ padding: '16px' }}>
            <p style={{
              fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
              fontFamily: 'var(--font-ui)', marginBottom: 12
            }}>
              Reset Password
            </p>
            {resetSuccess ? (
              <p style={{ fontSize: 13, color: 'var(--success)', textAlign: 'center', padding: '8px 0' }}>
                ✅ Password updated!
              </p>
            ) : (
              <>
                {resetError && (
                  <p style={{ fontSize: 12, color: 'var(--danger)',
                    background: 'var(--danger-subtle)', padding: '6px 10px',
                    borderRadius: 'var(--radius-sm)', marginBottom: 10 }}>
                    {resetError}
                  </p>
                )}
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>Current Password</label>
                  <input type="password" style={inputStyle}
                    value={resetForm.current} placeholder="••••••••"
                    onChange={e => setResetForm({ ...resetForm, current: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>New Password</label>
                  <input type="password" style={inputStyle}
                    value={resetForm.newPass} placeholder="Min. 8 characters"
                    onChange={e => setResetForm({ ...resetForm, newPass: e.target.value })}
                  />
                </div>
                <div style={{ marginBottom: 10 }}>
                  <label style={labelStyle}>Confirm Password</label>
                  <input type="password" style={inputStyle}
                    value={resetForm.confirm} placeholder="Repeat new password"
                    onChange={e => setResetForm({ ...resetForm, confirm: e.target.value })}
                  />
                </div>
                <button style={saveBtn} onClick={handleResetPassword}>Update Password</button>
                <button
                  style={{ ...saveBtn, background: 'transparent',
                    color: 'var(--text-muted)', border: '1px solid var(--border)', marginTop: 6 }}
                  onClick={() => { setResetOpen(false); setResetError(''); }}
                >
                  Cancel
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Center — Copyright */}
      <div className={styles.copyWrap}>
        <span className={styles.copy}>© 2026 RAGChat. All rights reserved.</span>
      </div>

      {/* Right spacer to balance */}
      <div className={styles.rightSpacer} />

    </footer>
  );
}
export default Footer;