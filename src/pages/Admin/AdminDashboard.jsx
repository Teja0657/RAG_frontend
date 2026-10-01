import { useState, useRef, useEffect } from 'react';
import {
  LayoutDashboard, FolderOpen, Users as UsersIcon, TrendingUp, Bot,
  Menu, X, UploadCloud, FileText,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import { stripMarkdown } from '../../utils/markdown';
import styles from './Admin.module.css';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Keep in sync with SUPPORTED_EXTENSIONS in rag_core/ingestion/ingestion.py
const SUPPORTED_EXTENSIONS = ['.pdf', '.txt', '.md', '.docx', '.html', '.htm', '.csv'];

const NAV = [
  { id: 'overview', icon: LayoutDashboard, label: 'Overview'     },
  { id: 'upload',   icon: FolderOpen,      label: 'Documents'    },
  { id: 'users',    icon: UsersIcon,       label: 'Users'        },
  { id: 'stats',    icon: TrendingUp,      label: 'Statistics'   },
  { id: 'chattest', icon: Bot,             label: 'Chatbot Test' },
];

const TAB_INFO = {
  overview: { title: 'Overview',    sub: 'System summary.'                        },
  upload:   { title: 'Documents',    sub: 'Upload documents to be indexed for retrieval.' },
  users:    { title: 'Users',        sub: 'Users who have used the chat assistant.'       },
  stats:    { title: 'Statistics',   sub: 'LangSmith evaluation results for the Hybrid-RAG dataset.' },
  chattest: { title: 'Chatbot Test', sub: 'Ask the RAG pipeline a question. Traced automatically in LangSmith.' },
};

const EVAL_METRIC_LABELS = {
  answer_correctness: 'Answer Correctness',
  faithfulness:        'Faithfulness',
  answer_relevance:     'Answer Relevance',
  retrieval_quality:    'Retrieval Quality',
  abstention:           'Abstention Accuracy',
};

// Below 90% is worth a second look, below 70% is a real problem.
const scoreTier = (score) => (score < 70 ? 'danger' : score < 90 ? 'warn' : '');

const AdminDashboard = () => {

  const {getAccessTokenSilently} = useAuth();
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
  const [deletingDocumentId, setDeletingDocumentId]=useState(null);
  const [documentToDelete, setDocumentToDelete]=useState(null);
  const [updatingDocumentId, setUpdatingDocumentId] = useState(null);
  const updateFileRef = useRef(null);
  const updateDocumentRef = useRef(null);
  const [documentToUpdate, setDocumentToUpdate] = useState(null);
  const fileRef = useRef(null);

  // Users
  const [users, setUsers] = useState([]);
  const [usersLoading, setUsersLoading] = useState(true);

  // Statistics
  const [stats, setStats] = useState(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [runningEvaluation, setRunningEvaluation] = useState(false);
  const [evaluationError, setEvaluationError] = useState('');

  // Chatbot Test
  const [testInput, setTestInput] = useState('');
  const [testMsgs, setTestMsgs] = useState([
    { role: 'bot', text: 'Admin test mode active. Send a query to test the RAG pipeline.' }
  ]);
  const [testLoading, setTestLoading] = useState(false);
  const [lastElapsedMs, setLastElapsedMs] = useState(null);
  const [lastTimings, setLastTimings] = useState(null);
  const [lastTraceUrl, setLastTraceUrl] = useState(null);

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


  const authFetch = async (url, options = {}) => {
    const token = await getAccessTokenSilently();
    return fetch(url, {
      ...options,
      headers: {
        ...(options.headers || {}),
        Authorization: `Bearer ${token}`,
      },
    });
  };

  /* ── Overview ── */
  useEffect(() => {
    if (tab !== 'overview') return;

    setOverviewLoading(true);

    authFetch(`${API_BASE}/api/admin/overview`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load overview');
        return res.json()
      })
      .then(setOverview)
      .catch(err => console.error('Failed to load overview:', err))
      .finally(() => setOverviewLoading(false));
  }, [tab]);

  /* ── Users ── */

  useEffect(() => {
    if (tab !== 'users') return;

    setUsersLoading(true);

    authFetch(`${API_BASE}/api/admin/users`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load users');
        return res.json();
      })
      .then(data => {
        setUsers(data.users || []);
      })
      .catch(err => {
        console.error('Failed to load users:', err);
        setUsers([]);
      })
      .finally(() => setUsersLoading(false));
  }, [tab]);

  /* ── Statistics ── */
  useEffect(() => {
    if (tab !== 'stats') return;
    setStatsLoading(true);
    authFetch(`${API_BASE}/api/admin/stats`)
      .then(res => {
        if (!res.ok) throw new Error('Failed to load stats');
        return res.json();
      })
      .then(setStats)
      .catch(err => console.error('Failed to load stats:', err))
      .finally(() => setStatsLoading(false));
  }, [tab]);

  // documents
  useEffect(() => {
  if (tab !== 'upload') return;

  authFetch(`${API_BASE}/api/admin/documents`)
    .then(res => {
      if (!res.ok) throw new Error('Failed to load documents');
      return res.json();
    })
    .then(data => {
      setUploadedThisSession(
        (data.documents || []).map(d => ({
          id: d.id,
          name: d.filename,
          date: new Date(d.created_at).toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
          }),
          version: d.version,
          status: d.status,
        }))
      );
    })
    .catch(err => console.error('Failed to load documents:', err));
}, [tab]);

