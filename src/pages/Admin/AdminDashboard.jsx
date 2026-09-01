import { useState, useRef } from 'react';
import { useEffect } from 'react';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Admin.module.css';

const SEED_DOCS = [
  { id: 1, name: 'Q3_Report_2024.pdf',     size: '2.4 MB', date: '28 Aug 2024' },
  { id: 2, name: 'RAG_Architecture.docx',  size: '1.1 MB', date: '15 Aug 2024' },
  { id: 3, name: 'Vector_Store_Guide.pdf', size: '3.7 MB', date: '10 Aug 2024' },
];

const SEED_USERS = [
  { id: 1, name: 'Priya Sharma',  email: 'priya@example.com',  queries: 142, status: 'active',   joined: '01 Jul 2024' },
  { id: 2, name: 'Rahul Mehta',   email: 'rahul@example.com',  queries: 89,  status: 'active',   joined: '12 Jul 2024' },
  { id: 3, name: 'Ananya Reddy',  email: 'ananya@example.com', queries: 54,  status: 'inactive', joined: '20 Jul 2024' },
  { id: 4, name: 'Kiran Babu',    email: 'kiran@example.com',  queries: 201, status: 'active',   joined: '05 Aug 2024' },
  { id: 5, name: 'Sneha Patel',   email: 'sneha@example.com',  queries: 33,  status: 'inactive', joined: '18 Aug 2024' },
];

const LOGS = [
  { type: 'success', time: '13:42', msg: 'Document "Q3_Report_2024.pdf" indexed successfully.' },
  { type: 'info',    time: '13:38', msg: 'User kiran@example.com ran 8 queries.' },
  { type: 'warn',    time: '13:21', msg: 'Retrieval latency spike detected — 1.8s avg.' },
  { type: 'info',    time: '13:10', msg: 'New user registered: sneha@example.com' },
  { type: 'success', time: '12:55', msg: 'Vector store re-indexed: 1,240 chunks.' },
  { type: 'danger',  time: '12:44', msg: 'Failed login attempt from unknown IP.' },
  { type: 'info',    time: '12:30', msg: 'Admin session started.' },
];

const BAR_DATA = [
  { label: 'Mon', val: 65 },
  { label: 'Tue', val: 82 },
  { label: 'Wed', val: 54 },
  { label: 'Thu', val: 91 },
  { label: 'Fri', val: 78 },
  { label: 'Sat', val: 30 },
  { label: 'Sun', val: 22 },
];

const METRICS = [
  { label: 'Retrieval Accuracy', val: 94 },
  { label: 'Answer Relevance',   val: 88 },
  { label: 'Context Precision',  val: 76 },
  { label: 'Faithfulness Score', val: 91 },
];

const NAV = [
  { id: 'overview', icon: '📊', label: 'Overview'     },
  { id: 'upload',   icon: '📁', label: 'Documents'    },
  { id: 'users',    icon: '👥', label: 'Users'        },
  { id: 'monitor',  icon: '🖥️', label: 'Monitor'      },
  { id: 'stats',    icon: '📈', label: 'Statistics'   },
  { id: 'chattest', icon: '🤖', label: 'Chatbot Test' },
];

const TAB_INFO = {
  overview: { title: 'Overview',     sub: 'System summary and recent activity.'          },
  upload:   { title: 'Documents',    sub: 'Upload, manage and remove indexed documents.' },
  users:    { title: 'Users',        sub: 'View, monitor and delete registered users.'   },
  monitor:  { title: 'Monitor',      sub: 'Live logs and system health status.'          },
  stats:    { title: 'Statistics',   sub: 'Query volume and model performance data.'     },
  chattest: { title: 'Chatbot Test', sub: 'Test the RAG pipeline directly.'              },
};

