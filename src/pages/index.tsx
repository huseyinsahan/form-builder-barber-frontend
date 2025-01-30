import React from 'react';
import Link from 'next/link';
import styles from '../styles/Home.module.css';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.topLine}></div>
      <header className={styles.header}>
        <div className={styles.logo}>Randevu Yönetim</div>
        <nav className={styles.nav}>
          <Link href="/login" legacyBehavior>
            <a className={styles.navButton}>Giriş Yap</a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className={styles.navButton}>Kayıt Ol</a>
          </Link>
        </nav>
      </header>
      <section className={styles.mainContent}>
        <div className={styles.mainMessage}>
          <h2>Randevu Yönetim Uygulamasına hoş geldiniz!</h2>
          <p>Randevularınız için en ucuz ve kullanışlı yönetim uygulaması</p>
          <Link href="/register" legacyBehavior>
            <a className={styles.ctaButton}>Hemen Başla</a>
          </Link>
        </div>
        <section className={styles.boxContainer}>
          <div className={styles.box}>
          </div>
          <div className={styles.box}></div>
          <div className={styles.box}></div>
        </section>
      </section>
      <div className={styles.dynamicShape}></div>
    </div>
  );
};

export default Home;