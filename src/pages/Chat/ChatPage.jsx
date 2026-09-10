import { useState, useRef, useEffect } from 'react';
import { useAuth } from '../../context/AuthContext';
import Header from '../../components/Header/Header';
import Footer from '../../components/Footer/Footer';
import styles from './Chat.module.css';

const API_BASE = 'http://localhost:8000';
const BOT_GREETING = "Hello! I'm your RAG-powered assistant. Ask me anything about your documents.";
const fmt = (d) => d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

const ChatPage = () => {
  const { currentUser } = useAuth();
  const userId = currentUser?.email;

  const [chats, setChats]           = useState([]);
  const [activeChatId, setActive]   = useState(null); // null = new, unsaved conversation
  const [renamingId, setRenamingId] = useState(null);
  const [renameVal, setRenameVal]   = useState('');
  const [messages, setMessages]     = useState([
    { id: 1, role: 'bot', text: BOT_GREETING, time: new Date() }
  ]);
  const [input, setInput]       = useState('');
  const [typing, setTyping]     = useState(false);
  const [loadingChats, setLoadingChats] = useState(true);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, typing]);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  /* ── Load chat list on mount ── */
  useEffect(() => {
    if (!userId) return;

    const loadChats = async () => {
      setLoadingChats(true);
      try {
        const res = await fetch(`${API_BASE}/api/chats?user_id=${encodeURIComponent(userId)}`);
        const data = await res.json();
        // pinned is a frontend-only concept for now — backend doesn't store it
        setChats(data.map(c => ({ ...c, pinned: false })));
      } catch (err) {
        console.error('Failed to load chats:', err);
      } finally {
        setLoadingChats(false);
      }
    };

    loadChats();
  }, [userId]);

  const pinnedChats = chats.filter(c => c.pinned);
  const recentChats = chats.filter(c => !c.pinned);
  const activeChat  = chats.find(c => c.id === activeChatId);

  const displayName = currentUser?.name || currentUser?.email || 'U';
  const initials    = displayName
    .split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);

  /* ── New chat: just clears the view, no API call yet ── */
  const handleNewChat = () => {
    setActive(null);
    setMessages([{ id: 1, role: 'bot', text: BOT_GREETING, time: new Date() }]);
    setSidebarOpen(false);
  };

  /* ── Select an existing chat: fetch its full message history ── */
  const handleSelectChat = async (chatId) => {
    setActive(chatId);
    setSidebarOpen(false);
    try {
      const res = await fetch(
        `${API_BASE}/api/chats/${chatId}?user_id=${encodeURIComponent(userId)}`
      );
      if (!res.ok) throw new Error('Not found');
      const data = await res.json();

      const loaded = data.messages.map((m, i) => ({
        id: i,
        role: m.role === 'assistant' ? 'bot' : 'user',
        text: m.content,
        time: new Date(), // backend doesn't store per-message timestamps yet
      }));
      setMessages(loaded.length ? loaded : [{ id: 1, role: 'bot', text: BOT_GREETING, time: new Date() }]);
    } catch (err) {
      console.error('Failed to load conversation:', err);
    }
  };

  /* ── Pin (max 3) — calls backend ── */
  const handlePin = async (id) => {
    const chat = chats.find(c => c.id === id);
    if (!chat) return;

    const newPinned = !chat.pinned;
    if (newPinned && pinnedChats.length >= 3) return; // limit reached, do nothing

    try {
      const res = await fetch(`${API_BASE}/api/chats/${id}/pin`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, pinned: newPinned }),
      });
      if (!res.ok) throw new Error('Pin update failed');

      setChats(prev => prev.map(c =>
        c.id === id ? { ...c, pinned: newPinned } : c
      ));
    } catch (err) {
      console.error('Failed to update pin:', err);
    }
  };

  /* ── Rename — frontend-only, resets on refresh ── */
  const startRename = (id, title) => {
    setRenamingId(id);
    setRenameVal(title);
  };

  /* ── Rename — calls backend ── */
  const commitRename = async (id) => {
    const title = renameVal.trim();
    setRenamingId(null);

    if (!title) return;

    try {
      const res = await fetch(`${API_BASE}/api/chats/${id}/rename`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, title }),
      });
      if (!res.ok) throw new Error('Rename failed');

      setChats(prev => prev.map(c =>
        c.id === id ? { ...c, title } : c
      ));
    } catch (err) {
      console.error('Failed to rename chat:', err);
    }
  };

  /* ── Delete — calls backend ── */
  const handleDelete = async (id) => {
    try {
      const res = await fetch(
        `${API_BASE}/api/chats/${id}?user_id=${encodeURIComponent(userId)}`,
        { method: 'DELETE' }
      );
      if (!res.ok && res.status !== 204) throw new Error('Delete failed');

      setChats(prev => {
        const remaining = prev.filter(c => c.id !== id);
        if (activeChatId === id) {
          setActive(remaining.length > 0 ? remaining[0].id : null);
          setMessages([{ id: 1, role: 'bot', text: BOT_GREETING, time: new Date() }]);
        }
        return remaining;
      });
    } catch (err) {
      console.error('Failed to delete chat:', err);
    }
  };

  /* ── Send: real API call ── */
  const handleSend = async () => {
    const text = input.trim();
    if (!text || !userId) return;

    setMessages(prev => [...prev, { id: Date.now(), role: 'user', text, time: new Date() }]);
    setInput('');
    setTyping(true);

    try {
      const res = await fetch(`${API_BASE}/api/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          question: text,
          conversation_id: activeChatId, // null if this is a brand-new conversation
        }),
      });

      if (!res.ok) throw new Error('Request failed');
      const data = await res.json();

      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot', text: data.answer, time: new Date()
      }]);

      // First message in a new conversation — add it to the sidebar list
      if (!activeChatId) {
        setActive(data.conversation_id);
        setChats(prev => [
          { id: data.conversation_id, title: text.slice(0, 50), pinned: false, created_at: new Date().toISOString() },
          ...prev,
        ]);
      }
    } catch (err) {
      console.error('Chat request failed:', err);
      setTyping(false);
      setMessages(prev => [...prev, {
        id: Date.now() + 1, role: 'bot',
        text: 'Something went wrong reaching the assistant. Please try again.',
        time: new Date()
      }]);
    }
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
      onClick={() => handleSelectChat(chat.id)}
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
        <div
          className={`${styles.overlay} ${sidebarOpen ? styles.visible : ''}`}
          onClick={() => setSidebarOpen(false)}
        />

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
            {loadingChats ? (
              <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>
                Loading chats…
              </p>
            ) : (
              <>
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
                  <p style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', marginTop: 24 }}>
                    No chats yet. Start a new one!
                  </p>
                )}
              </>
            )}
          </div>
        </aside>

        <main className={styles.chatMain}>
          <div className={styles.chatTopBar}>
            <div className={styles.chatTopLeft}>
              <button
                className={styles.hamburger}
                onClick={() => setSidebarOpen(prev => !prev)}
                aria-label="Toggle sidebar"
              >
                {sidebarOpen ? '✕' : '☰'}
              </button>
              <span className={styles.chatName}>{activeChat?.title || 'New Chat'}</span>
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
                  <div className={styles.msgContent}>
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
                <div className={styles.msgContent}>
                  <div className={`${styles.bubble} ${styles.bot}`}
                    style={{ color: 'var(--text-muted)' }}>
                    Thinking…
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

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