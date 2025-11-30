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
  IonInput,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import CalendarIcon from "../icons/calendar-days.svg";
import homeIcon from '../icons/house.svg';
import addIcon from '../icons/Vector.svg';
import menuIcon from '../icons/menu.svg';
import chatbotIcon from '../icons/message-square.svg';
import communityIcon from '../icons/users.svg';
import timelineIcon from '../icons/calendar-days.svg';
import AppointmentIcon from '../icons/Frame 112.svg';
import settingsIcon from '../icons/settings.svg';
import './Appointments.css';
import './AppointmentDetail.css';
import Sidebar from "../components/SidebarNav";
import SidebarNav from "../components/SidebarNav";

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

  const deleteAppointment = async () => {
    if (!window.confirm('Are you sure you want to delete this appointment?')) return;
    try {
      const docRef = doc(db, "users", uid, "appointments", id);
      await deleteDoc(docRef);
      history.push('/appointments');
    } catch (err) {
      alert('Failed to delete appointment.');
    }
  };

  const saveAppointment = async () => {
    setSaving(true);
    try {
      await updateDoc(doc(db, "users", uid, "appointments", id), {
        provider: appointment.provider,
        location: appointment.location,
        notes: notes.filter(n => n.trim() !== ""),
        dateTime: appointment.dateTime,
      });
      alert('Appointment updated!');
    } catch (err) {
      alert('Failed to update appointment.');
    }
    setSaving(false);
  };

  if (loading) return <IonSpinner />;
  if (!appointment) return <p>Appointment not found.</p>;

  return (
    <IonPage className="appointments-page">
      <IonContent fullscreen>
       <SidebarNav />
        
        <div className="appointments-wrapper" style={{minHeight: '100vh', padding: 0, background: "transparent" }}>
          <div style={{ margin: '1rem auto', maxWidth: 700 }}>
            <div className="appointment-detail-wrapper" style={{ marginTop: '0' }}>
              <IonButton fill="clear" onClick={() => history.goBack()} style={{ fontSize: '1.6rem', color: 'var(--color-primary)', marginBottom: '1.5rem', alignSelf: 'flex-start' }}>
                <IonIcon icon="arrow-back-outline" slot="icon-only" />
              </IonButton>
              <IonCard className="detail-card">
                <div className="detail-card-header">
                  <h2 className="detail-card-title">Edit Appointment Details</h2>
                </div>
                <IonList className="detail-list">
                  <div className="form-row">
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Appointment Date</IonLabel>
                      <IonInput type="date" value={appointment.dateTime?.toDate?.().toISOString().slice(0,10) || ''} onIonChange={e => setAppointment({ ...appointment, dateTime: new Date(e.detail.value + 'T' + (appointment.dateTime?.toDate?.().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) || '00:00')) })} />
                    </IonItem>
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Time</IonLabel>
                      <IonInput type="time" value={appointment.dateTime?.toDate?.().toISOString().slice(11,16) || ''} onIonChange={e => setAppointment({ ...appointment, dateTime: new Date((appointment.dateTime?.toDate?.().toISOString().slice(0,10) || '') + 'T' + e.detail.value) })} />
                    </IonItem>
                  </div>
                  <div className="form-row">
                    <IonItem className="form-item">
                      <IonLabel position="stacked">Healthcare Provider</IonLabel>
                      <IonInput value={appointment.provider || ''} onIonChange={e => setAppointment({ ...appointment, provider: e.detail.value })} />
                    </IonItem>
                  </div>
                  <IonItem className="form-item">
                    <IonLabel position="stacked">Location</IonLabel>
                    <IonInput value={appointment.location || ''} onIonChange={e => setAppointment({ ...appointment, location: e.detail.value })} />
                  </IonItem>
                  <IonItem className="form-item">
                    <IonLabel position="stacked">Notes/ Questions for Provider</IonLabel>
                    <IonTextarea value={notes[0] || ''} onIonChange={e => handleNoteChange(0, e.detail.value!)} placeholder="Discuss recent fatigue and nutrition plan" />
                  </IonItem>
                </IonList>
                <IonButton expand="block" className="save-btn" style={{marginTop: '1.2rem'}} onClick={saveAppointment} disabled={saving}>
                  {saving ? <IonSpinner name="crescent" /> : 'Save Changes'}
                </IonButton>
                <IonButton color="danger" className="delete-btn" expand="block" style={{marginTop: '1rem'}} onClick={deleteAppointment}>
                  Delete Appointment
                </IonButton>
              </IonCard>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppointmentDetail;