// upload File
  const uploadFile = async (file) => {
  setUploadError('');
  setUploading(true);

  try {
    const formData = new FormData();
    formData.append('file', file);

    const res = await authFetch(`${API_BASE}/api/admin/documents`, {
      method: 'POST',
      body: formData,
    });

    const result = await res.json();

    if (!res.ok || result.status === 'error') {
      throw new Error(result.message || 'Upload failed');
    }

    // Re-fetch the persisted document list
    const listRes = await authFetch(
      `${API_BASE}/api/admin/documents`
    );

    if (!listRes.ok) {
      throw new Error('Failed to reload documents');
    }

    const data = await listRes.json();

    setUploadedThisSession(
      (data.documents || []).map(d => ({
        id: d.id,
        name: d.filename,
        date: new Date(d.created_at).toLocaleDateString('en-GB', {
          day: '2-digit',
          month: 'short',
          year: 'numeric',
        }),
        version: d.version,
        status: d.status,
      }))
    );

  } catch (err) {
    console.error('Upload failed:', err);
    setUploadError(
      err.message || 'Upload failed. Check that the file is valid and try again.'
    );
  } finally {
    setUploading(false);
  }
};

  const handleFiles = (files) => {
    const file = files[0]; // one at a time — backend processes a single document per request
    if (!file) return;

    const extension = `.${file.name.split('.').pop().toLowerCase()}`;
    if (!SUPPORTED_EXTENSIONS.includes(extension)) {
      setUploadError(
        `Unsupported file type "${extension}". Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`
      );
      return;
    }

    uploadFile(file);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragging(false);
    handleFiles(e.dataTransfer.files);
  };

  /* ── Chatbot test — a single live probe against the RAG pipeline ── */
  const handleTestSend = async () => {
    const text = testInput.trim();
    if (!text || testLoading) return;

    setTestMsgs(prev => [...prev, { role: 'user', text }]);
    setTestInput('');
    setTestLoading(true);

    try {
      const res = await authFetch(`${API_BASE}/api/admin/test-chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ question: text }),
      });
      if (!res.ok) throw new Error('Test request failed');
      const data = await res.json();

      setTestMsgs(prev => [...prev, { role: 'bot', text: data.answer }]);
      setLastElapsedMs(data.elapsed_ms ?? null);
      setLastTimings(data.timings ?? null);
      setLastTraceUrl(data.trace_url ?? null);
    } catch (err) {
      console.error('Test chat failed:', err);
      setTestMsgs(prev => [...prev, { role: 'bot', text: 'Test request failed. Check the backend logs.' }]);
    } finally {
      setTestLoading(false);
    }
  };

  /* ── Evaluation — runs the 35-question LangSmith dataset (1-3 min) ── */
  const handleRunEvaluation = async () => {
    setRunningEvaluation(true);
    setEvaluationError('');

    try {
      const res = await authFetch(`${API_BASE}/api/admin/evaluation/run`, {
        method: 'POST',
      });
      if (!res.ok) throw new Error('Evaluation run failed');

      const statsRes = await authFetch(`${API_BASE}/api/admin/stats`);
      if (statsRes.ok) setStats(await statsRes.json());
    } catch (err) {
      console.error('Evaluation run failed:', err);
      setEvaluationError('Evaluation run failed. Check the backend logs.');
    } finally {
      setRunningEvaluation(false);
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
              <p className={styles.emptyNote}>No queries yet.</p>
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

  const handleDeleteDocument = async (e, documentId) => {
    e.stopPropagation();
    setDocumentToDelete(
      uploadedThisSession.find(doc => doc.id === documentId) || null
    );
  };

  const confirmDeleteDocument = async () => {
    if (!documentToDelete) return;

    const documentId = documentToDelete.id;

    setDeletingDocumentId(documentId);

    try {
      const res = await authFetch(
        `${API_BASE}/api/admin/documents/${documentId}`,
        {
          method: 'DELETE',
        }
      );

      if (!res.ok) {
        throw new Error('Delete failed');
      }

      setUploadedThisSession(prev =>
        prev.filter(doc => doc.id !== documentId)
      );

      setDocumentToDelete(null);

    } catch (err) {
      console.error('Delete failed:', err);

      setUploadError(
        'Failed to delete the document. Please try again.'
      );
    } finally {
      setDeletingDocumentId(null);
    }
  };

  const handleUpdateDocument = (e, document) => {
    e.stopPropagation();
    updateDocumentRef.current = document;
    setDocumentToUpdate(document);
    setUploadError('');

    // Open the dedicated update file picker directly from the user click.
    // Do not use the normal upload input for this action.
    updateFileRef.current?.click();
  };

  const submitDocumentUpdate = async (file) => {
    const targetDocument = updateDocumentRef.current || documentToUpdate;

    if (!targetDocument || !file) return;

    setUpdatingDocumentId(targetDocument.id);
    setUploadError('');

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await authFetch(
        `${API_BASE}/api/admin/documents/${targetDocument.id}`,
        {
          method: 'PUT',
          body: formData,
        }
      );

      const result = await res.json();

      if (!res.ok || result.status === 'error') {
        const errorMsg = typeof result.detail === 'object' ? result.detail.message : (result.detail || result.message || 'Document update failed');
        throw new Error(errorMsg);
      }

      const listRes = await authFetch(
        `${API_BASE}/api/admin/documents`
      );

      if (!listRes.ok) {
        throw new Error('Failed to reload documents');
      }

      const data = await listRes.json();

      setUploadedThisSession(
        (data.documents || []).map(d => ({
          id: d.id,
          name: d.filename,
          date: new Date(d.updated_at || d.created_at).toLocaleDateString(
            'en-GB',
            {
              day: '2-digit',
              month: 'short',
              year: 'numeric',
            }
          ),
          version: d.version,
          status: d.status,
        }))
      );

      setDocumentToUpdate(null);
      updateDocumentRef.current = null;

    } catch (err) {
      console.error('Update failed:', err);

      setUploadError(
        err.message || 'Failed to update the document. Please try again.'
      );
    } finally {
      setUpdatingDocumentId(null);
    }
  };
 const renderUpload = () => (
  <>
    <div
      className={`${styles.uploadZone} ${dragging ? styles.dragging : ''}`}
      onDragOver={e => {
        e.preventDefault();
        setDragging(true);
      }}
      onDragLeave={() => setDragging(false)}
      onDrop={handleDrop}
      onClick={() => !uploading && fileRef.current.click()}
    >
      <div className={styles.uploadIcon}><UploadCloud size={30} /></div>

      <p className={styles.uploadTitle}>
        {uploading
          ? 'Uploading and indexing…'
          : 'Drop a file here or click to browse'}
      </p>

      <p className={styles.uploadSub}>
        Supported: {SUPPORTED_EXTENSIONS.join(', ')}
      </p>

      <input
        ref={fileRef}
        type="file"
        accept={SUPPORTED_EXTENSIONS.join(',')}
        style={{ display: 'none' }}
        onChange={e => handleFiles(e.target.files)}
        disabled={uploading}
      />
    </div>

    {/* Dedicated file input for document replacement.
        This is intentionally outside the normal upload zone/input. */}
    <input
      ref={updateFileRef}
      type="file"
      accept={SUPPORTED_EXTENSIONS.join(',')}
      style={{ display: 'none' }}
      onClick={e => e.stopPropagation()}
      onChange={e => {
        e.stopPropagation();
        const file = e.target.files?.[0];

        if (file) {
          const extension = `.${file.name.split('.').pop().toLowerCase()}`;
          if (!SUPPORTED_EXTENSIONS.includes(extension)) {
            setUploadError(
              `Unsupported file type "${extension}". Supported types: ${SUPPORTED_EXTENSIONS.join(', ')}`
            );
          } else {
            submitDocumentUpdate(file);
          }
        }

        e.target.value = '';
      }}
      disabled={!!updatingDocumentId}
    />

    {uploadError && (
      <p className={styles.errorText}>{uploadError}</p>
    )}

    <div className={styles.card}>
      <p className={styles.cardTitle}>
        Uploaded This Session ({uploadedThisSession.length})
      </p>

      <div className={styles.uploadedList}>
        {uploadedThisSession.length === 0 ? (
          <p className={styles.emptyNote}>No documents uploaded yet this session.</p>
        ) : (
          uploadedThisSession.map(doc => (
            <div
              key={doc.id}
              className={styles.uploadedItem}
            >
              <div>
                <p className={styles.uploadedName}>
                  <FileText size={14} /> {doc.name}
                </p>

                <p className={styles.uploadedMeta}>
                  Version {doc.version} · {doc.status} · Indexed {doc.date}
                </p>
              </div>

              <div className={styles.docActions}>
                <button
                  type="button"
                  className={styles.updateBtn}
                  onClick={(e) => handleUpdateDocument(e, doc)}
                  disabled={updatingDocumentId === doc.id}
                >
                  {updatingDocumentId === doc.id
                    ? 'Updating…'
                    : 'Update'}
                </button>

                <button
                  type="button"
                  className={styles.deleteBtn}
                  onClick={(e) => handleDeleteDocument(e, doc.id)}
                  disabled={deletingDocumentId === doc.id}
                >
                  {deletingDocumentId === doc.id
                    ? 'Deleting…'
                    : 'Delete'}
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
    {documentToDelete && (
  <div
    className={styles.modalOverlay}
    onClick={() =>
      !deletingDocumentId && setDocumentToDelete(null)
    }
  >
    <div
      className={styles.modalBox}
      onClick={e => e.stopPropagation()}
    >
      <p className={styles.modalTitle}>Delete Document</p>

      <p className={styles.modalBody}>
        Are you sure you want to delete{' '}
        <strong>{documentToDelete.name}</strong>?
        <br />
        This will remove the document and its indexed chunks.
      </p>

      <div className={styles.modalActions}>
        <button
          type="button"
          className={styles.modalCancelBtn}
          onClick={() => setDocumentToDelete(null)}
          disabled={!!deletingDocumentId}
        >
          Cancel
        </button>

        <button
          type="button"
          className={styles.modalDeleteBtn}
          onClick={confirmDeleteDocument}
          disabled={!!deletingDocumentId}
        >
          {deletingDocumentId
            ? 'Deleting…'
            : 'Delete'}
        </button>
      </div>
    </div>
  </div>
)}
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
                <tr key={u.user_id}>
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
    if (!stats) return <p className={styles.pageSub}>Failed to load statistics.</p>;

    const evaluation = stats.evaluation;

    return (
      <>
        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <p className={`${styles.statValue} ${styles.accent}`}>{stats.documents?.total ?? 0}</p>
            <p className={styles.statLabel}>Documents</p>
          </div>
          <div className={styles.statCard}>
            <p className={styles.statValue}>{stats.rag?.indexed_chunks ?? 0}</p>
            <p className={styles.statLabel}>Indexed chunks</p>
          </div>
          <div className={styles.statCard}>
            <p className={`${styles.statValue} ${styles.accent}`}>{stats.queries?.total ?? 0}</p>
            <p className={styles.statLabel}>Total queries</p>
          </div>
        </div>

        <div className={styles.card}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 'var(--sp-3)' }}>
            <p className={styles.cardTitle} style={{ margin: 0 }}>Evaluation</p>
            <button
              className={styles.testSendBtn}
              onClick={handleRunEvaluation}
              disabled={runningEvaluation}
            >
              {runningEvaluation ? 'Running… (1-3 min)' : 'Run Evaluation'}
            </button>
          </div>

          {evaluationError && (
            <p className={styles.errorText}>{evaluationError}</p>
          )}

          {!evaluation ? (
            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 16 }}>
              No evaluation has been run yet. Click "Run Evaluation" to score the RAG pipeline
              against the Hybrid-RAG-Evaluation dataset in LangSmith.
            </p>
          ) : (
            <>
              <p style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 12 }}>
                Run <strong>{evaluation.run_id}</strong> · {evaluation.total_examples} examples ·{' '}
                {new Date(evaluation.evaluated_at).toLocaleString()}
                {evaluation.run_url && (
                  <>
                    {' · '}
                    <a
                      className={styles.externalLink}
                      href={evaluation.run_url}
                      target="_blank"
                      rel="noreferrer"
                    >
                      View in LangSmith ↗
                    </a>
                  </>
                )}
              </p>

              <div className={styles.metricsGrid} style={{ marginTop: 'var(--sp-4)' }}>
                {Object.entries(EVAL_METRIC_LABELS).map(([key, label]) => {
                  const score = evaluation.metrics[key];
                  if (score === undefined) return null;

                  const tier = scoreTier(score);

                  return (
                    <div key={key} className={styles.metricRow}>
                      <div className={styles.metricLabel}>
                        <span>{label}</span>
                        <span className={styles.metricVal}>{score}%</span>
                      </div>
                      <div className={styles.metricBar}>
                        <div
                          className={`${styles.metricFill} ${tier ? styles[tier] : ''}`}
                          style={{ width: `${score}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </>
          )}
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
            <div
              key={i}
              className={`${styles.testBubble} ${m.role === 'user' ? styles.user : styles.bot}`}
            >
              {m.role === 'bot' ? stripMarkdown(m.text) : m.text}
            </div>
          ))}
          {testLoading && (
            <div className={styles.testTyping}>
              Running retrieval, reranking, and generation…
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
        <p className={styles.cardTitle} style={{ marginBottom: 'var(--sp-3)' }}>About This Test</p>
        <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.6 }}>
          Sends a single question straight to the Hybrid RAG pipeline (retrieval → reranking →
          generation) without creating a saved conversation. Every call is traced automatically
          in LangSmith — this does not run the evaluation dataset or affect the Statistics page.
        </p>

        {lastElapsedMs !== null && (
          <div className={styles.timingList}>
            {[
              { label: 'Total Response Time', val: `${lastElapsedMs}ms` },
              ...(lastTimings ? [
                { label: 'Retrieval',  val: `${lastTimings.retrieval_ms}ms` },
                { label: 'Reranking',  val: `${lastTimings.reranking_ms}ms` },
                { label: 'Generation', val: `${lastTimings.generation_ms}ms` },
              ] : []),
            ].map((s, i) => (
              <div key={i} className={styles.timingRow}>
                <span className={styles.timingLabel}>{s.label}</span>
                <span className={styles.timingVal}>{s.val}</span>
              </div>
            ))}
          </div>
        )}

        {lastTraceUrl && (
          <a
            className={styles.externalLink}
            href={lastTraceUrl}
            target="_blank"
            rel="noreferrer"
            style={{ display: 'inline-block', marginTop: 'var(--sp-4)' }}
          >
            View trace in LangSmith ↗
          </a>
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
              <span className={styles.navIcon}><n.icon size={16} /></span>
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
              {sidebarOpen ? <X size={18} /> : <Menu size={18} />}
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