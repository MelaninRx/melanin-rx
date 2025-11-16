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
  IonDatetime,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonIcon,
  IonSpinner,
  IonToolbar,
  IonButtons,
} from "@ionic/react";
import { db, auth } from "../firebaseConfig";
import { collection, addDoc, query, where, getDocs, Timestamp, orderBy, updateDoc, doc } from "firebase/firestore";
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

  const addNoteField = () => {
    setForm(prev => ({ ...prev, notes: [...prev.notes, ""] }));
  };

  const removeNoteField = (idx: number) => {
    setForm(prev => ({ ...prev, notes: prev.notes.filter((_, i) => i !== idx) }));
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

  const handleNoteUpdate = async (apptId: string, notes: string[]) => {
    setLoading(true);
    try {
      await updateDoc(doc(db, "users", userId, "appointments", apptId), {
        notes: notes.filter(n => n.trim() !== ""),
      });
      fetchAppointments(userId);
    } catch (err) {
      setError("Failed to update notes.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <IonPage className="appointments-page">
      <IonContent fullscreen>
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
        <div className="appointments-wrapper">
          <h1>My Appointments</h1>
          <IonCard>
            <IonCardHeader>
              <IonCardTitle>Add Appointment</IonCardTitle>
            </IonCardHeader>
            <IonCardContent>
              <IonItem>
                <IonLabel position="stacked">Date</IonLabel>
                <IonInput
                  type="date"
                  value={form.date}
                  onIonChange={e => handleFormChange("date", e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Time</IonLabel>
                <IonInput
                  type="time"
                  value={form.time}
                  onIonChange={e => handleFormChange("time", e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Location</IonLabel>
                <IonInput
                  value={form.location}
                  onIonChange={e => handleFormChange("location", e.detail.value!)}
                />
              </IonItem>
              <IonItem>
                <IonLabel position="stacked">Provider</IonLabel>
                <IonInput
                  value={form.provider}
                  onIonChange={e => handleFormChange("provider", e.detail.value!)}
                />
              </IonItem>
              <IonLabel position="stacked">Notes/Questions</IonLabel>
              <IonList>
                {form.notes.map((note, idx) => (
                  <IonItem key={idx}>
                    <IonTextarea
                      value={note}
                      onIonChange={e => handleNoteChange(idx, e.detail.value!)}
                      placeholder={`Note/Question #${idx + 1}`}
                    />
                    {form.notes.length > 1 && (
                      <IonButton color="danger" onClick={() => removeNoteField(idx)} size="small">Remove</IonButton>
                    )}
                  </IonItem>
                ))}
                <IonButton onClick={addNoteField} size="small">Add Note/Question</IonButton>
              </IonList>
              {error && <p style={{ color: "red" }}>{error}</p>}
              <IonButton expand="block" onClick={handleSubmit} disabled={loading}>
                {loading ? <IonSpinner name="crescent" /> : "Add Appointment"}
              </IonButton>
            </IonCardContent>
          </IonCard>

          <h2>All Appointments</h2>
          {appointments.length === 0 && <p>No appointments found.</p>}
          <IonList>
            {appointments.map(appt => (
              <IonCard key={appt.id} color="warning" button onClick={() => history.push(`/appointments/${userId}/${appt.id}`)} style={{cursor: 'pointer', boxShadow: '0 2px 12px rgba(108,74,182,0.12)', borderLeft: '6px solid #6C4AB6', background: 'linear-gradient(135deg, #E9DFF6 0%, #F3E8FF 100%)', borderRadius: '18px'}}>
                <IonCardHeader>
                  <IonCardTitle style={{ color: '#6C4AB6', fontFamily: 'Source Serif Pro, serif', fontWeight: 700 }}>
                    <IonIcon src={CalendarIcon} /> {appt.provider} @ {appt.location}
                  </IonCardTitle>
                  <p style={{ color: '#3D246C', fontFamily: 'Source Serif Pro, serif' }}>{appt.dateTime?.toDate?.().toLocaleString()}</p>
                </IonCardHeader>
                <IonCardContent style={{ fontFamily: 'Source Serif Pro, serif', color: '#3D246C' }}>
                  <h3 style={{ color: '#6C4AB6', fontWeight: 600 }}>Notes/Questions</h3>
                  <IonList>
                    {appt.notes?.map((note: string, idx: number) => (
                      <IonItem key={idx} style={{ background: 'transparent', border: 'none' }}>
                        <IonTextarea
                          value={note}
                          disabled
                          style={{ background: '#F3E8FF', borderRadius: '8px', color: '#3D246C', fontFamily: 'Source Serif Pro, serif' }}
                        />
                      </IonItem>
                    ))}
                  </IonList>
                </IonCardContent>
              </IonCard>
            ))}
          </IonList>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppointmentsPage;
