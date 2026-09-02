import { Link } from 'react-router-dom';
import styles from './PublicFooter.module.css';

const PublicFooter = () => {
  return (
    <footer className={styles.footer}>
      <div className={styles.grid}>

        {/* Column 1 — About RAG */}
        <div>
          <p className={styles.colTitle}>What is Hybrid RAG?</p>
          <p className={styles.colText}>
            Hybrid Retrieval-Augmented Generation combines dense vector search
            with sparse keyword retrieval to deliver answers grounded in your
            actual documents — not just model memory. Every response is
            traceable, accurate, and context-aware.
          </p>
        </div>

        {/* Column 2 — Quick Links */}
        <div>
          <p className={styles.colTitle}>Quick Links</p>
          <ul className={styles.linkList}>
            <li><Link to="/about">About Us</Link></li>
            <li><Link to="/contact">Contact Us</Link></li>
            <li><Link to="/login">Sign In</Link></li>
          </ul>
        </div>

        {/* Column 3 — Contact */}
        <div>
          <p className={styles.colTitle}>Get in Touch</p>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Email</span>
            <span className={styles.contactVal}>contactus@ragteam.com</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Location</span>
            <span className={styles.contactVal}>Cognizant Technology Solutions, Hyderabad</span>
          </div>
          <div className={styles.contactItem}>
            <span className={styles.contactLabel}>Response</span>
            <span className={styles.contactVal}>Within 24 hours</span>
          </div>
        </div>

      </div>

      <div className={styles.bottom}>
        <span className={styles.copy}>© 2026 RAGChat · Cognizant Technology Solutions</span>
        <span className={styles.tag}>Hybrid RAG v1.0</span>
      </div>
    </footer>
  );
};

export default PublicFooter;