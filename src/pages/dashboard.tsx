import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        console.log('Fetching appointments with token:', token);
        const response = await fetch('https://form-builder-barber.onrender.com/dashboard/upcoming', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          }
        });

        console.log('Response status:', response.status);
        if (response.ok) {
          const data = await response.json();
          console.log('Fetched appointments:', data);
          const formattedEvents = data.map((appointment: any) => ({
            title: `${appointment.name} - ${appointment.barber}`,
            start: new Date(`${appointment.appointment_date}T${appointment.appointment_time}`),
            end: new Date(`${appointment.appointment_date}T${appointment.appointment_time}`),
          }));
          setEvents(formattedEvents);
        } else {
          console.error('Failed to fetch appointments');
        }
      } catch (error) {
        console.error('Error fetching appointments:', error);
      }
    };

    fetchAppointments();
  }, []);

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
    localStorage.removeItem('token');
    localStorage.removeItem('username');
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