import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import styles from '../styles/Dashboard.module.css';

// Define the form type
interface FormLink {
  id: string;
  url: string;
  url_extension: string;
}

const Form: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [names, setNames] = useState(['']);
  const [days, setDays] = useState('');
  const [startTime, setStartTime] = useState('09:00');
  const [endTime, setEndTime] = useState('18:00');
  const [linkExtension, setLinkExtension] = useState('');
  const [username, setUsername] = useState('defaultUser');
  const [formLink, setFormLink] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [userForms, setUserForms] = useState<FormLink[]>([]);
  const [isDeleting, setIsDeleting] = useState<{[key: string]: boolean}>({});
  const [nonWorkingDays, setNonWorkingDays] = useState<string[]>([]);
  const router = useRouter();

  // Fetch username and user forms on component mount
  useEffect(() => {
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
      fetchUserForms(); // Fetch forms when username is available
    } else {
      // Redirect to login if no username is found
      router.push('/login');
    }
  }, [router]);

  // Fetch all forms created by the user
  const fetchUserForms = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum süresi doldu, lütfen tekrar giriş yapın');
        router.push('/login');
        return;
      }

      const response = await fetch('https://form-builder-barber.onrender.com/forms/user-forms', {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }

      const data = await response.json();
      setUserForms(data.form_links || []);
    } catch (error) {
      console.error('Failed to fetch user forms:', error);
    }
  };

  // Delete a form
  const deleteForm = async (formId: string) => {
    try {
      // Set the specific form to deleting state
      setIsDeleting(prev => ({ ...prev, [formId]: true }));
      
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum süresi doldu, lütfen tekrar giriş yapın');
        router.push('/login');
        return;
      }

      const response = await fetch(`https://form-builder-barber.onrender.com/forms/delete/${formId}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || `Error: ${response.status}`);
      }

      // Remove the deleted form from state
      setUserForms(forms => forms.filter(form => form.id !== formId));
      
    } catch (error) {
      console.error('Failed to delete form:', error);
      setError(error instanceof Error ? error.message : 'Form silinemedi. Bir hata oluştu.');
    } finally {
      // Reset the deleting state for this form
      setIsDeleting(prev => ({ ...prev, [formId]: false }));
    }
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
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

  const toggleNonWorkingDay = (day: string) => {
    if (nonWorkingDays.includes(day)) {
      setNonWorkingDays(nonWorkingDays.filter(d => d !== day));
    } else {
      setNonWorkingDays([...nonWorkingDays, day]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    // Filter out empty names
    const filteredNames = names.filter(name => name.trim() !== '');
    if (filteredNames.length === 0) {
      setError('En az bir isim girilmelidir');
      setIsLoading(false);
      return;
    }
    
    if (!days || parseInt(days, 10) <= 0) {
      setError('Geçerli bir gün sayısı girilmelidir');
      setIsLoading(false);
      return;
    }
    
    const preferences = filteredNames.join(', ');
    const url_extension = linkExtension || username; // Use linkExtension if provided, otherwise use username
    
    const payload = {
      username,
      preferences,
      days: parseInt(days, 10),
      interval: 2,
      start_time: startTime,
      end_time: endTime,
      url_extension,
      barber_id: 13,
      non_working_days: nonWorkingDays.join(',')
    };

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Oturum süresi doldu, lütfen tekrar giriş yapın');
        router.push('/login');
        return;
      }

      const response = await fetch('https://form-builder-barber.onrender.com/forms/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      const data = await response.json();

      if (response.ok) {
        console.log('Form submitted successfully');
        setFormLink(data.url);
        // Refresh the list of user forms after creating a new one
        fetchUserForms();
        // Clear the form fields
        setNames(['']);
        setDays('');
        setLinkExtension('');
      } else {
        setError(data.message || 'Form oluşturulurken bir hata oluştu');
        console.error('Form submission failed', data);
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      setError('Bir bağlantı hatası oluştu. Lütfen internet bağlantınızı kontrol edin.');
    } finally {
      setIsLoading(false);
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
        {error && <div className={styles.error}>{error}</div>}
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
                  placeholder="Örn: Ahmet, Mehmet, Ali"
                />
                {names.length > 1 && (
                  <button type="button" onClick={() => handleRemoveName(index)} className={styles.removeButton}>-</button>
                )}
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
              min="1"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.formGroup}>
            <label>Her gün için başlangıç ve bitiş çalışma saatleri nelerdir?</label>
            <div className={styles.timeInputs}>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className={styles.input}
                required
              />
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className={styles.input}
                required
              />
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Çalışılmayan günleri seçin:</label>
            <div className={styles.daysSelector}>
              {[
                'Pazartesi',
                'Salı', 
                'Çarşamba', 
                'Perşembe', 
                'Cuma', 
                'Cumartesi', 
                'Pazar'
              ].map(day => (
                <div key={day} className={styles.dayOption}>
                  <input
                    type="checkbox"
                    id={`day-${day}`}
                    checked={nonWorkingDays.includes(day)}
                    onChange={() => toggleNonWorkingDay(day)}
                    className={styles.dayCheckbox}
                  />
                  <label htmlFor={`day-${day}`}>{day}</label>
                </div>
              ))}
            </div>
          </div>
          <div className={styles.formGroup}>
            <label>Randevu linkinizin uzantısını giriniz. (Örneğin, BerberAli için linkiniz "www.randevuformu.com/berberali" olacaktır.)</label>
            <input
              type="text"
              value={linkExtension}
              onChange={(e) => setLinkExtension(e.target.value.replace(/[^a-zA-Z0-9_-]/g, ''))}
              className={styles.input}
              placeholder={username}
            />
            <small className={styles.hint}>Sadece harf, rakam, tire (-) ve alt çizgi (_) kullanabilirsiniz.</small>
          </div>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isLoading}
          >
            {isLoading ? 'Oluşturuluyor...' : 'Form Oluştur'}
          </button>
        </form>
        
        {formLink && (
          <div className={styles.formLinkContainer}>
            <h3>Yeni oluşturulan randevu formu linkiniz:</h3>
            <div className={styles.linkDisplay}>
              <a href={formLink} target="_blank" rel="noopener noreferrer" className={styles.formLink}>
                {formLink}
              </a>
            </div>
          </div>
        )}
        
        {userForms.length > 0 && (
          <div className={styles.userFormsContainer}>
            <h3>Tüm Randevu Formlarınız:</h3>
            <div className={styles.formsList}>
              {userForms.map((form) => (
                <div key={form.id} className={styles.formLinkItem}>
                  <div className={styles.formItemContent}>
                    <a 
                      href={form.url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className={styles.formLink}
                    >
                      {form.url}
                    </a>
                    <button 
                      type="button" 
                      className={styles.deleteButton}
                      onClick={() => {
                        if (window.confirm(`Bu formu silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.`)) {
                          deleteForm(form.id);
                        }
                      }}
                      disabled={isDeleting[form.id]}
                    >
                      {isDeleting[form.id] ? '...' : '✕'}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default Form;