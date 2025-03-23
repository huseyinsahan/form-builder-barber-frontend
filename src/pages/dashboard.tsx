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
  const [preferences, setPreferences] = useState<string[]>([]);
  
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
              // Use start and end times directly from the database
              const start = new Date(`${appointment.appointment_date}T${appointment.appointment_time}`);
              const end = new Date(`${appointment.appointment_date}T${appointment.appointment_time_end}`);
              
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

  useEffect(() => {
    fetchFormDetails();
  }, []);

  const fetchFormDetails = async () => {
    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token || !username) return;
  
    try {
      const response = await fetch('https://form-builder-barber.onrender.com/forms/get/abb', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
  
      if (response.ok) {
        const formData = await response.json();
        // Process preferences if they're comma-separated
        const prefsArray = Array.isArray(formData.preferences) 
          ? formData.preferences 
          : formData.preferences.split(',').map((p: string) => p.trim());
        setPreferences(prefsArray);
      }
    } catch (error) {
      console.error('Error fetching form details:', error);
    }
  };

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

  const handleSelectSlot = (slotInfo: { start: Date; end: Date }) => {
    setSelectedEvent({
      start: slotInfo.start,
      end: slotInfo.end,
      name: '',
      barber: '',
      phone: '',
      appointment_date: moment(slotInfo.start).format('YYYY-MM-DD'),
      appointment_time: moment(slotInfo.start).format('HH:mm'),
      appointment_time_end: moment(slotInfo.end).format('HH:mm'),
    });
    setModalIsOpen(true);
  };

  const handleCreateAppointment = async () => {
    if (!selectedEvent) return;

    const token = localStorage.getItem('token');
    const username = localStorage.getItem('username');
    
    if (!token || !username) {
      router.push('/login');
      return;
    }
  
    try {
      const response = await fetch('https://form-builder-barber.onrender.com/appointments/book/abb', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: selectedEvent.name,
          barber: selectedEvent.barber,
          phone: selectedEvent.phone,
          appointment_date: selectedEvent.appointment_date,
          appointment_time: selectedEvent.appointment_time,
          appointment_time_end: selectedEvent.appointment_time_end,
          preferences: selectedEvent.barber // Add this line to match backend expectations
        }),
      });
  
      if (response.ok) {
        const newAppointment = await response.json();
        setEvents(prevEvents => [...prevEvents, {
          ...newAppointment.appointment,
          title: `${newAppointment.appointment.name} - ${newAppointment.appointment.barber}`,
          start: new Date(`${newAppointment.appointment.appointment_date}T${newAppointment.appointment.appointment_time}`),
          end: new Date(`${newAppointment.appointment.appointment_date}T${newAppointment.appointment.appointment_time_end}`),
        }]);
        closeModal();
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Randevu oluşturulamadı');
      }
    } catch (error) {
      console.error('Error creating appointment:', error);
      alert('Bir hata oluştu. Lütfen tekrar deneyin.');
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
          max={new Date(1970, 1, 1, 20, 0, 0)}
          date={date}
          onNavigate={setDate}
          components={{
            toolbar: CustomToolbar
          }}
          style={{ height: 'calc(100vh - 8rem)' }}
          onSelectEvent={handleEventClick}
          onSelectSlot={handleSelectSlot} // Add this line
          selectable={true} // Enable slot selection
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
            <div className={styles.modalHeader}>
              <h2>{selectedEvent.id ? 'Randevu Detayı' : 'Yeni Randevu Oluştur'}</h2>
            </div>
            <div className={styles.formGroup}>
              <p><strong>Tarih:</strong> {moment(selectedEvent.appointment_date).format('DD MMMM YYYY')}</p>
              <p><strong>Başlangıç Saati:</strong> {moment(selectedEvent.appointment_time, 'HH:mm').format('HH:mm')}</p>
              <p><strong>Bitiş Saati:</strong> {moment(selectedEvent.appointment_time_end, 'HH:mm').format('HH:mm')}</p>
            </div>

            {/* Show details for both new and existing appointments */}
            <div className={styles.formGroup}>
              <label>İsim:</label>
              <input
                type="text"
                value={selectedEvent.name}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, name: e.target.value })}
                placeholder="Müşteri adı"
                readOnly={!!selectedEvent.id} // Make readonly if it's an existing appointment
                className={selectedEvent.id ? styles.readOnlyInput : ''}
              />
            </div>
            <div className={styles.formGroup}>
              <label>Danışman:</label>
              <select
                value={selectedEvent.barber}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, barber: e.target.value })}
                disabled={!!selectedEvent.id}
                className={selectedEvent.id ? styles.readOnlyInput : ''}
              >
                <option value="">Danışman Seçin</option>
                {preferences.map((barber) => (
                  <option key={barber} value={barber}>
                    {barber}
                  </option>
                ))}
              </select>
            </div>
            <div className={styles.formGroup}>
              <label>Telefon:</label>
              <input
                type="tel"
                value={selectedEvent.phone}
                onChange={(e) => setSelectedEvent({ ...selectedEvent, phone: e.target.value })}
                placeholder="05XX XXX XX XX"
                readOnly={!!selectedEvent.id}
                className={selectedEvent.id ? styles.readOnlyInput : ''}
              />
            </div>
            {deleteError && <div className={styles.errorMessage}>{deleteError}</div>}
            <div className={styles.buttonGroup}>
              <button onClick={closeModal} className={styles.closeButton}>Kapat</button>
              {!selectedEvent.id && (
                <button 
                  onClick={handleCreateAppointment} 
                  className={styles.createButton}
                  disabled={!selectedEvent.name || !selectedEvent.barber || !selectedEvent.phone}
                >
                  Randevu Oluştur
                </button>
              )}
              {selectedEvent.id && (
                <button
                  onClick={handleDeleteAppointment}
                  className={styles.deleteButton}
                  disabled={isDeleting}
                >
                  {isDeleting ? 'İptal Ediliyor...' : 'Randevu İptal Et'}
                </button>
              )}
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default Dashboard;