const AdminDashboard = () => {
  const [tab, setTab]             = useState('overview');
  const [docs, setDocs]           = useState(SEED_DOCS);
  const [users, setUsers]         = useState(SEED_USERS);
  const [dragging, setDragging]   = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [testInput, setTestInput] = useState('');
  const [testMsgs, setTestMsgs]   = useState([
    { role: 'bot', text: 'Admin test mode active. Send a query to evaluate the RAG pipeline.' }
  ]);
  const fileRef = useRef(null);
  const maxBar  = Math.max(...BAR_DATA.map(b => b.val));

  // Close sidebar on resize to desktop
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

  /* ── Upload ── */
  const handleFiles = (files) => {
    const newDocs = Array.from(files).map(f => ({
      id: Date.now() + Math.random(),
      name: f.name,
      size: (f.size / (1024 * 1024)).toFixed(1) + ' MB',
      date: new Date().toLocaleDateString('en-GB', {
        day: '2-digit', month: 'short', year: 'numeric'
      }),
    }));
    setDocs(prev => [...newDocs, ...prev]);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  /* ── Chatbot test ── */
  const handleTestSend = () => {
    const text = testInput.trim();
    if (!text) return;
    setTestMsgs(prev => [...prev, { role: 'user', text }]);
    setTestInput('');
    setTimeout(() => {
      setTestMsgs(prev => [...prev, {
        role: 'bot',
        text: `[RAG Pipeline] Retrieved 3 chunks for: "${text}". Connect backend for real responses.`
      }]);
    }, 1000);
  };

  /* ── Tabs ── */
  const renderOverview = () => (
    <>
      <div className={styles.statsGrid}>
        <div className={styles.statCard}>
          <p className={`${styles.statValue} ${styles.accent}`}>{docs.length}</p>
          <p className={styles.statLabel}>Documents indexed</p>
        </div>
        <div className={styles.statCard}>
          <p className={styles.statValue}>{users.length}</p>
          <p className={styles.statLabel}>Registered users</p>
        </div>
        <div className={styles.statCard}>
          <p className={`${styles.statValue} ${styles.accent}`}>
            {users.reduce((s, u) => s + u.queries, 0)}
          </p>
          <p className={styles.statLabel}>Total queries</p>
        </div>
        <div className={styles.statCard}>
          <p className={`${styles.statValue} ${styles.warn}`}>1.2s</p>
          <p className={styles.statLabel}>Avg. response time</p>
        </div>
      </div>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Recent Activity</p>
        <div className={styles.logList}>
          {LOGS.map((l, i) => (
            <div key={i} className={styles.logItem}>
              <span className={`${styles.logDot} ${styles[l.type]}`} />
              <span className={styles.logTime}>{l.time}</span>
              <span className={styles.logMsg}>{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderUpload = () => (
    <>
      <div
        className={`${styles.uploadZone} ${dragging ? styles.dragging : ''}`}
        onDragOver={e => { e.preventDefault(); setDragging(true); }}
        onDragLeave={() => setDragging(false)}
        onDrop={handleDrop}
        onClick={() => fileRef.current.click()}
      >
        <div className={styles.uploadIcon}>📄</div>
        <p className={styles.uploadTitle}>Drop files here or click to browse</p>
        <p className={styles.uploadSub}>PDF, DOCX, TXT supported · Max 50 MB</p>
        <input
          ref={fileRef}
          type="file"
          multiple
          accept=".pdf,.docx,.txt"
          style={{ display: 'none' }}
          onChange={e => handleFiles(e.target.files)}
        />
      </div>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Indexed Documents ({docs.length})</p>
        <div className={styles.uploadedList}>
          {docs.length === 0 ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', textAlign: 'center', padding: '24px 0' }}>
              No documents uploaded yet.
            </p>
          ) : docs.map(doc => (
            <div key={doc.id} className={styles.uploadedItem}>
              <div style={{ minWidth: 0 }}>
                <p className={styles.uploadedName}>📄 {doc.name}</p>
                <p className={styles.uploadedMeta}>{doc.size} · Added {doc.date}</p>
              </div>
              <button
                className={styles.deleteBtn}
                onClick={() => setDocs(prev => prev.filter(d => d.id !== doc.id))}
              >
                🗑 Remove
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );

  const renderUsers = () => (
    <div className={styles.card}>
      <p className={styles.cardTitle}>Registered Users ({users.length})</p>
      <div className={styles.tableWrap}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Queries</th>
              <th>Joined</th>
              <th>Status</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {users.map(u => (
              <tr key={u.id}>
                <td>{u.name}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.email}</td>
                <td>{u.queries}</td>
                <td style={{ color: 'var(--text-secondary)' }}>{u.joined}</td>
                <td>
                  <span className={`${styles.statusBadge} ${styles[u.status]}`}>
                    {u.status === 'active' ? '● Active' : '○ Inactive'}
                  </span>
                </td>
                <td>
                  <button
                    className={styles.dangerBtn}
                    onClick={() => setUsers(prev => prev.filter(x => x.id !== u.id))}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderMonitor = () => (
    <div className={styles.monitorGrid}>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Live Activity Log</p>
        <div className={styles.logList}>
          {LOGS.map((l, i) => (
            <div key={i} className={styles.logItem}>
              <span className={`${styles.logDot} ${styles[l.type]}`} />
              <span className={styles.logTime}>{l.time}</span>
              <span className={styles.logMsg}>{l.msg}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.card}>
        <p className={styles.cardTitle}>System Status</p>
        {[
          { label: 'Vector Store',    status: 'Healthy',  color: 'var(--success)' },
          { label: 'LLM API',         status: 'Healthy',  color: 'var(--success)' },
          { label: 'Document Parser', status: 'Healthy',  color: 'var(--success)' },
          { label: 'Redis Cache',     status: 'Degraded', color: 'var(--warning)' },
          { label: 'Auth Service',    status: 'Healthy',  color: 'var(--success)' },
        ].map((s, i) => (
          <div key={i} style={{
            display: 'flex', justifyContent: 'space-between',
            alignItems: 'center', padding: '10px 0',
            borderBottom: '1px solid var(--border-soft)'
          }}>
            <span style={{ fontSize: 13, color: 'var(--text-primary)' }}>{s.label}</span>
            <span style={{ fontSize: 12, color: s.color, fontFamily: 'var(--font-ui)', fontWeight: 500 }}>
              {s.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );

  const renderStats = () => (
    <>
      <div className={styles.statsGrid}>
        {METRICS.map((m, i) => (
          <div key={i} className={styles.statCard}>
            <p className={`${styles.statValue} ${styles.accent}`}>{m.val}%</p>
            <p className={styles.statLabel}>{m.label}</p>
          </div>
        ))}
      </div>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Queries This Week</p>
        <div className={styles.barChart}>
          {BAR_DATA.map((b, i) => (
            <div key={i} className={styles.barWrap}>
              <div
                className={styles.bar}
                style={{ height: `${(b.val / maxBar) * 100}px` }}
                title={`${b.val} queries`}
              />
              <span className={styles.barLabel}>{b.label}</span>
            </div>
          ))}
        </div>
      </div>
      <div className={styles.card}>
        <p className={styles.cardTitle}>Model Performance</p>
        <div className={styles.metricsGrid}>
          {METRICS.map((m, i) => (
            <div key={i} className={styles.metricRow}>
              <div className={styles.metricLabel}>
                <span>{m.label}</span>
                <span className={styles.metricVal}>{m.val}%</span>
              </div>
              <div className={styles.metricBar}>
                <div className={styles.metricFill} style={{ width: `${m.val}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );

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
        </div>
        <div className={styles.testInputRow}>
          <input
            className={styles.testInput}
            placeholder="Enter a test query…"
            value={testInput}
            onChange={e => setTestInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleTestSend()}
          />
          <button className={styles.testSendBtn} onClick={handleTestSend}>Send</button>
        </div>
      </div>
      <div>
        <p className={styles.cardTitle} style={{ marginBottom: 'var(--sp-3)' }}>Pipeline Metrics</p>
        <div className={styles.metricsGrid}>
          {METRICS.map((m, i) => (
            <div key={i} className={styles.metricRow}>
              <div className={styles.metricLabel}>
                <span>{m.label}</span>
                <span className={styles.metricVal}>{m.val}%</span>
              </div>
              <div className={styles.metricBar}>
                <div className={styles.metricFill} style={{ width: `${m.val}%` }} />
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 'var(--sp-5)', display: 'flex', flexDirection: 'column', gap: 'var(--sp-2)' }}>
          {[
            { label: 'Retrieval Time', val: '340ms' },
            { label: 'LLM Latency',    val: '860ms' },
            { label: 'Total Latency',  val: '1.2s'  },
            { label: 'Chunks Used',    val: '3 / 5' },
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
      </div>
    </div>
  );

  return (
    <div className={styles.layout}>
      <Header />
      <div className={styles.body}>

        {/* Overlay */}
        <div
          className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* Sidebar */}
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

        {/* Main */}
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
          {tab === 'monitor'   && renderMonitor()}
          {tab === 'stats'     && renderStats()}
          {tab === 'chattest'  && renderChatTest()}
        </main>

      </div>
      <Footer />
    </div>
  );
};

export default AdminDashboard;