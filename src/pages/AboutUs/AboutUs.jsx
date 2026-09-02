import { Link } from 'react-router-dom';
import Header from '../../components/Header/Header';
import PublicFooter from '../../components/PublicFooter/PublicFooter';

const AboutUs = () => {

  const TEAM = [
    {
      name: 'Teja Reddy',
      // role: 'Frontend Developer',
      email: 'venkatatejareddy.thumu@cognizant.com',
      initials: 'TR',
      color: 'var(--accent)',
    },
    {
      name: 'Brahmam',
      // role: 'Backend Developer',
      email: 'brahmam.chava@cognizant.com',
      initials: 'BC',
      color: 'var(--admin-accent)',
    },
  ];

  const STACK = [
    { label: 'React + Vite',   icon: '⚛️' },
    { label: 'Auth0',          icon: '🔐' },
    { label: 'Python FastAPI', icon: '🐍' },
    { label: 'LangChain',      icon: '🔗' },
    { label: 'ChromaDB',       icon: '🗄️' },
    { label: 'Gemini/Claude',   icon: '🤖' },
    { label: 'BM25 Retriever', icon: '🔍' },
    // { label: 'Docker',         icon: '🐳' },
  ];

  const USE_CASES = [
    {
      icon: '📄',
      title: 'PDF Documents',
      desc: 'Annual reports, research papers, technical manuals, policy documents.',
    },
    {
      icon: '📊',
      title: 'Spreadsheets',
      desc: 'Financial data, inventory records, project trackers in Excel or CSV.',
    },
    {
      icon: '📝',
      title: 'Word Documents',
      desc: 'Internal memos, SOPs, meeting notes, project documentation.',
    },
    {
      icon: '🗃️',
      title: 'Knowledge Bases',
      desc: 'HR policies, compliance guidelines, product wikis, FAQs.',
    },
  ];

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
      marginBottom: '18px',
    },
    lead: {
      fontSize: '15px',
      color: 'var(--text-secondary)',
      lineHeight: 1.8,
      marginBottom: '56px',
      maxWidth: '640px',
    },
    divider: {
      height: '1px',
      background: 'var(--border)',
      margin: '48px 0',
    },
    h2: {
      fontFamily: 'var(--font-ui)',
      fontSize: '20px',
      fontWeight: 600,
      color: 'var(--text-primary)',
      marginBottom: '16px',
      letterSpacing: '-0.2px',
    },
    body: {
      fontSize: '14px',
      color: 'var(--text-secondary)',
      lineHeight: 1.8,
      marginBottom: '32px',
    },
  };

  return (
    <div style={s.page}>
      <Header showNav={true} />

      <main style={s.main}>

        {/* Hero */}
        <span style={s.eyebrow}>About RAGChat</span>
        <h1 style={s.h1}>Built to make your documents<br />actually answerable.</h1>
        <p style={s.lead}>
          RAGChat is an enterprise-grade question-answering system built at
          Cognizant Technology Solutions. It uses Hybrid Retrieval-Augmented
          Generation to deliver accurate, document-grounded answers instantly —
          eliminating the need to manually search through files.
        </p>

        {/* Project Overview */}
        <h2 style={s.h2}>Project Overview</h2>
        <p style={s.body}>
          Enterprise teams spend enormous time hunting through PDFs, reports, and
          internal wikis for answers that should take seconds to find. RAGChat
          solves this by letting you upload your documents and ask questions in
          plain English. Every answer is grounded in your actual data — not
          the model's training memory — making it reliable, auditable, and
          relevant to your specific context.
        </p>

        <div style={s.divider} />

        {/* How Hybrid RAG works */}
        <h2 style={s.h2}>How Hybrid RAG Works</h2>
        <p style={s.body}>
          Traditional search is keyword-based — it finds documents containing
          your exact words. Large language models understand meaning but can
          hallucinate facts they were never trained on. Hybrid RAG bridges that
          gap by combining two retrieval strategies:
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr',
          gap: '16px',
          marginBottom: '32px',
        }}>
          {[
            {
              title: '🔍 Dense Retrieval',
              desc: 'Uses vector embeddings to find semantically similar chunks — understands meaning, not just keywords.',
            },
            {
              title: '📖 Sparse Retrieval (BM25)',
              desc: 'Traditional keyword matching that excels at finding exact terms, names, and specific phrases.',
            },
            {
              title: '🔀 Hybrid Fusion',
              desc: 'Combines both results using Reciprocal Rank Fusion to get the best of both approaches.',
            },
            {
              title: '🤖 LLM Generation',
              desc: 'Retrieved chunks are passed to LLM model as context — so every answer is grounded in your documents.',
            },
          ].map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '20px',
            }}>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '8px',
              }}>
                {item.title}
              </p>
              <p style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Tech Stack */}
        <h2 style={s.h2}>Technology Stack</h2>
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: '10px',
          marginBottom: '40px',
        }}>
          {STACK.map((item, i) => (
            <div key={i} style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius-sm)',
              padding: '8px 14px',
              fontSize: '13px',
              color: 'var(--text-primary)',
              fontFamily: 'var(--font-ui)',
            }}>
              <span>{item.icon}</span>
              <span>{item.label}</span>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Use Cases */}
        <h2 style={s.h2}>What Documents Can It Handle?</h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {USE_CASES.map((item, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '20px 16px',
            }}>
              <span style={{ fontSize: '24px', display: 'block', marginBottom: '10px' }}>
                {item.icon}
              </span>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '13px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '6px',
              }}>
                {item.title}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-secondary)',
                lineHeight: 1.6,
              }}>
                {item.desc}
              </p>
            </div>
          ))}
        </div>

        <div style={s.divider} />

        {/* Team */}
        <h2 style={s.h2}>The Team</h2>
        <p style={{ ...s.body, marginBottom: '24px' }}>
          RAGChat was designed and built by a two-person team at
          Cognizant Technology Solutions, Hyderabad.
        </p>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: '16px',
          marginBottom: '40px',
        }}>
          {TEAM.map((m, i) => (
            <div key={i} style={{
              background: 'var(--bg-surface)',
              border: '1px solid var(--border)',
              borderRadius: 'var(--radius)',
              padding: '24px 20px',
              textAlign: 'center',
            }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '50%',
                background: m.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 700,
                color: '#fff',
                fontFamily: 'var(--font-ui)',
                margin: '0 auto 12px',
              }}>
                {m.initials}
              </div>
              <p style={{
                fontFamily: 'var(--font-ui)',
                fontSize: '14px',
                fontWeight: 600,
                color: 'var(--text-primary)',
                marginBottom: '4px',
              }}>
                {m.name}
              </p>
              <p style={{
                fontSize: '12px',
                color: 'var(--text-muted)',
                marginBottom: '8px',
              }}>
                {m.role}
              </p>
              <p style={{
                fontSize: '11px',
                color: 'var(--accent)',
                wordBreak: 'break-all',
              }}>
                {m.email}
              </p>
            </div>
          ))}
        </div>

        {/* CTA */}
        <div style={{
          background: 'var(--bg-surface)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--radius-lg)',
          padding: '32px',
          textAlign: 'center',
        }}>
          <p style={{
            fontFamily: 'var(--font-ui)',
            fontSize: '18px',
            fontWeight: 600,
            color: 'var(--text-primary)',
            marginBottom: '8px',
          }}>
            Ready to try RAGChat?
          </p>
          <p style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            marginBottom: '20px',
          }}>
            Upload your documents and start getting instant, grounded answers.
          </p>
          <Link to="/login" style={{
            display: 'inline-block',
            padding: '10px 28px',
            background: 'var(--accent)',
            color: '#fff',
            borderRadius: 'var(--radius-sm)',
            fontFamily: 'var(--font-ui)',
            fontWeight: 600,
            fontSize: '14px',
            textDecoration: 'none',
            transition: 'background var(--transition)',
          }}>
            Get Started
          </Link>
        </div>

      </main>

      <PublicFooter />
    </div>
  );
};

export default AboutUs;