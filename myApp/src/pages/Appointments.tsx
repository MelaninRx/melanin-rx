import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonItem,
  IonList,
  IonLabel,
  IonTextarea,
  IonSpinner,
  IonIcon,
} from "@ionic/react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, query, orderBy, getDocs, Timestamp } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useHistory } from "react-router-dom";
import './Appointments.css';
import SidebarNav from "../components/SidebarNav";
import MobileMenuButton from '../components/MobileMenuButton';
import ChatIcon from "../icons/Frame 110.svg";
import PeopleIcon from "../icons/Frame 111.svg";
import DocIcon from "../icons/Frame 113.svg";

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: "",
    time: "",
    location: "",
    provider: "",
    appointmentType: "",
    notes: ""
  });
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState("");
  const history = useHistory();
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (user) {
        setUserId(user.uid);
        fetchAppointments(user.uid);
      }
    });
    return () => unsubscribe();
  }, []);

  const fetchAppointments = async (uid: string) => {
    setLoading(true);
    try {
      const q = query(
        collection(db, "users", uid, "appointments"),
        orderBy("dateTime", "asc")
      );
      const querySnapshot = await getDocs(q);
      const appts = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setAppointments(appts);
    } catch (err) {
      setError("Failed to fetch appointments.");
    } finally {
      setLoading(false);
    }
  };

  const handleFormChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    setError("");
    if (!form.date || !form.time || !form.location || !form.provider) {
      setError("Please fill in all appointment details.");
      return;
    }
    setLoading(true);
    try {
      const dateTime = Timestamp.fromDate(new Date(`${form.date}T${form.time}`));
      await addDoc(collection(db, "users", userId, "appointments"), {
        dateTime,
        location: form.location,
        provider: form.provider,
        appointmentType: form.appointmentType,
        notes: [form.notes].filter(n => n.trim() !== ""),
      });
      setForm({ date: "", time: "", location: "", provider: "", appointmentType: "", notes: "" });
      fetchAppointments(userId);
    } catch (err) {
      setError("Failed to add appointment.");
    } finally {
      setLoading(false);
    }
  };

  const getMonthDays = (month: number, year: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOfWeek = (month: number, year: number) => {
    return new Date(year, month, 1).getDay();
  };

  const appointmentsByDate = appointments.reduce((acc, appt) => {
    const dateObj = appt.dateTime?.toDate?.();
    if (dateObj && dateObj.getMonth() === calendarMonth && dateObj.getFullYear() === calendarYear) {
      const day = dateObj.getDate();
      acc[day] = true;
    }
    return acc;
  }, {} as Record<number, boolean>);

  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                      'July', 'August', 'September', 'October', 'November', 'December'];

  return (
    <IonPage className="appointments-page">
      <IonContent fullscreen>
        <div className="appointments-main-layout">
          <MobileMenuButton />
          <SidebarNav onToggle={setSidebarExpanded} />

          <main className={`appointments-content ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
            <header className="appointments-header">
              <h1 className="page-title">Appointment Planner</h1>
              <p className="page-subtitle">Track and manage your upcoming healthcare appointments with ease</p>
            </header>

            <div className="appointments-layout">
              <div className="appointments-left-column">
                <section className="add-appointment-card">
                  <h2 className="section-title">Add a New Appointment</h2>
                  
                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Appointment Date</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M6.66667 1.66669V5.00002M13.3333 1.66669V5.00002M2.5 8.33335H17.5M4.16667 3.33335H15.8333C16.7538 3.33335 17.5 4.07955 17.5 5.00002V16.6667C17.5 17.5872 16.7538 18.3334 15.8333 18.3334H4.16667C3.24619 18.3334 2.5 17.5872 2.5 16.6667V5.00002C2.5 4.07955 3.24619 3.33335 4.16667 3.33335Z" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input 
                          type="date" 
                          className="form-input"
                          value={form.date} 
                          onChange={e => handleFormChange("date", e.target.value)}
                          placeholder="Month/Day/Year"
                        />
                      </div>
                    </div>

                    <div className="form-group">
                      <label className="form-label">Time</label>
                      <div className="input-with-icon">
                        <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M9.99984 5.00002V10L13.3332 11.6667M18.3332 10C18.3332 14.6024 14.6022 18.3334 9.99984 18.3334C5.39746 18.3334 1.6665 14.6024 1.6665 10C1.6665 5.39765 5.39746 1.66669 9.99984 1.66669C14.6022 1.66669 18.3332 5.39765 18.3332 10Z" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <input 
                          type="time" 
                          className="form-input"
                          value={form.time} 
                          onChange={e => handleFormChange("time", e.target.value)}
                          placeholder="Time"
                        />
                      </div>
                    </div>
                  </div>

                  <div className="form-grid">
                    <div className="form-group">
                      <label className="form-label">Healthcare Provider</label>
                      <input 
                        type="text" 
                        className="form-input"
                        value={form.provider} 
                        onChange={e => handleFormChange("provider", e.target.value)}
                        placeholder="Healthcare Provider Name"
                      />
                    </div>

                    
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Location</label>
                    <div className="input-with-icon">
                      <svg className="input-icon" width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M16.6668 8.33335C16.6668 12.4942 12.051 16.8275 10.501 18.1659C10.3566 18.2744 10.1808 18.3331 10.0002 18.3331C9.8195 18.3331 9.64373 18.2744 9.49933 18.1659C7.94933 16.8275 3.3335 12.4942 3.3335 8.33335C3.3335 6.56524 4.03588 4.86955 5.28612 3.61931C6.53636 2.36907 8.23205 1.66669 10.0002 1.66669C11.7683 1.66669 13.464 2.36907 14.7142 3.61931C15.9645 4.86955 16.6668 6.56524 16.6668 8.33335Z" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        <path d="M10.0002 10.8334C11.3809 10.8334 12.5002 9.71407 12.5002 8.33335C12.5002 6.95264 11.3809 5.83335 10.0002 5.83335C8.61945 5.83335 7.50016 6.95264 7.50016 8.33335C7.50016 9.71407 8.61945 10.8334 10.0002 10.8334Z" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                      <input 
                        type="text" 
                        className="form-input"
                        value={form.location} 
                        onChange={e => handleFormChange("location", e.target.value)}
                        placeholder="Enter Clinic or Hospital Address"
                      />
                    </div>
                  </div>

                  <div className="form-group form-group-full">
                    <label className="form-label">Notes/ Questions for Provider</label>
                    <textarea 
                      className="form-textarea"
                      value={form.notes} 
                      onChange={e => handleFormChange("notes", e.target.value)}
                      placeholder="Enter any symptoms, concerns , or questions you'd like to discuss at your appointment..."
                      rows={4}
                    />
                  </div>

                  {error && <p className="error-message">{error}</p>}

                  <button className="add-appointment-button" onClick={handleSubmit} disabled={loading}>
                    {loading ? 'Adding...' : 'Add Appointment'}
                  </button>
                </section>

                <section className="upcoming-appointments-card">
                  <div className="section-header">
                    <h2 className="section-title">Upcoming Appointments</h2>
                    <span className="scheduled-badge">{appointments.length} Scheduled</span>
                  </div>

                  <div className="appointments-list">
                    {appointments.length === 0 && <p className="no-appointments">No appointments found.</p>}
                    {appointments.slice(0, 3).map((appt, idx) => {
                      const dateObj = appt.dateTime?.toDate?.();
                      const monthShort = dateObj?.toLocaleDateString('en-US', { month: 'short' }).toUpperCase();
                      const day = dateObj?.getDate();
                      const time = dateObj?.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                      
                      return (
                        <div
                          className={`appointment-item ${idx === 0 ? 'appointment-item-featured' : ''}`}
                          key={appt.id}
                          onClick={() => history.push(`/appointments/${userId}/${appt.id}`)}
                        >
                          <div className="appointment-date-badge">
                            <div className="date-month">{monthShort}</div>
                            <div className="date-day">{day}</div>
                          </div>

                          <div className="appointment-details">
                            <h3 className="appointment-title">{appt.provider || 'Prenatal Check In'}</h3>
                            
                            <div className="appointment-meta-row">
                              <div className="appointment-meta-item">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M9.99984 4.99996V9.99996L13.3332 11.6666M18.3332 9.99996C18.3332 14.6023 14.6022 18.3333 9.99984 18.3333C5.39746 18.3333 1.6665 14.6023 1.6665 9.99996C1.6665 5.39759 5.39746 1.66663 9.99984 1.66663C14.6022 1.66663 18.3332 5.39759 18.3332 9.99996Z" stroke="url(#paint0_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <defs>
                                    <linearGradient id="paint0_linear" x1="9.99984" y1="1.66663" x2="9.99984" y2="18.3333" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#642D56"/>
                                      <stop offset="1" stopColor="#B1238D"/>
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <span>{time}</span>
                              </div>

                              <div className="appointment-meta-item">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M15.8332 17.5V15.8333C15.8332 14.9493 15.482 14.1014 14.8569 13.4763C14.2317 12.8512 13.3839 12.5 12.4998 12.5H7.49984C6.61578 12.5 5.76794 12.8512 5.14281 13.4763C4.51769 14.1014 4.1665 14.9493 4.1665 15.8333V17.5M13.3332 5.83333C13.3332 7.67428 11.8408 9.16667 9.99984 9.16667C8.15889 9.16667 6.6665 7.67428 6.6665 5.83333C6.6665 3.99238 8.15889 2.5 9.99984 2.5C11.8408 2.5 13.3332 3.99238 13.3332 5.83333Z" stroke="url(#paint1_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <defs>
                                    <linearGradient id="paint1_linear" x1="9.99984" y1="2.5" x2="9.99984" y2="17.5" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#642D56"/>
                                      <stop offset="1" stopColor="#B1238D"/>
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <span>{appt.provider || 'Dr. Williams'}</span>
                              </div>
                            </div>

                            <div className="appointment-meta-row">
                              <div className="appointment-meta-item">
                                <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                                  <path d="M16.6668 8.33329C16.6668 12.4941 12.051 16.8275 10.501 18.1658C10.3566 18.2744 10.1808 18.3331 10.0002 18.3331C9.8195 18.3331 9.64373 18.2744 9.49933 18.1658C7.94933 16.8275 3.3335 12.4941 3.3335 8.33329C3.3335 6.56518 4.03588 4.86949 5.28612 3.61925C6.53636 2.36901 8.23205 1.66663 10.0002 1.66663C11.7683 1.66663 13.464 2.36901 14.7142 3.61925C15.9645 4.86949 16.6668 6.56518 16.6668 8.33329Z" stroke="url(#paint2_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <path d="M10.0002 10.8333C11.3809 10.8333 12.5002 9.714 12.5002 8.33329C12.5002 6.95258 11.3809 5.83329 10.0002 5.83329C8.61945 5.83329 7.50016 6.95258 7.50016 8.33329C7.50016 9.714 8.61945 10.8333 10.0002 10.8333Z" stroke="url(#paint3_linear)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                                  <defs>
                                    <linearGradient id="paint2_linear" x1="10.0002" y1="1.66663" x2="10.0002" y2="18.3331" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#642D56"/>
                                      <stop offset="1" stopColor="#B1238D"/>
                                    </linearGradient>
                                    <linearGradient id="paint3_linear" x1="10.0002" y1="1.66663" x2="10.0002" y2="18.3331" gradientUnits="userSpaceOnUse">
                                      <stop stopColor="#642D56"/>
                                      <stop offset="1" stopColor="#B1238D"/>
                                    </linearGradient>
                                  </defs>
                                </svg>
                                <span>{appt.location}</span>
                              </div>
                            </div>

                            <div className="appointment-divider"></div>

                            <div className="appointment-notes-text">
                              <span className="notes-label">Notes:</span> {appt.notes?.[0] || 'No notes'}
                            </div>
                          </div>

                          <button className="appointment-menu-button">
                            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                              <path d="M12 13C12.5523 13 13 12.5523 13 12C13 11.4477 12.5523 11 12 11C11.4477 11 11 11.4477 11 12C11 12.5523 11.4477 13 12 13Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M19 13C19.5523 13 20 12.5523 20 12C20 11.4477 19.5523 11 19 11C18.4477 11 18 11.4477 18 12C18 12.5523 18.4477 13 19 13Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                              <path d="M5 13C5.55228 13 6 12.5523 6 12C6 11.4477 5.55228 11 5 11C4.44772 11 4 11.4477 4 12C4 12.5523 4.44772 13 5 13Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </section>
              </div>

              <div className="appointments-right-column">
                <section className="calendar-card">
                  <div className="calendar-header">
                    <button className="calendar-nav-button" onClick={() => {
                      if (calendarMonth === 0) {
                        setCalendarMonth(11);
                        setCalendarYear(calendarYear - 1);
                      } else {
                        setCalendarMonth(calendarMonth - 1);
                      }
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15 18L9 12L15 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                    <div className="calendar-month-year">{monthNames[calendarMonth]}</div>
                    <button className="calendar-nav-button" onClick={() => {
                      if (calendarMonth === 11) {
                        setCalendarMonth(0);
                        setCalendarYear(calendarYear + 1);
                      } else {
                        setCalendarMonth(calendarMonth + 1);
                      }
                    }}>
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M9 18L15 12L9 6" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </button>
                  </div>

                  <div className="calendar-divider"></div>

                  <div className="calendar-grid">
                    <div className="calendar-weekdays">
                      {['SUN', 'MON', 'TUE', 'WED', 'THU', 'FRI', 'SAT'].map(day => (
                        <div key={day} className="calendar-weekday">{day}</div>
                      ))}
                    </div>

                    <div className="calendar-dates">
                      {(() => {
                        const daysInMonth = getMonthDays(calendarMonth, calendarYear);
                        const firstDay = getFirstDayOfWeek(calendarMonth, calendarYear);
                        const dates = [];

                        for (let i = 0; i < firstDay; i++) {
                          dates.push(<div key={`empty-${i}`} className="calendar-date calendar-date-empty"></div>);
                        }

                        for (let day = 1; day <= daysInMonth; day++) {
                          const hasAppointment = appointmentsByDate[day];
                          dates.push(
                            <div key={day} className="calendar-date">
                              <span className="calendar-date-number">{day}</span>
                              {hasAppointment && <span className="calendar-date-dot"></span>}
                            </div>
                          );
                        }

                        return dates;
                      })()}
                    </div>
                  </div>
                </section>

                <section className="quick-actions-card">
                  <h2 className="section-title">Quick Actions</h2>
                  
                  <div className="quick-actions-list">
                    <a href="/chatbot" className="quick-action-item">
                      <div className="quick-action-icon">
                        <img src={ChatIcon} alt="Chat Bot" />
                      </div>
                      <div className="quick-action-content">
                        <h3 className="quick-action-title">Chat Bot</h3>
                        <p className="quick-action-description">Get personalized health insights and prepare for doctor visits</p>
                      </div>
                      <button className="quick-action-arrow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 7H17M17 7V17M17 7L7 17" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </a>

                    <a href="/resources" className="quick-action-item">
                      <div className="quick-action-icon">
                        <img src={DocIcon} alt="Health Resources" />
                      </div>
                      <div className="quick-action-content">
                        <h3 className="quick-action-title">Health Resources</h3>
                        <p className="quick-action-description">Access health resources to prepare for pregnancy</p>
                      </div>
                      <button className="quick-action-arrow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 7H17M17 7V17M17 7L7 17" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </a>

                    <a href="/community" className="quick-action-item">
                      <div className="quick-action-icon">
                        <img src={PeopleIcon} alt="Communities" />
                      </div>
                      <div className="quick-action-content">
                        <h3 className="quick-action-title">Communities</h3>
                        <p className="quick-action-description">Connect with other expectant mothers in your area/ same trimester</p>
                      </div>
                      <button className="quick-action-arrow">
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M7 7H17M17 7V17M17 7L7 17" stroke="#666666" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                      </button>
                    </a>
                  </div>
                </section>
              </div>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppointmentsPage;
