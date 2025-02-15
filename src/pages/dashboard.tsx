import React, { useState } from 'react';
import Link from 'next/link';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr'; // Import Turkish locale
import 'react-big-calendar/lib/css/react-big-calendar.css';
import router, { useRouter } from 'next/router';

import CustomToolbar from '../components/CustomToolbar';
import styles from '../styles/Dashboard.module.css';

moment.locale('tr'); // Set moment locale to Turkish
const localizer = momentLocalizer(moment);

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  const handleNext = () => {
    setDate(moment(date).add(1, view === 'day' ? 'days' : 'weeks').toDate());
  };

  const handlePrev = () => {
    setDate(moment(date).subtract(1, view === 'day' ? 'days' : 'weeks').toDate());
  };

  const handleToday = () => {
    setDate(new Date());
  };
  const handleLogout = () => {
    // Perform any logout logic here if needed
    router.push('/login');
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
            <a className={styles.navLink}>Form Creation</a>
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
        <h2>Takvim</h2>
        <Calendar
          localizer={localizer}
          events={events}
          startAccessor="start"
          endAccessor="end"
          defaultView={'day'}
          views={['day', 'week']}
          step={30}
          timeslots={2}
          min={new Date(1970, 1, 1, 8, 0, 0)}
          max={new Date(1970, 1, 1, 17, 0, 0)}
          date={date}
          onNavigate={setDate}
          components={{
            toolbar: CustomToolbar
          }}
          style={{ height: '100%' }}
        />
      </main>
    </div>
  );
};

export default Dashboard;