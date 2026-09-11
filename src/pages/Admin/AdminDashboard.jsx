import { useState, useRef, useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Admin.module.css';

const API_BASE = 'http://localhost:8000';

const NAV = [
  { id: 'overview', icon: '📊', label: 'Overview'     },
  { id: 'upload',   icon: '📁', label: 'Documents'    },
  { id: 'users',    icon: '👥', label: 'Users'        },
  { id: 'stats',    icon: '📈', label: 'Statistics'   },
  { id: 'chattest', icon: '🤖', label: 'Chatbot Test' },
];

const TAB_INFO = {
  overview: { title: 'Overview',     sub: 'System summary.'                              },
  upload:   { title: 'Documents',    sub: 'Upload documents to be indexed for retrieval.' },
  users:    { title: 'Users',        sub: 'Users who have used the chat assistant.'       },
  stats:    { title: 'Statistics',   sub: 'Judge-model scores from Chatbot Test runs.'    },
  chattest: { title: 'Chatbot Test', sub: 'Test the RAG pipeline and score its output.'   },
};

const SCORE_LABELS = {
  retrieval_accuracy: 'Retrieval Accuracy',
  context_precision:  'Context Precision',
  answer_relevance:   'Answer Relevance',
  faithfulness:       'Faithfulness Score',
};

const AdminDashboard = () => {
  const [tab, setTab] = useState('overview');
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Overview
  const [overview, setOverview] = useState(null);
  const [overviewLoading, setOverviewLoading] = useState(true);

  // Documents
  const [dragging, setDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadedThisSession, setUploadedThisSession] = useState([]);
  const [uploadError, setUploadError] = useState('');
  const fileRef = useRef(null);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Statistics
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);

  // Chatbot Test
  const [testInput, setTestInput] = useState('');
  const [testMsgs, setTestMsgs] = useState([
    { role: 'bot', text: 'Admin test mode active. Send a query to evaluate the RAG pipeline.' }
  ]);
  const [testLoading, setTestLoading] = useState(false);
  const [lastScores, setLastScores] = useState(null);
  const [lastLatency, setLastLatency] = useState(null);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleTabChange = (id) => {
    setTab(id);
    setSidebarOpen(false);
  };

  /* ── Overview ── */
  useEffect(() => {
    if (tab !== 'overview') return;
    setOverviewLoading(true);
    fetch(`${API_BASE}/api/admin/overview`)
      .then(res => res.json())
      .then(setOverview)
      .catch(err => console.error('Failed to load overview:', err))
      .finally(() => setOverviewLoading(false));
  }, [tab]);

  /* ── Users ── */
  useEffect(() => {
    if (tab !== 'users') return;
    setUsersLoading(true);
    fetch(`${API_BASE}/api/admin/users`)
      .then(res => res.json())
      .then(setUsers)
      .catch(err => console.error('Failed to load users:', err))
      .finally(() => setUsersLoading(false));
  }, [tab]);

  /* ── Statistics ── */
  useEffect(() => {
    if (tab !== 'stats') return;
    setStatsLoading(true);
    fetch(`${API_BASE}/api/admin/stats`)
      .then(res => res.json())
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setStatsLoading(false));
  }, [tab]);

  useEffect(() => {
  if (tab !== 'upload') return;
  fetch(`${API_BASE}/api/admin/documents`)
    .then(res => res.json())
    .then(data => setUploadedThisSession(
      data.map(d => ({ name: d.filename, date: new Date(d.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }) }))
    ))
    .catch(err => console.error('Failed to load documents:', err));
}, [tab]);

  const uploadFile = async (file) => {
    setUploadError('');
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch(`${API_BASE}/api/admin/documents`, {
        method: 'POST',
        body: formData,
      });
      if (!res.ok) throw new Error('Upload failed');

      // Re-fetch the real, persisted list instead of guessing what it looks like
      const listRes = await fetch(`${API_BASE}/api/admin/documents`);
      const data = await listRes.json();
      setUploadedThisSession(
        data.map(d => ({
          name: d.filename,
          date: new Date(d.uploaded_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' }),
        }))
      );
    } catch (err) {
      console.error('Upload failed:', err);
      setUploadError('Upload failed. Check that the file is a valid PDF and try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleFiles = (files) => {
    const file = files[0]; // one at a time — backend processes a single PDF per request
    if (file) uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  /* ── Chatbot test ── */
  const handleTestSend = async () => {
    const text = testInput.trim();
    if (!text || testLoading) return;

    setTestMsgs(prev => [...prev, { role: 'user', text }]);
    setTestInput('');
    setTestLoading(true);
    setLastScores(null);

    try {
      const res = await fetch(`${API_BASE}/api/admin/test-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      if (!res.ok) throw new Error('Test request failed');
      const data = await res.json();

      setTestMsgs(prev => [...prev, { role: 'bot', text: data.answer }]);
      setLastScores(data.scores);
      setLastLatency({ retrieval: data.retrieval_time_ms, llm: data.llm_latency_ms });
    } catch (err) {
      console.error('Test chat failed:', err);
      setTestMsgs(prev => [...prev, { role: 'bot', text: 'Test request failed. Check the backend logs.' }]);
    } finally {
      setTestLoading(false);
    }
  };

  const renderOverview = () => {
    if (overviewLoading) return <p className={styles.pageSub}>Loading…</p>;
    if (!overview) return <p className={styles.pageSub}>Failed to load overview.</p>;

    return (
      <>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={`${styles.statValue} ${styles.accent}`}>{overview.indexed_chunks}</p>
            <p className={styles.statLabel}>Indexed chunks</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{overview.registered_users}</p>
            <p className={styles.statLabel}>Registered users</p>
          </div>
          <div className={styles.statCard}>
            <p className={`${styles.statValue} ${styles.accent}`}>{overview.total_queries}</p>
            <p className={styles.statLabel}>Total queries</p>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>Quick Actions</p>
          <div style={{ display: 'flex', gap: 'var(--sp-3)', flexWrap: 'wrap' }}>
            <button className={styles.testSendBtn} onClick={() => handleTabChange('upload')}>
              Upload a document
            </button>
            <button className={styles.testSendBtn} onClick={() => handleTabChange('chattest')}>
              Run a test query
            </button>
            <button className={styles.testSendBtn} onClick={() => handleTabChange('stats')}>
              View statistics
            </button>
          </div>
        </div>

        <div className={styles.card}>
          <p className={styles.cardTitle}>Recent Activity</p>
          <div className={styles.logList}>
            {overview.recent_activity.length === 0 ? (
              <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '16px 0' }}>
                No queries yet.
              </p>
            ) : overview.recent_activity.map((a, i) => (
              <div key={i} className={styles.logItem}>
                <span className={styles.logDot} />
                <span className={styles.logTime}>
                  {new Date(a.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short' })}
                </span>
                <span className={styles.logMsg}>{a.user_id} asked: "{a.text.slice(0, 60)}{a.text.length > 60 ? '…' : ''}"</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderUpload = () => (
    <>
      <div
        className={`${styles.uploadZone} ${dragging ? styles.dragging : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => !uploading && fileRef.current.click()}
      >
        <div className={styles.uploadIcon}>📄</div>
        <p className={styles.uploadTitle}>
          {uploading ? 'Uploading and indexing…' : 'Drop a file here or click to browse'}
        </p>
        <p className={styles.uploadSub}>PDF supported</p>
        <input
          ref={fileRef}
          type="file"
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
          disabled={uploading}
        />
      </div>

      {uploadError && (
        <p style={{ color: 'var(--danger)', fontSize: 13, marginTop: 12 }}>{uploadError}</p>
      )}

      <div className={styles.card}>
        <p className={styles.cardTitle}>Uploaded This Session ({uploadedThisSession.length})</p>
        <div className={styles.uploadedList}>
          {uploadedThisSession.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              No documents uploaded yet this session.
            </p>
          ) : uploadedThisSession.map((doc, i) => (
            <div key={i} className={styles.uploadedItem}>
              <p className={styles.uploadedName}>📄 {doc.name}</p>
              <p className={styles.uploadedMeta}>Indexed {doc.date}</p>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderUsers = () => {
    if (usersLoading) return <p className={styles.pageSub}>Loading…</p>;

    return (
      <div className={styles.card}>
        <p className={styles.cardTitle}>Users ({users.length})</p>
        <div className={styles.tableWrap}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Email</th>
                <th>Queries</th>
              </tr>
            </thead>
            <tbody>
              {users.length === 0 ? (
                <tr><td colSpan={2} style={{ textAlign: 'center', color: 'var(--text-muted)' }}>No users yet.</td></tr>
              ) : users.map(u => (
                <tr key={u.email}>
                  <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td>{u.query_count}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  const renderStats = () => {
    if (statsLoading) return <p className={styles.pageSub}>Loading…</p>;
    if (!stats || !stats.average_scores) {
      return <p className={styles.pageSub}>No evaluation data yet — run some queries in Chatbot Test first.</p>;
    }

    const maxDay = Math.max(...Object.values(stats.weekly_query_counts), 1);

    return (
      <>
        <div className={styles.statsGrid}>
          {Object.entries(stats.average_scores).map(([key, val]) => (
            <div key={key} className={styles.statCard}>
              <p className={`${styles.statValue} ${styles.accent}`}>{val}%</p>
              <p className={styles.statLabel}>{SCORE_LABELS[key] || key}</p>
            </div>
          ))}
        </div>
        <div className={styles.card}>
          <p className={styles.cardTitle}>Queries by Day ({stats.total_tests_run} test runs logged)</p>
          <div className={styles.barChart}>
            {Object.entries(stats.weekly_query_counts).map(([day, count]) => (
              <div key={day} className={styles.barWrap}>
                <div className={styles.bar} style={{ height: `${(count / maxDay) * 100}px` }} title={`${count} queries`} />
                <span className={styles.barLabel}>{day}</span>
              </div>
            ))}
          </div>
        </div>
      </>
    );
  };

  const renderChatTest = () => (
    <div className={styles.testLayout}>
      <div>
        <p className={styles.cardTitle} style={{ marginBottom: 'var(--sp-3)' }}>Test Chat</p>
        <div className={styles.testMessages}>
          {testMsgs.map((m, i) => (
            <div key={i} style={{
              alignSelf: m.role === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '85%',
              background: m.role === 'user' ? 'var(--admin-accent)' : 'var(--bg-surface)',
              border: m.role === 'bot' ? '1px solid var(--border-soft)' : 'none',
              color: m.role === 'user' ? '#fff' : 'var(--text-primary)',
              padding: '8px 12px',
              borderRadius: 'var(--radius-sm)',
              fontSize: 13, lineHeight: 1.5,
            }}>
              {m.text}
            </div>
          ))}
          {testLoading && (
            <div style={{ alignSelf: 'flex-start', color: 'var(--text-muted)', fontSize: 13 }}>
              Running retrieval, generation, and scoring…
            </div>
          )}
        </div>
        <div className={styles.testInputRow}>
          <input
            className={styles.testInput}
            placeholder="Enter a test query…"
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTestSend()}
            disabled={testLoading}
          />
          <button className={styles.testSendBtn} onClick={handleTestSend} disabled={testLoading}>
            Send
          </button>
        </div>
      </div>
      <div>
        <p className={styles.cardTitle} style={{ marginBottom: 'var(--sp-3)' }}>Last Run — Judge Scores</p>
        {!lastScores ? (
          <p style={{ fontSize: 13, color: 'var(--text-muted)' }}>Send a query to see scores here.</p>
        ) : lastScores.error ? (
          <p style={{ fontSize: 13, color: 'var(--danger)' }}>Judge model returned invalid output.</p>
        ) : (
          <div className={styles.metricsGrid}>
            {Object.entries(SCORE_LABELS).map(([key, label]) => (
              <div key={key} className={styles.metricRow}>
                <div className={styles.metricLabel}>
                  <span>{label}</span>
                  <span className={styles.metricVal}>{lastScores[key]}%</span>
                </div>
                <div className={styles.metricBar}>
                  <div className={styles.metricFill} style={{ width: `${lastScores[key]}%` }} />
                </div>
              </div>
            ))}
          </div>
        )}

        {lastLatency && (
          <div style={{ marginTop: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
            {[
              { label: 'Retrieval Time', val: `${lastLatency.retrieval}ms` },
              { label: 'LLM Latency',    val: `${lastLatency.llm}ms` },
            ].map((s, i) => (
              <div key={i} style={{
                display: 'flex', justifyContent: 'space-between',
                padding: '8px 0', borderBottom: '1px solid var(--border-soft)',
                fontSize: 13,
              }}>
                <span style={{ color: 'var(--text-secondary)' }}>{s.label}</span>
                <span style={{ color: 'var(--text-primary)', fontFamily: 'var(--font-ui)', fontWeight: 500 }}>
                  {s.val}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>
        <div
          className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
          <p className={styles.sidebarLabel}>Admin Panel</p>
          {NAV.map(n => (
            <button
              key={n.id}
              className={`${styles.navItem} ${tab === n.id ? styles.active : ''}`}
              onClick={() => handleTabChange(n.id)}
            >
              <span className={styles.navIcon}>{n.icon}</span>
              {n.label}
            </button>
          ))}
        </aside>

        <main className={styles.main}>
          <div className={styles.topBar}>
            <button
              className={styles.hamburger}
              onClick={() => setSidebarOpen(prev => !prev)}
              aria-label="Toggle sidebar"
            >
              {sidebarOpen ? '✕' : '☰'}
            </button>
            <div>
              <h1 className={styles.pageTitle}>{TAB_INFO[tab].title}</h1>
            </div>
          </div>
          <p className={styles.pageSub}>{TAB_INFO[tab].sub}</p>

          {tab === 'overview'  && renderOverview()}
          {tab === 'upload'    && renderUpload()}
          {tab === 'users'     && renderUsers()}
          {tab === 'stats'     && renderStats()}
          {tab === 'chattest'  && renderChatTest()}
        </main>
      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;