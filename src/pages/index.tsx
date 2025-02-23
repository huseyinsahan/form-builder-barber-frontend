import React from 'react';
import Link from 'next/link';
import styles from '../styles/home.module.css';

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
        <div className={styles.textContainer}>
          <h2>Randevu Yönetim Uygulamasına hoş geldiniz!</h2>
          <p>Telefonla konuşmaktan yorulmadınız mı? Müşterilerinizin uygun Randevuları direkt 
            görebileceği bir websitesi mi arıyorsunuz? Özelleştirilebilir randevu toplama formu
            ve bütün randevularınızı yönetebileceğiniz bir uygulama mı arıyorsunuz? İşte burada! 
            Randevuyönetim.com, randevularınız için en ucuz ve kullanışlı yönetim uygulaması. </p>
        </div>
        <Link href="/register" legacyBehavior>
          <a className={styles.ctaButton}>Hemen Başla</a>
        </Link>
      </div>
      </section>   
      <section className={styles.boxContainer}>
        <div className={styles.box}> </div>
        <div className={styles.box}></div>
        <div className={styles.box}></div>
      </section>
    </div>
  );
};

export default Home;