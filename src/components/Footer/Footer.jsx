import styles from './Footer.module.css';

const Footer = () => {
  return (
    <footer className={styles.footer}>
      <span className={styles.copy}>© 2026 RAGChat. All rights reserved.</span>
    </footer>
  );
};

export default Footer;