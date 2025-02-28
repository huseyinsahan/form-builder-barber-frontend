import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Register.module.css';

const Register: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [phone, setPhone] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const router = useRouter();

  // Function to validate Turkish phone number format
  const validatePhone = (phone: string) => {
    // Remove all non-digit characters for validation
    const digitsOnly = phone.replace(/\D/g, '');
    
    // Turkish phone numbers should be 10 digits (excluding country code)
    // and should start with 05
    const isValid = /^05\d{9}$/.test(digitsOnly);
    
    if (!isValid && phone) {
      setPhoneError('Geçerli bir telefon numarası girin (05X XXX XX XX)');
      return false;
    } else {
      setPhoneError('');
      return true;
    }
  };

  // Format phone number input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const input = e.target.value;
    // Allow only numbers, spaces, and parentheses
    const filtered = input.replace(/[^\d\s()]/g, '');
    setPhone(filtered);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate phone before submission
    if (!validatePhone(phone)) {
      return;
    }
    
    setLoading(true);
    setError('');

    // Format phone number for submission (remove all non-digits)
    const formattedPhone = phone.replace(/\D/g, '');

    try {
      const response = await fetch('https://form-builder-barber.onrender.com/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          username, 
          password, 
          phone: formattedPhone 
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Kayıt işlemi başarısız');
      }

      router.push('/login');
    } catch (error) {
      setError((error as any).message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topLine}></div>
      <header className={styles.header}>
        <Link href="/" legacyBehavior>
          <a className={styles.logo}>Randevu Formu</a>
        </Link>
        <nav className={styles.nav}>
          <Link href="/login" legacyBehavior>
            <a className={styles.navButton}>Giriş Yap</a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className={`${styles.navButton} ${styles.activeNavButton}`}>Kayıt Ol</a>
          </Link>
        </nav>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.formContainer}>
          <h1 className={styles.formTitle}>Kayıt Ol</h1>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Kullanıcı Adı</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="password">Şifre</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                disabled={loading}
              />
            </div>
            <div className={styles.inputGroup}>
              <label htmlFor="phone">Telefon</label>
              <input
                type="tel"
                id="phone"
                value={phone}
                onChange={handlePhoneChange}
                required
                disabled={loading}
                className={phoneError ? styles.inputError : ''}
              />
              {phoneError && <div className={styles.fieldError}>{phoneError}</div>}
              <div className={styles.inputHint}>Örnek: (05XX) XXX XX XX</div>
            </div>
            <button 
              type="submit" 
              className={styles.submitButton}
              disabled={loading || !!phoneError}
            >
              {loading ? 'Kaydediliyor...' : 'Kayıt Ol'}
            </button>
          </form>
          <div className={styles.linkContainer}>
            Zaten hesabınız var mı?{' '}
            <Link href="/login" legacyBehavior>
              <a className={styles.formLink}>Giriş Yap</a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Register;