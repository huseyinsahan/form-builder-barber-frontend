import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'moment/locale/tr'; // Import Turkish locale
import 'react-big-calendar/lib/css/react-big-calendar.css';
import router, { useRouter } from 'next/router';
import Modal from 'react-modal';

import CustomToolbar from '../components/CustomToolbar';
import styles from '../styles/Dashboard.module.css';

moment.locale('tr'); // Set moment locale to Turkish
const localizer = momentLocalizer(moment);

const Dashboard: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [events, setEvents] = useState([]);
  const [view, setView] = useState('week');
  const [date, setDate] = useState(new Date());
  
  interface Appointment {
    name: string;
    barber: string;
    appointment_date: string;
    appointment_time: string;
    phone: string;
    [key: string]: any; // Add this line to include any other properties
  }

  const [selectedEvent, setSelectedEvent] = useState<Appointment | null>(null);
  const [modalIsOpen, setModalIsOpen] = useState(false);

  useEffect(() => {
    const fetchAppointments = async () => {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      try {
        console.log('Fetching appointments with token:', token);
        const response = await fetch('https://form-builder-barber.onrender.com/dashboard/appointments', {
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
          const formattedEvents = data.appointments.map((appointment: any) => {
            const start = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
            const end = new Date(start.getTime() + 30 * 60000); // Add 30 minutes to start time
            return {
              title: `${appointment.name} - ${appointment.barber}`,
              start,
              end,
              ...appointment // Include all appointment details
            };
          });
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

  const handleEventClick = (event: any) => {
    setSelectedEvent(event);
    setModalIsOpen(true);
  };

  const closeModal = () => {
    setModalIsOpen(false);
    setSelectedEvent(null);
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
          onSelectEvent={handleEventClick}
        />
      </main>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Appointment Details"
        ariaHideApp={false}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        {selectedEvent && (
          <div>
            <h2>Randevu Detayı</h2>
            <p><strong>İsim:</strong> {selectedEvent.name}</p>
            <p><strong>Danışman:</strong> {selectedEvent.barber}</p>
            <p><strong>Tarih:</strong> {selectedEvent.appointment_date}</p>
            <p><strong>Saat:</strong> {selectedEvent.appointment_time}</p>
            <p><strong>Telefon:</strong> {selectedEvent.phone}</p>
            <button onClick={closeModal}>Kapat</button>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;