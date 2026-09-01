import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './RegisterPage.module.css';

const RegisterPage = () => {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: ''
  });
  const [errors, setErrors]   = useState({});
  const [success, setSuccess] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())
      e.name = 'Full name is required.';
    if (!form.email.trim())
      e.email = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
      e.email = 'Enter a valid email address.';
    if (!form.password)
      e.password = 'Password is required.';
    else if (form.password.length < 8)
      e.password = 'Password must be at least 8 characters.';
    if (!form.confirmPassword)
      e.confirmPassword = 'Please confirm your password.';
    else if (form.password !== form.confirmPassword)
      e.confirmPassword = 'Passwords do not match.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    setLoading(true);
    // Simulate registration — replace with real API call later
    setTimeout(() => {
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2000);
    }, 1000);
  };

  return (
    <div className={styles.page}>
      <div className={styles.card}>

        {/* Logo */}
        <div className={styles.logoRow}>
          <div className={styles.logoIcon}>R</div>
          <span className={styles.logoText}>RAG<span>Chat</span></span>
        </div>

        <h1 className={styles.heading}>Create an account</h1>
        <p className={styles.sub}>Start querying your documents with AI.</p>

        {success && (
          <p className={styles.successBox}>
            Account created! Redirecting to login…
          </p>
        )}

        <form className={styles.form} onSubmit={handleSubmit} noValidate>

          <div className={styles.field}>
            <label className={styles.label}>Full Name</label>
            <input
              name="name"
              type="text"
              className={`${styles.input} ${errors.name ? styles.hasError : ''}`}
              placeholder="Jane Doe"
              value={form.name}
              onChange={handleChange}
            />
            {errors.name && <span className={styles.fieldError}>{errors.name}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Email</label>
            <input
              name="email"
              type="email"
              className={`${styles.input} ${errors.email ? styles.hasError : ''}`}
              placeholder="you@example.com"
              value={form.email}
              onChange={handleChange}
            />
            {errors.email && <span className={styles.fieldError}>{errors.email}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Password</label>
            <input
              name="password"
              type="password"
              className={`${styles.input} ${errors.password ? styles.hasError : ''}`}
              placeholder="Min. 8 characters"
              value={form.password}
              onChange={handleChange}
            />
            {errors.password && <span className={styles.fieldError}>{errors.password}</span>}
          </div>

          <div className={styles.field}>
            <label className={styles.label}>Confirm Password</label>
            <input
              name="confirmPassword"
              type="password"
              className={`${styles.input} ${errors.confirmPassword ? styles.hasError : ''}`}
              placeholder="Repeat your password"
              value={form.confirmPassword}
              onChange={handleChange}
            />
            {errors.confirmPassword && (
              <span className={styles.fieldError}>{errors.confirmPassword}</span>
            )}
          </div>

          <button
            type="submit"
            className={styles.submitBtn}
            disabled={loading || success}
          >
            {loading ? 'Creating account…' : 'Create Account'}
          </button>

        </form>

        <div className={styles.footer}>
          Already have an account? <Link to="/login">Sign in</Link>
        </div>

      </div>
    </div>
  );
};

export default RegisterPage;