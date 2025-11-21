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
import CalendarIcon from "../icons/calendar-days.svg";
import homeIcon from '../icons/house.svg';
import addIcon from '../icons/Vector.svg';
import menuIcon from '../icons/menu.svg';
import chatbotIcon from '../icons/message-square.svg';
import communityIcon from '../icons/users.svg';
import timelineIcon from '../icons/calendar-days.svg';
import AppointmentIcon from '../icons/Frame 112.svg';
import LogoutIcon from "../icons/log-out.svg";
import settingsIcon from '../icons/settings.svg';
import profileIcon from '../icons/circle-user-round.svg';
import { logoutUser } from '../services/authService';
import './Appointments.css';

const AppointmentsPage: React.FC = () => {
  const [appointments, setAppointments] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    date: "",
    time: "",
    location: "",
    provider: "",
    notes: [""]
  });
  const [userId, setUserId] = useState<string>("");
  const [error, setError] = useState("");
  const history = useHistory();
  const [calendarMonth, setCalendarMonth] = useState(new Date().getMonth());
  const [calendarYear, setCalendarYear] = useState(new Date().getFullYear());
  const [formExpanded, setFormExpanded] = useState(false);

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

  const handleNoteChange = (idx: number, value: string) => {
    const newNotes = [...form.notes];
    newNotes[idx] = value;
    setForm(prev => ({ ...prev, notes: newNotes }));
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
        notes: form.notes.filter(n => n.trim() !== ""),
      });
      setForm({ date: "", time: "", location: "", provider: "", notes: [""] });
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

  return (
    <IonPage className="appointments-page">
      <IonContent fullscreen>
        <div className="appointments-main-layout">
          <aside className="side-panel">
            <div className="nav-top">
              <IonButton fill="clear" routerLink="/menu">
                <IonIcon icon={menuIcon} />
                <span className="menu-text">Menu</span>
              </IonButton>
              <IonButton fill="clear" routerLink="/home">
                <IonIcon icon={homeIcon} />
                <span className="menu-text">Home</span>
              </IonButton>
              <IonButton fill="clear" routerLink="/add">
                <IonIcon icon={addIcon} />
                <span className="menu-text">New Chat</span>
              </IonButton>
              <IonButton fill="clear" routerLink="/chatbot">
                <IonIcon icon={chatbotIcon} />
                <span className="menu-text">Chats</span>
              </IonButton>
              <IonButton fill="clear" routerLink="/community">
                <IonIcon icon={communityIcon} />
                <span className="menu-text">Communities</span>
              </IonButton>
              <IonButton fill="clear" routerLink="/timeline">
                <IonIcon icon={timelineIcon} />
                <span className="menu-text">Timeline</span>
              </IonButton>
              <IonButton fill="clear" routerLink="/appointments">
                <IonIcon icon={AppointmentIcon} />
                <span className="menu-text">Appointments</span>
              </IonButton>
            </div>
            <div className="nav-bottom">
              <IonButton fill='clear' onClick={logoutUser}>
                <IonIcon icon={LogoutIcon} />
                <span className="menu-text">Log out</span>
              </IonButton>
              <IonButton fill="clear" routerLink="/settings">
                <IonIcon icon={settingsIcon} />
                <span className="menu-text">Setting</span>
              </IonButton>
              <IonButton fill="clear" routerLink="/profile">
                <IonIcon icon={profileIcon} />
                <span className="menu-text">Profile</span>
              </IonButton>
            </div>
          </aside>
          <main className="appointments-content">
            <header className="appointments-header">
              <h1>Appointment Planner</h1>
              <p className="subtitle">Track and manage your upcoming healthcare appointments with ease</p>
            </header>
            <div className="appointments-flex-row" style={{ alignItems: 'flex-start', flexDirection: 'row', display: 'flex' }}>
              <section className="upcoming-appointments-section card">
                <h2>Upcoming Appointments <span className="scheduled-count">{appointments.length} Scheduled</span></h2>
                <div className="appointments-list">
                  {appointments.length === 0 && <p>No appointments found.</p>}
                  {appointments.map(appt => (
                    <div
                      className="appointment-card"
                      key={appt.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => history.push(`/appointments/${userId}/${appt.id}`)}
                    >
                      <div className="appointment-date">{appt.dateTime?.toDate?.().toLocaleDateString('en-US', { month: 'short' }).toUpperCase()}<br/>{appt.dateTime?.toDate?.().getDate()}</div>
                      <div className="appointment-info">
                        <strong>{appt.provider}</strong>
                        <div className="appointment-meta">{appt.dateTime?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} · {appt.location}</div>
                        <div className="appointment-notes">Notes: {appt.notes?.join(', ')}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
              <section className="calendar-section card" style={{ height: '100%', minHeight: '420px' }}>
                <div className="calendar-widget">
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                    <button
                      style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8c3a7a' }}
                      onClick={() => {
                        if (calendarMonth === 0) {
                          setCalendarMonth(11);
                          setCalendarYear(calendarYear - 1);
                        } else {
                          setCalendarMonth(calendarMonth - 1);
                        }
                      }}
                      aria-label="Previous Month"
                    >
                      &#60;
                    </button>
                    <h3 style={{ color: '#8c3a7a', fontWeight: 700, fontSize: '1.2rem', margin: 0 }}>
                      {new Date(calendarYear, calendarMonth).toLocaleString('default', { month: 'long' })} {calendarYear}
                    </h3>
                    <button
                      style={{ background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: '#8c3a7a' }}
                      onClick={() => {
                        if (calendarMonth === 11) {
                          setCalendarMonth(0);
                          setCalendarYear(calendarYear + 1);
                        } else {
                          setCalendarMonth(calendarMonth + 1);
                        }
                      }}
                      aria-label="Next Month"
                    >
                      &#62;
                    </button>
                  </div>
                  <table className="calendar-table">
                    <thead>
                      <tr>
                        <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
                      </tr>
                    </thead>
                    <tbody>
                      {(() => {
                        const daysInMonth = getMonthDays(calendarMonth, calendarYear);
                        const firstDay = getFirstDayOfWeek(calendarMonth, calendarYear);
                        const rows = [];
                        let day = 1 - firstDay;
                        for (let week = 0; week < 6; week++) {
                          const cells = [];
                          for (let d = 0; d < 7; d++) {
                            if (day > 0 && day <= daysInMonth) {
                              cells.push(
                                <td key={d} style={{ position: 'relative', height: '40px' }}>
                                  {day}
                                  {appointmentsByDate[day] && (
                                    <span style={{
                                      display: 'block',
                                      width: '7px',
                                      height: '7px',
                                      borderRadius: '50%',
                                      background: '#8c3a7a',
                                      margin: '3px auto 0',
                                    }}></span>
                                  )}
                                </td>
                              );
                            } else {
                              cells.push(<td key={d}></td>);
                            }
                            day++;
                          }
                          rows.push(<tr key={week}>{cells}</tr>);
                        }
                        return rows;
                      })()}
                    </tbody>
                  </table>
                </div>
              </section>
            </div>
            <div className="appointments-flex-bottom" style={{ marginTop: formExpanded ? '2.5rem' : '1.5rem', transition: 'margin-top 0.3s cubic-bezier(.4,0,.2,1)' }}>
              <section
                className="add-appointment-section card"
                style={{
                  width: '890px', // always 900px
                  minWidth: '900px',
                  maxWidth: '890px',
                  height: formExpanded ? 'auto' : '56px',
                  overflow: 'visible',
                  boxSizing: 'border-box',
                  margin: '0 0 0 1.5rem', // always apply margin
                  alignSelf: 'flex-start',
                  transition: 'all 0.3s cubic-bezier(.4,0,.2,1)',
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'center',
                  zIndex: 2
                }}
              >
                <div
                  className="add-appt-header"
                  style={{
                    display: 'flex', alignItems: 'center', cursor: 'pointer', justifyContent: 'space-between', width: '100%', height: '56px', padding: '0 1.5rem',
                  }}
                  onClick={() => setFormExpanded(exp => !exp)}
                >
                  <h2 style={{ margin: 0 }}>Add a New Appointment</h2>
                  <IonIcon icon={formExpanded ? 'close' : addIcon} style={{ fontSize: '1.7rem', marginLeft: '1rem', color: '#8c3a7a', transition: 'transform 0.2s', transform: formExpanded ? 'rotate(90deg)' : 'none' }} />
                </div>
                {formExpanded && (
                  <div className="add-appt-card">
                    <div className="form-row">
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Date</IonLabel>
                        <IonInput type="date" value={form.date} onIonChange={e => handleFormChange("date", e.detail.value!)} />
                      </IonItem>
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Time</IonLabel>
                        <IonInput type="time" value={form.time} onIonChange={e => handleFormChange("time", e.detail.value!)} />
                      </IonItem>
                    </div>
                    <div className="form-row">
                      <IonItem className="form-item">
                        <IonLabel position="stacked">Provider</IonLabel>
                        <IonInput value={form.provider} onIonChange={e => handleFormChange("provider", e.detail.value!)} />
                      </IonItem>
                    </div>
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Location</IonLabel>
                      <IonInput value={form.location} onIonChange={e => handleFormChange("location", e.detail.value!)} placeholder="Enter Clinic or Hospital Address" />
                    </IonItem>
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Notes/Questions for Provider</IonLabel>
                      <IonTextarea value={form.notes[0]} onIonChange={e => handleNoteChange(0, e.detail.value!)} placeholder="Enter any symptoms, concerns, or questions you'd like to discuss at your appointment..." />
                    </IonItem>
                    {error && <p style={{ color: "red" }}>{error}</p>}
                    <IonButton expand="block" onClick={handleSubmit} disabled={loading} className="add-appointment-btn">
                      {loading ? <IonSpinner name="crescent" /> : "Add Appointment"}
                    </IonButton>
                  </div>
                )}
              </section>
              
              <section className="quick-actions-section card">
                <h2>Quick Actions</h2>
                <div className="quick-actions-list">
                  <a href="/chatbot" className="quick-action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className="icon"><img src={chatbotIcon} alt="Chat Bot" /></span>
                    <div>
                      <strong>Chat Bot</strong>
                      <p>Get personalized health insights and prepare for doctor visits</p>
                    </div>
                  </a>
                  <a href="/resources" className="quick-action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className="icon"><img src={AppointmentIcon} alt="Health Resources" /></span>
                    <div>
                      <strong>Health Resources</strong>
                      <p>Access health resources to prepare for pregnancy</p>
                    </div>
                  </a>
                  <a href="/community" className="quick-action-card" style={{ textDecoration: 'none', color: 'inherit' }}>
                    <span className="icon"><img src={communityIcon} alt="Communities" /></span>
                    <div>
                      <strong>Communities</strong>
                      <p>Connect with other expectant mothers in your area/same trimester</p>
                    </div>
                  </a>
                </div>
              </section>
            </div>
          </main>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppointmentsPage;
