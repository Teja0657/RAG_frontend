import { useState } from 'react';
import Header from '../../components/Header/Header';
import PublicFooter from '../../components/PublicFooter/PublicFooter';

const ContactUs = () => {
  const [form, setForm]           = useState({ name: '', email: '', subject: '', message: '' });
  const [errors, setErrors]       = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading]     = useState(false);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required.';
    if (!form.email.trim())   e.email   = 'Email is required.';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email))
                              e.email   = 'Enter a valid email.';
    if (!form.subject.trim()) e.subject = 'Subject is required.';
    if (!form.message.trim()) e.message = 'Message is required.';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) { setErrors(errs); return; }
    setLoading(true);
    // Replace with real API call when backend is ready
    setTimeout(() => { setLoading(false); setSubmitted(true); }, 1000);
  };

  const s = {
    page: {
      display: 'flex',
      flexDirection: 'column',
      minHeight: '100vh',
      background: 'var(--bg)',
    },
    main: {
      flex: 1,
      maxWidth: '800px',
      margin: '0 auto',
      padding: '60px 24px 80px',
      width: '100%',
    },
    eyebrow: {
      fontSize: '11px',
      fontFamily: 'var(--font-ui)',
      fontWeight: 600,
      color: 'var(--accent)',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      display: 'block',
      marginBottom: '14px',
    },
    h1: {
      fontFamily: 'var(--font-ui)',
      fontSize: '36px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      letterSpacing: '-0.5px',
      lineHeight: 1.2,
      marginBottom: '16px',
    },
    lead: {
      fontSize: '15px',
      color: 'var(--text-secondary)',
      lineHeight: 1.8,
      marginBottom: '48px',
    },
    label: {
      fontSize: '12px',
      fontFamily: 'var(--font-ui)',
      fontWeight: 500,
      color: 'var(--text-secondary)',
      display: 'block',
      marginBottom: '6px',
    },
    fieldErr: {
      fontSize: '11px',
      color: 'var(--danger)',
      marginTop: '4px',
      display: 'block',
    },
  };

  const inputStyle = (hasErr) => ({
    width: '100%',
    background: 'var(--bg-elevated)',
    border: `1px solid ${hasErr ? 'var(--danger)' : 'var(--border)'}`,
    borderRadius: 'var(--radius-sm)',
    padding: '10px 12px',
    color: 'var(--text-primary)',
    fontSize: '14px',
    outline: 'none',
    fontFamily: 'var(--font-body)',
    transition: 'border-color 150ms ease',
  });

  return (
    <div style={s.page}>
      <Header showNav={true} />

      <main style={s.main}>

        {/* Hero */}
        <span style={s.eyebrow}>Contact Us</span>
        <h1 style={s.h1}>We'd love to hear from you.</h1>
        <p style={s.lead}>
          Have a question about RAGChat, need help with your documents, or want
          to report an issue? Reach out and we'll get back to you within
          24 hours.
        </p>

        {/* Two column layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1.5fr',
          gap: '40px',
          alignItems: 'start',
        }}>

          {/* Left — Info cards */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>

            {[
              {
                icon: '📧',
                label: 'Email',
                value: 'contactus@ragteam.com',
              },
              {
                icon: '🕐',
                label: 'Response Time',
                value: 'Within 24 hours',
              },
              {
                icon: '🏢',
                label: 'Office',
                value: 'Cognizant Technology Solutions\nHyderabad, Telangana, India',
              },
              {
                icon: '🗓️',
                label: 'Working Hours',
                value: 'Mon – Fri\n9:00 AM – 6:00 PM IST',
              },
            ].map((item, i) => (
              <div key={i} style={{
                background: 'var(--bg-surface)',
                border: '1px solid var(--border)',
                borderRadius: 'var(--radius)',
                padding: '18px 20px',
                display: 'flex',
                gap: '14px',
                alignItems: 'flex-start',
              }}>
                <span style={{ fontSize: '20px', flexShrink: 0 }}>{item.icon}</span>
                <div>
                  <p style={{
                    fontSize: '11px',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 600,
                    color: 'var(--text-muted)',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '4px',
                  }}>
                    {item.label}
                  </p>
                  <p style={{
                    fontSize: '13px',
                    color: 'var(--text-primary)',
                    lineHeight: 1.6,
                    whiteSpace: 'pre-line',
                  }}>
                    {item.value}
                  </p>
                </div>
              </div>
            ))}

          </div>

          {/* Right — Contact form */}
          <div style={{
            background: 'var(--bg-surface)',
            border: '1px solid var(--border)',
            borderRadius: 'var(--radius-lg)',
            padding: '32px',
          }}>

            {submitted ? (
              <div style={{
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '16px',
                padding: '40px 0',
                textAlign: 'center',
              }}>
                <span style={{ fontSize: '40px' }}>✅</span>
                <p style={{
                  fontFamily: 'var(--font-ui)',
                  fontSize: '18px',
                  fontWeight: 600,
                  color: 'var(--text-primary)',
                }}>
                  Message sent!
                </p>
                <p style={{
                  fontSize: '13px',
                  color: 'var(--text-secondary)',
                  lineHeight: 1.6,
                }}>
                  Thanks for reaching out. We'll get back to you at{' '}
                  <strong style={{ color: 'var(--text-primary)' }}>{form.email}</strong>{' '}
                  within 24 hours.
                </p>
                <button
                  onClick={() => { setSubmitted(false); setForm({ name: '', email: '', subject: '', message: '' }); }}
                  style={{
                    padding: '9px 24px',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-ui)',
                    fontSize: '13px',
                    fontWeight: 500,
                    cursor: 'pointer',
                  }}
                >
                  Send another message
                </button>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

                <div>
                  <label style={s.label}>Name</label>
                  <input
                    name="name"
                    type="text"
                    style={inputStyle(!!errors.name)}
                    placeholder="Jane Doe"
                    value={form.name}
                    onChange={handleChange}
                  />
                  {errors.name && <span style={s.fieldErr}>{errors.name}</span>}
                </div>

                <div>
                  <label style={s.label}>Email</label>
                  <input
                    name="email"
                    type="email"
                    style={inputStyle(!!errors.email)}
                    placeholder="you@example.com"
                    value={form.email}
                    onChange={handleChange}
                  />
                  {errors.email && <span style={s.fieldErr}>{errors.email}</span>}
                </div>

                <div>
                  <label style={s.label}>Subject</label>
                  <input
                    name="subject"
                    type="text"
                    style={inputStyle(!!errors.subject)}
                    placeholder="e.g. Question about document upload"
                    value={form.subject}
                    onChange={handleChange}
                  />
                  {errors.subject && <span style={s.fieldErr}>{errors.subject}</span>}
                </div>

                <div>
                  <label style={s.label}>Message</label>
                  <textarea
                    name="message"
                    rows={5}
                    style={{
                      ...inputStyle(!!errors.message),
                      resize: 'vertical',
                      lineHeight: 1.6,
                    }}
                    placeholder="Tell us what's on your mind…"
                    value={form.message}
                    onChange={handleChange}
                  />
                  {errors.message && <span style={s.fieldErr}>{errors.message}</span>}
                </div>

                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    width: '100%',
                    padding: '11px',
                    background: 'var(--accent)',
                    color: '#fff',
                    border: 'none',
                    borderRadius: 'var(--radius-sm)',
                    fontFamily: 'var(--font-ui)',
                    fontWeight: 600,
                    fontSize: '14px',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    opacity: loading ? 0.7 : 1,
                    transition: 'background 150ms ease',
                  }}
                >
                  {loading ? 'Sending…' : 'Send Message'}
                </button>

              </form>
            )}
          </div>
        </div>
      </main>

      <PublicFooter />
    </div>
  );
};

export default ContactUs;