import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import styles from '../styles/Form.module.css';
import { GetServerSideProps } from 'next';

// Type definitions
interface FormData {
  id: string;
  username: string;
  preferences: string[];
}

interface AvailableSlots {
  [date: string]: string[];
}

interface AppointmentFormProps {
  initialFormData?: FormData | null;
}

interface ConfirmationMessage {
  text: string;
  type: 'success' | 'error' | '';
}

export default function AppointmentForm({ initialFormData }: AppointmentFormProps) {
  const router = useRouter();
  const { formId } = router.query;
  
  const [form, setForm] = useState<FormData | null>(initialFormData || null);
  const [loading, setLoading] = useState<boolean>(!initialFormData);
  const [loadingSlots, setLoadingSlots] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [selectedBarber, setSelectedBarber] = useState<string>('');
  const [availableSlots, setAvailableSlots] = useState<AvailableSlots>({});
  const [appointmentDate, setAppointmentDate] = useState<string>('');
  const [appointmentTime, setAppointmentTime] = useState<string>('');
  const [confirmationMessage, setConfirmationMessage] = useState<ConfirmationMessage>({ text: '', type: '' });
  
  // API URL - use Render service URL directly
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://form-builder-barber.onrender.com';
  
  // Fetch form data when formId is available
  useEffect(() => {
    if (!formId || initialFormData) return;
    
    const fetchFormData = async (): Promise<void> => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}/forms/get/${formId}`);
        
        if (!response.ok) {
          throw new Error('Form not found');
        }
        
        const data: FormData = await response.json();
        
        // Ensure preferences is an array
        if (!Array.isArray(data.preferences)) {
          data.preferences = [];
        }
        
        setForm(data);
        
        // Auto-select first barber if available
        if (data.preferences && data.preferences.length > 0) {
          setSelectedBarber(data.preferences[0]);
        }
        
      } catch (error) {
        console.error('Error loading form:', error);
        setError('Form could not be loaded');
      } finally {
        setLoading(false);
      }
    };
    
    fetchFormData();
  }, [formId, initialFormData, API_URL]);
  
  // Fetch available slots when barber is selected
  useEffect(() => {
    if (!formId || !selectedBarber || !form) return;
    
    const fetchAvailableSlots = async (): Promise<void> => {
      try {
        setLoadingSlots(true);
        const response = await fetch(
          `${API_URL}/forms/available_slots?form_id=${form.id}&barber=${selectedBarber}`
        );
        
        if (!response.ok) {
          throw new Error('Could not load available slots');
        }
        
        const slots: AvailableSlots = await response.json();
        setAvailableSlots(slots);
      } catch (error) {
        console.error('Error loading slots:', error);
        setConfirmationMessage({
          text: 'Failed to load available slots',
          type: 'error'
        });
      } finally {
        setLoadingSlots(false);
      }
    };
    
    fetchAvailableSlots();
  }, [formId, selectedBarber, form, API_URL]);
  
  // Format date (YYYY-MM-DD to DD.MM.YYYY)
  const formatDate = (dateStr: string): string => {
    if (!dateStr) return '';
    const [year, month, day] = dateStr.split('-');
    return `${day}.${month}.${year}`;
  };
  
  // Get Turkish day name
  const getTurkishDayName = (dateStr: string): string => {
    if (!dateStr) return '';
    
    const days: Record<number, string> = {
      0: 'Pazar',
      1: 'Pazartesi',
      2: 'Salı',
      3: 'Çarşamba',
      4: 'Perşembe',
      5: 'Cuma',
      6: 'Cumartesi'
    };
    
    try {
      const [year, month, day] = dateStr.split('-');
      const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
      return days[date.getDay()];
    } catch (e) {
      return '';
    }
  };
  
  // Handle slot selection
  const selectSlot = (date: string, time: string): void => {
    setAppointmentDate(date);
    setAppointmentTime(time);
  };
  
  // Handle form submission
  const submitForm = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault();
    
    // Validate phone number
    const phoneDigits = phone.replace(/\D/g, '');
    
    if (!name.trim()) {
      setConfirmationMessage({
        text: 'Lütfen isim giriniz',
        type: 'error'
      });
      return;
    }
    
    if (phoneDigits.length !== 11) {
      setConfirmationMessage({
        text: 'Telefon numarası 11 haneli olmalıdır',
        type: 'error'
      });
      return;
    }
    
    if (!phoneDigits.startsWith('05')) {
      setConfirmationMessage({
        text: 'Telefon numarası 05 ile başlamalıdır',
        type: 'error'
      });
      return;
    }
    
    if (!appointmentDate || !appointmentTime) {
      setConfirmationMessage({
        text: 'Lütfen bir randevu saati seçin',
        type: 'error'
      });
      return;
    }
    
    const formData = {
      name,
      phone: phoneDigits,
      preferences: selectedBarber,
      appointment_date: appointmentDate,
      appointment_time: appointmentTime,
      form_id: form?.id
    };
    
    // Add a confirmation dialog in Turkish
    if (!confirm(`${formatDate(formData.appointment_date)} tarihinde saat ${formData.appointment_time} için randevu onaylanacak. Onaylıyor musunuz?`)) {
      return;
    }
    
    try {
      setLoading(true);
      const response = await fetch(`${API_URL}/appointments/book/${formId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.message || 'Randevu alınamadı');
      }
      
      setConfirmationMessage({
        text: `${formatDate(formData.appointment_date)} tarihinde saat ${formData.appointment_time} için randevunuz onaylandı.`,
        type: 'success'
      });
      
      // Reset form
      setName('');
      setPhone('');
      setAppointmentDate('');
      setAppointmentTime('');
      
      // Reload the page after 3 seconds
      setTimeout(() => {
        router.reload();
      }, 3000);
    } catch (error) {
      setConfirmationMessage({
        text: (error as Error).message,
        type: 'error'
      });
    } finally {
      setLoading(false);
    }
  };
  
  // Format phone input
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    // Allow only digits, spaces, and parentheses
    const value = e.target.value.replace(/[^\d\s()]/g, '');
    setPhone(value);
  };
  
  if (loading && !form) return (
    <div className={styles.container}>
      <div className={styles.loading}>
        <div className={styles.loadingSpinner}></div>
        <p>Yükleniyor...</p>
      </div>
    </div>
  );
  
  if (error) return (
    <div className={styles.container}>
      <div className={styles.error}>{error}</div>
    </div>
  );
  
  if (!form) return null;
  
  return (
    <div className={styles.container}>
      <Head>
        <title>Randevu Al - {form.username}</title>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </Head>
      
      <div className={styles.formContainer}>
        <h1>{form.username} ile Randevu Al</h1>
        
        <form onSubmit={submitForm}>
          <div className={styles.formSection}>
            <label htmlFor="name">İsim:</label>
            <input 
              type="text" 
              id="name" 
              value={name}
              onChange={(e) => setName(e.target.value)}
              required 
            />
          </div>
          
          <div className={styles.formSection}>
            <label htmlFor="phone">Telefon:</label>
            <input 
              type="tel" 
              id="phone" 
              value={phone}
              onChange={handlePhoneChange}
              placeholder="(05XX) XXX XX XX" 
              required 
            />
            <div className={styles.inputHint}>Örnek: 05XX XXX XX XX</div>
          </div>
          
          {form.preferences && form.preferences.length > 0 && (
            <div className={styles.formSection}>
              <label htmlFor="preferences">Berber Seçin:</label>
              <select 
                id="preferences" 
                value={selectedBarber}
                onChange={(e) => setSelectedBarber(e.target.value)}
                required
              >
                {form.preferences.map((barber) => (
                  <option key={barber} value={barber}>{barber}</option>
                ))}
              </select>
            </div>
          )}
          
          <div className={styles.formSection}>
            <label>Tarih ve Saat Seçin:</label>
            
            {loadingSlots ? (
              <div className={styles.loading}>
                <div className={styles.loadingSpinner}></div>
                <p>Müsait randevu saatleri yükleniyor...</p>
              </div>
            ) : (
              <div className={styles.slots}>
                {Object.entries(availableSlots).map(([date, slots]) => (
                  <div key={date} className={styles.dateSection}>
                    <strong>
                      {formatDate(date)} - {getTurkishDayName(date)}
                    </strong>
                    <div className={styles.slotsContainer}>
                      {slots.map((slot) => (
                        <span 
                          key={`${date}-${slot}`}
                          className={`
                            ${styles.slot} 
                            ${appointmentDate === date && appointmentTime === slot ? styles.active : ''}
                          `}
                          onClick={() => selectSlot(date, slot)}
                        >
                          {slot}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={loading}
          >
            {loading ? 'Randevu Alınıyor...' : 'Randevu Al'}
          </button>
        </form>
        
        {confirmationMessage.text && (
          <div className={`${styles.confirmationMessage} ${styles[confirmationMessage.type]}`}>
            {confirmationMessage.text}
          </div>
        )}
      </div>
    </div>
  );
}

// Server-side rendering for better SEO and performance
export const getServerSideProps: GetServerSideProps = async (context) => {
  const { formId } = context.params as { formId: string };
  const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://form-builder-barber.onrender.com';
  
  try {
    const response = await fetch(`${API_URL}/forms/get/${formId}`);
    
    if (!response.ok) {
      return {
        notFound: true,
      };
    }
    
    const formData = await response.json();
    
    // Ensure preferences is an array
    if (!Array.isArray(formData.preferences)) {
      formData.preferences = [];
    }
    
    return {
      props: {
        initialFormData: formData,
      },
    };
  } catch (error) {
    console.error('Error fetching form data:', error);
    return {
      notFound: true,
    };
  }
};