import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Login.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    try {
      // Check if username and password are provided
      if (!username.trim() || !password.trim()) {
        setError('Lütfen kullanıcı adı ve şifre giriniz');
        return;
      }

      // Make API request to your backend
      const response = await fetch('https://form-builder-barber.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      const data = await response.json();

      // Check if login was successful
      if (!response.ok) {
        throw new Error(data.message || 'Giriş başarısız');
      }

      // Store the token in localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('username', data.username);

      // Redirect to dashboard
      router.push('/dashboard');
    } catch (err) {
      console.error('Login error:', err);
      setError(err instanceof Error ? err.message : 'Giriş başarısız. Lütfen kullanıcı adı ve şifrenizi kontrol edin.');
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
            <a className={`${styles.navButton} ${styles.activeNavButton}`}>Giriş Yap</a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className={styles.navButton}>Kayıt Ol</a>
          </Link>
        </nav>
      </header>

      <main className={styles.mainContent}>
        <div className={styles.formContainer}>
          <h1 className={styles.formTitle}>Giriş Yap</h1>
          {error && <div className={styles.error}>{error}</div>}
          <form className={styles.form} onSubmit={handleSubmit}>
            <div className={styles.inputGroup}>
              <label htmlFor="username">Kullanıcı Adı</label>
              <input
                type="text"
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
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
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Giriş Yap
            </button>
          </form>
          <div className={styles.linkContainer}>
            Hesabınız yok mu?{' '}
            <Link href="/register" legacyBehavior>
              <a className={styles.formLink}>Kayıt Ol</a>
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default Login;