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
  const [events, setEvents] = useState<Appointment[]>([]);
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
        const response = await fetch('https://form-builder-barber.onrender.com/appointments/user', {
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          const data = await response.json();
          const formattedEvents = data.appointments
            .filter((appointment: any) => !appointment.is_deleted)
            .map((appointment: any) => {
              // Format date and time for calendar
              const dateStr = appointment.appointment_date;
              const timeStr = appointment.appointment_time;
              
              const start = new Date(`${dateStr}T${timeStr}`);
              const end = new Date(start.getTime() + 30 * 60000); // 30 minutes later
              
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
  }, [router]);

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

  const [isDeleting, setIsDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const handleDeleteAppointment = async () => {
    if (!selectedEvent || !selectedEvent.id) {
      setDeleteError("Randevu bilgileri bulunamadı.");
      return;
    }

    setIsDeleting(true);
    setDeleteError(null);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        router.push('/login');
        return;
      }

      const response = await fetch(`https://form-builder-barber.onrender.com/appointments/delete/${selectedEvent.id}`, {
        method: 'DELETE',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        // Update our local events by marking this one as deleted
        // This approach avoids re-fetching all events from the server
        setEvents(events.map((event: any) => {
          if (event.id === selectedEvent.id) {
            return { ...event, is_deleted: true };
          }
          return event;
        }).filter((event: any) => !event.is_deleted));
        
        closeModal();
      } else {
        const errorData = await response.json();
        setDeleteError(errorData.message || "Randevu iptal edilemedi.");
      }
    } catch (error) {
      console.error('Error deleting appointment:', error);
      setDeleteError("Bir hata oluştu. Lütfen tekrar deneyin.");
    } finally {
      setIsDeleting(false);
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
          style={{ height: 'calc(100vh - 8rem)' }}
          onSelectEvent={handleEventClick}
          selectable={false} // Set to false to prevent creating new events
        />
      </main>
      <Modal
        isOpen={modalIsOpen}
        onRequestClose={closeModal}
        contentLabel="Appointment Details"
        ariaHideApp={false}
        className={styles.modalContent}
        overlayClassName={styles.modalOverlay}
      >
        {selectedEvent && (
          <div>
            <h2>Randevu Detayı</h2>
            <p><strong>İsim:</strong> {selectedEvent.name}</p>
            <p><strong>Danışman:</strong> {selectedEvent.barber}</p>
            <p><strong>Tarih:</strong> {selectedEvent.appointment_date}</p>
            <p><strong>Saat:</strong> {selectedEvent.appointment_time}</p>
            <p><strong>Telefon:</strong> {selectedEvent.phone}</p>
            
            {deleteError && (
              <div className={styles.errorMessage}>{deleteError}</div>
            )}
            
            <div className={styles.buttonGroup}>
              <button onClick={closeModal} className={styles.closeButton}>Kapat</button>
              <button 
                onClick={handleDeleteAppointment} 
                className={styles.deleteButton}
                disabled={isDeleting}
              >
                {isDeleting ? 'İptal Ediliyor...' : 'Randevu İptal Et'}
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;