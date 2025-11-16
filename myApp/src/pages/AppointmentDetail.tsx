import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonItem,
  IonLabel,
  IonList,
  IonTextarea,
  IonButton,
  IonIcon,
  IonSpinner,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
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

const AppointmentDetail: React.FC = () => {
  const { id, uid } = useParams<{ id: string; uid: string }>();
  const history = useHistory();
  const [appointment, setAppointment] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<string[]>([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    const fetchAppointment = async () => {
      setLoading(true);
      const docRef = doc(db, "users", uid, "appointments", id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        setAppointment({ id, ...docSnap.data() });
        setNotes(docSnap.data().notes || []);
      }
      setLoading(false);
    };
    fetchAppointment();
  }, [id, uid]);

  const handleNoteChange = (idx: number, value: string) => {
    const newNotes = [...notes];
    newNotes[idx] = value;
    setNotes(newNotes);
  };

  const addNoteField = () => {
    setNotes(prev => [...prev, ""]);
  };

  const removeNoteField = (idx: number) => {
    setNotes(prev => prev.filter((_, i) => i !== idx));
  };

  const saveNotes = async () => {
    setSaving(true);
    await updateDoc(doc(db, "users", uid, "appointments", id), {
      notes: notes.filter(n => n.trim() !== ""),
    });
    setSaving(false);
  };

  if (loading) return <IonSpinner />;
  if (!appointment) return <p>Appointment not found.</p>;

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
          <IonCard color="primary" style={{background: 'linear-gradient(135deg, #E9DFF6 0%, #F3E8FF 100%)', borderRadius: '18px', boxShadow: '0 2px 12px rgba(108,74,182,0.08)', border: 'none'}}>
            <IonCardHeader>
              <IonCardTitle style={{ color: '#6C4AB6', fontFamily: 'Source Serif Pro, serif', fontWeight: 700 }}>
                <IonIcon src={CalendarIcon} /> {appointment.provider} @ {appointment.location}
              </IonCardTitle>
              <p style={{ color: '#3D246C', fontFamily: 'Source Serif Pro, serif' }}>{appointment.dateTime?.toDate?.().toLocaleString()}</p>
            </IonCardHeader>
            <IonCardContent style={{ fontFamily: 'Source Serif Pro, serif', color: '#3D246C' }}>
              <IonItem style={{ background: 'transparent', border: 'none' }}>
                <IonLabel position="stacked" style={{ color: '#6C4AB6', fontWeight: 600 }}>Location</IonLabel>
                <p style={{ color: '#3D246C', fontFamily: 'Source Serif Pro, serif' }}>{appointment.location}</p>
              </IonItem>
              <IonItem style={{ background: 'transparent', border: 'none' }}>
                <IonLabel position="stacked" style={{ color: '#6C4AB6', fontWeight: 600 }}>Provider</IonLabel>
                <p style={{ color: '#3D246C', fontFamily: 'Source Serif Pro, serif' }}>{appointment.provider}</p>
              </IonItem>
              <IonLabel position="stacked" style={{ color: '#6C4AB6', fontWeight: 600 }}>Notes/Questions</IonLabel>
              <IonList>
                {notes.map((note, idx) => (
                  <IonItem key={idx} style={{ background: 'transparent', border: 'none' }}>
                    <IonTextarea
                      value={note}
                      onIonChange={e => handleNoteChange(idx, e.detail.value!)}
                      placeholder={`Note/Question #${idx + 1}`}
                      style={{ background: '#F3E8FF', borderRadius: '8px', color: '#3D246C', fontFamily: 'Source Serif Pro, serif' }}
                    />
                    {notes.length > 1 && (
                      <IonButton color="danger" onClick={() => removeNoteField(idx)} size="small">Remove</IonButton>
                    )}
                  </IonItem>
                ))}
                <IonButton onClick={addNoteField} size="small" color="secondary">Add Note/Question</IonButton>
              </IonList>
              <IonButton expand="block" onClick={saveNotes} disabled={saving} color="success" style={{ borderRadius: '8px', fontWeight: 600 }}>
                {saving ? <IonSpinner name="crescent" /> : "Save Notes"}
              </IonButton>
              <IonButton expand="block" color="medium" onClick={() => history.goBack()} style={{marginTop: '1rem', borderRadius: '8px', fontWeight: 600}}>
                Back
              </IonButton>
            </IonCardContent>
          </IonCard>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppointmentDetail;
