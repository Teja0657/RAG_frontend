import { useState } from 'react';
import { Link } from 'react-router-dom';

const MOCK_OTP = '123456'; // Replace with real API later

const ForgotPassword = () => {
  const [step, setStep]         = useState(1); // 1=email, 2=otp, 3=newpass
  const [email, setEmail]       = useState('');
  const [otp, setOtp]           = useState('');
  const [newPass, setNewPass]   = useState('');
  const [confirm, setConfirm]   = useState('');
  const [error, setError]       = useState('');
  const [success, setSuccess]   = useState(false);

  const card = {
    width: '100%', maxWidth: '420px',
    background: 'var(--bg-surface)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-lg)',
    padding: '40px 32px',
    boxShadow: 'var(--shadow-lg)',
  };

  const page = {
    minHeight: '100vh', background: 'var(--bg)',
    display: 'flex', alignItems: 'center',
    justifyContent: 'center', padding: '24px',
  };

  const inputStyle = {
    width: '100%', background: 'var(--bg-elevated)',
    border: '1px solid var(--border)',
    borderRadius: 'var(--radius-sm)', padding: '10px 12px',
    color: 'var(--text-primary)', fontSize: '14px',
    outline: 'none', fontFamily: 'var(--font-body)',
  };

  const btn = {
    width: '100%', padding: '11px',
    borderRadius: 'var(--radius-sm)', fontSize: '14px',
    fontFamily: 'var(--font-ui)', fontWeight: 600,
    color: '#fff', background: 'var(--accent)',
    border: 'none', cursor: 'pointer', marginTop: '8px',
  };

  const label = {
    fontSize: '12px', fontFamily: 'var(--font-ui)',
    fontWeight: 500, color: 'var(--text-secondary)',
    display: 'block', marginBottom: '6px',
  };

  const Logo = () => (
    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '32px' }}>
      <div style={{
        width: 32, height: 32, background: 'var(--accent)',
        borderRadius: 'var(--radius-sm)', display: 'flex',
        alignItems: 'center', justifyContent: 'center',
        fontSize: 15, fontWeight: 700, color: '#fff', fontFamily: 'var(--font-ui)'
      }}>R</div>
      <span style={{ fontFamily: 'var(--font-ui)', fontSize: 17, fontWeight: 600, color: 'var(--text-primary)' }}>
        RAG<span style={{ color: 'var(--accent)' }}>Chat</span>
      </span>
    </div>
  );

  const ErrorBox = ({ msg }) => msg ? (
    <p style={{
      fontSize: 12, color: 'var(--danger)', background: 'var(--danger-subtle)',
      padding: '8px 12px', borderRadius: 'var(--radius-sm)', marginBottom: 12
    }}>{msg}</p>
  ) : null;

  /* Step 1 — Enter email */
  const handleEmailSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Enter a valid email address.');
      return;
    }
    // Mock sending OTP — replace with API call later
    setStep(2);
  };

  /* Step 2 — Enter OTP */
  const handleOtpSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (otp.length !== 6) {
      setError('Enter the 6-digit code sent to your email.');
      return;
    }
    if (otp !== MOCK_OTP) {
      setError('Invalid code. Please try again.');
      return;
    }
    setStep(3);
  };

  /* Step 3 — New password */
  const handlePasswordSubmit = (e) => {
    e.preventDefault();
    setError('');
    if (newPass.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    if (newPass !== confirm) {
      setError('Passwords do not match.');
      return;
    }
    setSuccess(true);
  };

  return (
    <div style={page}>
      <div style={card}>
        <Logo />

        {/* Step indicators */}
        <div style={{ display: 'flex', gap: 6, marginBottom: 24 }}>
          {[1, 2, 3].map(s => (
            <div key={s} style={{
              flex: 1, height: 3, borderRadius: 99,
              background: step >= s ? 'var(--accent)' : 'var(--border)',
              transition: 'background 0.3s ease'
            }} />
          ))}
        </div>

        {success ? (
          <>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 600,
              color: 'var(--text-primary)', marginBottom: 8 }}>
              Password reset!
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Your password has been updated successfully.
            </p>
            <Link to="/login" style={{
              display: 'block', textAlign: 'center', padding: '11px',
              borderRadius: 'var(--radius-sm)', fontSize: 14,
              fontFamily: 'var(--font-ui)', fontWeight: 600,
              color: '#fff', background: 'var(--accent)', textDecoration: 'none'
            }}>
              Back to Sign in
            </Link>
          </>
        ) : step === 1 ? (
          <>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 600,
              color: 'var(--text-primary)', marginBottom: 4 }}>
              Forgot password?
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Enter your email and we'll send you a 6-digit code.
            </p>
            <form onSubmit={handleEmailSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ErrorBox msg={error} />
              <div>
                <label style={label}>Email</label>
                <input
                  type="email" style={inputStyle}
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => { setEmail(e.target.value); setError(''); }}
                />
              </div>
              <button type="submit" style={btn}>Send Code</button>
            </form>
          </>
        ) : step === 2 ? (
          <>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 600,
              color: 'var(--text-primary)', marginBottom: 4 }}>
              Enter the code
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              We sent a 6-digit code to <strong style={{ color: 'var(--text-primary)' }}>{email}</strong>.
              <br />
              <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                (Use <strong>123456</strong> for now — mock mode)
              </span>
            </p>
            <form onSubmit={handleOtpSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ErrorBox msg={error} />
              <div>
                <label style={label}>6-digit code</label>
                <input
                  type="text" style={{ ...inputStyle, letterSpacing: '8px',
                    fontSize: 20, textAlign: 'center' }}
                  placeholder="------"
                  maxLength={6}
                  value={otp}
                  onChange={e => { setOtp(e.target.value.replace(/\D/g, '')); setError(''); }}
                />
              </div>
              <button type="submit" style={btn}>Verify Code</button>
              <button type="button"
                style={{ ...btn, background: 'transparent',
                  color: 'var(--text-muted)', border: '1px solid var(--border)' }}
                onClick={() => { setStep(1); setOtp(''); setError(''); }}
              >
                Back
              </button>
            </form>
          </>
        ) : (
          <>
            <h1 style={{ fontFamily: 'var(--font-ui)', fontSize: 22, fontWeight: 600,
              color: 'var(--text-primary)', marginBottom: 4 }}>
              New password
            </h1>
            <p style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
              Choose a strong password for your account.
            </p>
            <form onSubmit={handlePasswordSubmit} style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <ErrorBox msg={error} />
              <div>
                <label style={label}>New Password</label>
                <input
                  type="password" style={inputStyle}
                  placeholder="Min. 8 characters"
                  value={newPass}
                  onChange={e => { setNewPass(e.target.value); setError(''); }}
                />
              </div>
              <div>
                <label style={label}>Confirm Password</label>
                <input
                  type="password" style={inputStyle}
                  placeholder="Repeat new password"
                  value={confirm}
                  onChange={e => { setConfirm(e.target.value); setError(''); }}
                />
              </div>
              <button type="submit" style={btn}>Reset Password</button>
            </form>
          </>
        )}

        {!success && (
          <div style={{ marginTop: 24, textAlign: 'center', fontSize: 13, color: 'var(--text-secondary)' }}>
            Remember it? <Link to="/login">Back to sign in</Link>
          </div>
        )}

      </div>
    </div>
  );
};

export default ForgotPassword;