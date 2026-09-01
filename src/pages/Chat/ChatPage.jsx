import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Chat.module.css';

const INITIAL_CHATS = [
  { id: 1, title: 'Explain Hybrid RAG',      pinned: true  },
  { id: 2, title: 'Summarise Q3 report',     pinned: true  },
  { id: 3, title: 'Compare vector stores',   pinned: false },
  { id: 4, title: 'LangChain vs LlamaIndex', pinned: false },
];

const BOT_GREETING = "Hello! I'm your RAG-powered assistant. Ask me anything about your documents.";
const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatPage = () => {
  const { currentUser } = useAuth();

  const [chats, setChats]           = useState(INITIAL_CHATS);
  const [activeChatId, setActive]   = useState(1);
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal]   = useState('');
  const [messages, setMessages]     = useState([
    { id: 1, role: 'bot', text: BOT_GREETING, time: new Date() }
  ]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  // Close sidebar on resize to desktop
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const pinnedChats = chats.filter(c => c.pinned);
  const recentChats = chats.filter(c => !c.pinned);
  const activeChat  = chats.find(c => c.id === activeChatId);

  const displayName = currentUser?.name || currentUser?.email || 'U';
  const initials    = displayName
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  /* ── New chat ── */
  const handleNewChat = () => {
    const id = Date.now();
    setChats(prev => [{ id, title: 'New Chat', pinned: false }, ...prev]);
    setActive(id);
    setMessages([{ id: 1, role: 'bot', text: BOT_GREETING, time: new Date() }]);
    setSidebarOpen(false);
  };

  /* ── Pin (max 3) ── */
  const handlePin = (id) => {
    setChats(prev => prev.map(c => {
      if (c.id !== id) return c;
      if (!c.pinned && pinnedChats.length >= 3) return c;
      return { ...c, pinned: !c.pinned };
    }));
  };

  /* ── Rename ── */
  const startRename = (id, title) => {
    setRenamingId(id);
    setRenameVal(title);
  };

  const commitRename = (id) => {
    if (renameVal.trim()) {
      setChats(prev => prev.map(c =>
        c.id === id ? { ...c, title: renameVal.trim() } : c
      ));
    }
    setRenamingId(null);
  };

  /* ── Delete ── */
  const handleDelete = (id) => {
    setChats(prev => {
      const remaining = prev.filter(c => c.id !== id);
      if (activeChatId === id && remaining.length > 0) {
        setActive(remaining[0].id);
      }
      return remaining;
    });
  };

  /* ── Send ── */
  const handleSend = () => {
    const text = input.trim();
    if (!text) return;
    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text, time: new Date() }]);
    setInput('');
    setTyping(true);
    setTimeout(() => {
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: `This is a simulated RAG response to: "${text}". Connect the backend to get real answers.`,
        time: new Date()
      }]);
    }, 1400);
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  /* ── Chat list item ── */
  const ChatListItem = ({ chat }) => (
    <div
      className={`${styles.chatItem} ${chat.id === activeChatId ? styles.active : ''}`}
      onClick={() => { setActive(chat.id); setSidebarOpen(false); }}
    >
      <div className={styles.chatItemLeft}>
        {chat.pinned && <span className={styles.pinIcon}>📌</span>}
        {renamingId === chat.id ? (
          <input
            className={styles.renameInput}
            value={renameVal}
            autoFocus
            onChange={e => setRenameVal(e.target.value)}
            onBlur={() => commitRename(chat.id)}
            onKeyDown={e => e.key === 'Enter' && commitRename(chat.id)}
            onClick={e => e.stopPropagation()}
          />
        ) : (
          <span className={styles.chatTitle}>{chat.title}</span>
        )}
      </div>
      <div className={styles.chatItemActions}>
        <button
          className={styles.actionBtn}
          title={chat.pinned ? 'Unpin' : 'Pin'}
          onClick={e => { e.stopPropagation(); handlePin(chat.id); }}
        >
          {chat.pinned ? '📍' : '📌'}
        </button>
        <button
          className={styles.actionBtn}
          title="Rename"
          onClick={e => { e.stopPropagation(); startRename(chat.id, chat.title); }}
        >
          ✏️
        </button>
        <button
          className={`${styles.actionBtn} ${styles.danger}`}
          title="Delete"
          onClick={e => { e.stopPropagation(); handleDelete(chat.id); }}
        >
          🗑
        </button>
      </div>
    </div>
  );

  return (
    <div className={styles.layout}>
      <Header />

      <div className={styles.body}>

        {/* Overlay for mobile */}
        <div
          className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

        {/* ── Sidebar ── */}
        <aside className={`${styles.sidebar} ${sidebarOpen ? styles.open : ''}`}>
          <div className={styles.sidebarTop}>
            <button className={styles.newChatBtn} onClick={handleNewChat}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <line x1="12" y1="5" x2="12" y2="19"/>
                <line x1="5" y1="12" x2="19" y2="12"/>
              </svg>
              New Chat
            </button>
          </div>

          <div className={styles.sidebarScroll}>
            {pinnedChats.length > 0 && (
              <>
                <p className={styles.sectionLabel}>Pinned</p>
                {pinnedChats.map(c => <ChatListItem key={c.id} chat={c} />)}
              </>
            )}
            {recentChats.length > 0 && (
              <>
                <p className={styles.sectionLabel}>Recent</p>
                {recentChats.map(c => <ChatListItem key={c.id} chat={c} />)}
              </>
            )}
            {chats.length === 0 && (
              <p style={{
                fontSize: 12, color: 'var(--text-muted)',
                textAlign: 'center', marginTop: 24
              }}>
                No chats yet. Start a new one!
              </p>
            )}
          </div>
        </aside>

        {/* ── Chat Window ── */}
        <main className={styles.chatMain}>
          <div className={styles.chatTopBar}>
            <div className={styles.chatTopLeft}>
              {/* Hamburger — mobile only */}
              <button
                className={styles.hamburger}
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? '✕' : '☰'}
              </button>
              <span className={styles.chatName}>{activeChat?.title || 'Chat'}</span>
            </div>
            <span className={styles.modelTag}>Hybrid RAG</span>
          </div>

          <div className={styles.messages}>
            {messages.length === 0 ? (
              <div className={styles.emptyState}>
                <div className={styles.emptyIcon}>💬</div>
                <p className={styles.emptyTitle}>Start a conversation</p>
                <p className={styles.emptySubtitle}>
                  Ask anything about your documents and get grounded answers.
                </p>
              </div>
            ) : (
              messages.map(msg => (
                <div
                  key={msg.id}
                  className={`${styles.msgRow} ${msg.role === 'user' ? styles.user : ''}`}
                >
                  <div className={`${styles.msgAvatar} ${msg.role === 'bot' ? styles.bot : styles.user}`}>
                    {msg.role === 'bot' ? 'R' : initials}
                  </div>
                  <div>
                    <div className={`${styles.bubble} ${msg.role === 'bot' ? styles.bot : styles.user}`}>
                      {msg.text}
                    </div>
                    <p className={styles.msgTime}>{fmt(msg.time)}</p>
                  </div>
                </div>
              ))
            )}

            {typing && (
              <div className={styles.msgRow}>
                <div className={`${styles.msgAvatar} ${styles.bot}`}>R</div>
                <div className={`${styles.bubble} ${styles.bot}`}
                  style={{ color: 'var(--text-muted)' }}>
                  Thinking…
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className={styles.inputArea}>
            <div className={styles.inputRow}>
              <textarea
                className={styles.textInput}
                placeholder="Ask anything about your documents…"
                rows={1}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
              />
              <button
                className={styles.sendBtn}
                onClick={handleSend}
                disabled={!input.trim() || typing}
              >
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2.5"
                  strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13"/>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"/>
                </svg>
              </button>
            </div>
            <p className={styles.inputHint}>
              Enter to send · Shift+Enter for new line
            </p>
          </div>
        </main>
      </div>

      <Footer />
    </div>
  );
};

export default ChatPage;