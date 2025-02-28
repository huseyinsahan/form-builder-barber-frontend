import React from 'react';
import Link from 'next/link';
import styles from '../styles/home.module.css';
// Import icons (you'll need to install a package like react-icons)
// import { FaRegCalendarAlt, FaUserEdit, FaLink } from 'react-icons/fa';

const Home: React.FC = () => {
  return (
    <div className={styles.container}>
      <div className={styles.topLine}></div>
      <header className={styles.header}>
        <div className={styles.logo}>Randevu Formu</div>
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
            <h2>Randevu Formu Uygulamasına Hoş Geldiniz!</h2>
            <p>Müşterileriniz için kusursuz bir randevu deneyimi sunun.</p>
          </div>
        </div>
        
        {/* New How It Works Section */}
        <div className={styles.howItWorksSection}>
          <h2 className={styles.howItWorksTitle}>Nasıl Çalışır?</h2>
          <div className={styles.stepsContainer}>
            <div className={styles.step}>
              <div className={styles.stepNumber}>1</div>
              <div className={styles.stepIcon}>
                {/* If you have react-icons: <FaUserEdit /> */}
                📝
              </div>
              <h3 className={styles.stepTitle}>Formu Oluşturun</h3>
              <p className={styles.stepDescription}>
                Hızlı kayıt işlemini tamamlayarak kişiselleştirilmiş randevu formunuzu oluşturun.
              </p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>2</div>
              <div className={styles.stepIcon}>
                {/* If you have react-icons: <FaShareAlt /> */}
                🔗
              </div>
              <h3 className={styles.stepTitle}>Form Bağlantınızı Paylaşın</h3>
              <p className={styles.stepDescription}>
                Özel randevu formunuzu müşterilerinizle paylaşarak randevu almalarını sağlayın.
              </p>
            </div>
            
            <div className={styles.step}>
              <div className={styles.stepNumber}>3</div>
              <div className={styles.stepIcon}>
                {/* If you have react-icons: <FaRegCalendarAlt /> */}
                📅
              </div>
              <h3 className={styles.stepTitle}>Randevularınızı Görüntüleyin ve Yönetin</h3>
              <p className={styles.stepDescription}>
                Gelen randevuları kolay arayüz ile görüntüleyin ve randevu takvimizi yönetin.
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};

export default Home;