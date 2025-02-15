import React, { useState } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import styles from '../styles/Login.module.css';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch('https://form-builder-barber.onrender.com/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ username, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
      }

      const { token } = data;
      // Store token and username in localStorage
      localStorage.setItem('token', token);
      localStorage.setItem('username', username);
      // Redirect to dashboard or another page
      router.push('/dashboard');
    } catch (error: any) {
      setError(error.message || 'Giriş başarısız. Lütfen bilgilerinizi kontrol edin.');
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.topLine}></div>
      <header className={styles.header}>
        <div className={styles.logo}>Randevu Yönetim</div>
        <nav className={styles.nav}>
          <Link href="/" legacyBehavior>
            <a className={styles.navButton}>Ana Sayfa</a>
          </Link>
          <Link href="/register" legacyBehavior>
            <a className={styles.navButton}>Kayıt Ol</a>
          </Link>
        </nav>
      </header>
      <main className={styles.mainContent}>
        <div className={styles.formContainer}>
          <h2>Giriş Yap</h2>
          {error && <div className={styles.error}>{error}</div>}
          <form onSubmit={handleSubmit} className={styles.form}>
            <div className={styles.inputGroup}>
              <label>Kullanıcı Adı</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                required
              />
            </div>
            <div className={styles.inputGroup}>
              <label>Şifre</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <button type="submit" className={styles.submitButton}>
              Giriş Yap
            </button>
          </form>
        </div>
      </main>
      <div className={styles.dynamicShape}></div>
    </div>
  );
};

export default Login;