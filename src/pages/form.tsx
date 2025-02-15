import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';

const Form: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [names, setNames] = useState(['']);
  const [days, setDays] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [username, setUsername] = useState('defaultUser');
  const router = useRouter();

  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    router.push('/login');
  };

  const handleAddName = () => {
    setNames([...names, '']);
  };

  const handleRemoveName = (index: number) => {
    const newNames = names.filter((_, i) => i !== index);
    setNames(newNames);
  };

  const handleNameChange = (index: number, value: string) => {
    const newNames = [...names];
    newNames[index] = value;
    setNames(newNames);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const preferences = names.join(', ');
    const payload = {
      username,
      preferences,
      days: parseInt(days, 10),
      interval: 2,
      start_time: startTime,
      end_time: endTime,
      barber_id: 13
    };

    console.log('Submitting form with payload:', payload);

    try {
      const response = await fetch('https://form-builder-barber.onrender.com/forms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        console.log('Form submitted successfully');
        // Handle successful form submission
      } else {
        console.error('Form submission failed');
        // Handle form submission failure
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      // Handle error
    }
  };

  return (
    <div className={styles.container}>
      <aside className={`${styles.sidebar} ${isSidebarOpen ? styles.open : ''}`}>
        <div className={styles.closeIcon} onClick={toggleSidebar}>&times;</div>
        <h2 className={styles.logo}>Randevu Yönetim</h2>
        <nav className={styles.nav}>
          <Link href="/dashboard" legacyBehavior>
            <a className={styles.navLink}>Takvim</a>
          </Link>
          <Link href="/form" legacyBehavior>
            <a className={styles.navLink}>Form Oluştur</a>
          </Link>
          <a className={styles.navLink} onClick={handleLogout}>Çıkış yap</a>
        </nav>
      </aside>
      <div className={styles.hamburger} onClick={toggleSidebar}>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
        <div className={styles.bar}></div>
      </div>
      <main className={styles.mainContent}>
        <h2>Form Oluştur</h2>
        <form onSubmit={handleSubmit}>
          <div className={styles.formGroup}>
            <label>İşletmenizde randevu oluşturulabilen kişilerin isimlerini giriniz.</label>
            {names.map((name, index) => (
              <div key={index} className={styles.inputGroup}>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => handleNameChange(index, e.target.value)}
                  className={styles.input}
                />
                <button type="button" onClick={() => handleRemoveName(index)} className={styles.removeButton}>-</button>
              </div>
            ))}
            <button type="button" onClick={handleAddName} className={styles.addButton}>+</button>
          </div>
          <div className={styles.formGroup}>
            <label>Randevu alma aralığınız kaç gün? (Örnek: 2 için müşterileriniz tarafından bugün ve yarın randevu alınabilecek.)</label>
            <input
              type="number"
              value={days}
              onChange={(e) => setDays(e.target.value)}
              max="15"
              className={styles.input}
            />
          </div>
          <div className={styles.formGroup}>
            <label>Her gün için başlangıç ve bitiş çalışma saatleri nelerdir?</label>
            <input
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
              className={styles.input}
            />
            <input
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
              className={styles.input}
            />
          </div>
          <button type="submit" className={styles.submitButton}>Submit</button>
        </form>
      </main>
    </div>
  );
};

export default Form;