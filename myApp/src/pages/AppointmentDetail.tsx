import React, { useEffect, useState } from "react";
import {
  IonPage,
  IonContent,
  IonSpinner,
} from "@ionic/react";
import { useParams, useHistory } from "react-router-dom";
import { db } from "../firebaseConfig";
import { doc, getDoc, updateDoc, deleteDoc } from "firebase/firestore";
import './Appointments.css';
import './AppointmentDetail.css';
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

  if (loading) return (
    <IonPage className="appointment-detail-page">
      <IonContent fullscreen>
        <div className="loading-container">
          <IonSpinner />
        </div>
      </IonContent>
    </IonPage>
  );
  if (!appointment) return (
    <IonPage className="appointment-detail-page">
      <IonContent fullscreen>
        <div className="loading-container">
          <p>Appointment not found.</p>
        </div>
      </IonContent>
    </IonPage>
  );

  return (
    <IonPage className="appointment-detail-page">
      <IonContent fullscreen>
        <SidebarNav />

        <div className="appointment-detail-container">
          <button className="back-arrow" onClick={() => history.goBack()} aria-label="Go back">
            <svg width="46" height="41" viewBox="0 0 46 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M23.0002 32.4583L9.5835 20.5M9.5835 20.5L23.0002 8.54163M9.5835 20.5H36.4168" stroke="#222222" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <h1 className="page-title">Prenatal Check In</h1>

          <div className="detail-card">
            <div className="detail-card-header">
              <h2 className="detail-card-title">Edit Appointment Details</h2>
              <button className="delete-btn" onClick={deleteAppointment}>
                Delete Appointment
              </button>
            </div>

            <div className="form-content">
              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Appointment Date</label>
                  <div className="input-wrapper">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <path d="M6.66667 1.66675V5.00008M13.3333 1.66675V5.00008M2.5 8.33341H17.5M4.16667 3.33341H15.8333C16.7538 3.33341 17.5 4.07961 17.5 5.00008V16.6667C17.5 17.5872 16.7538 18.3334 15.8333 18.3334H4.16667C3.24619 18.3334 2.5 17.5872 2.5 16.6667V5.00008C2.5 4.07961 3.24619 3.33341 4.16667 3.33341Z" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    </svg>
                    <input
                      type="date"
                      className="form-input"
                      value={appointment.dateTime?.toDate?.().toISOString().slice(0,10) || ''}
                      onChange={e => setAppointment({ ...appointment, dateTime: new Date(e.target.value + 'T' + (appointment.dateTime?.toDate?.().toISOString().slice(11,16) || '00:00')) })}
                    />
                  </div>
                </div>

                <div className="form-field">
                  <label className="field-label">Time</label>
                  <div className="input-wrapper">
                    <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                      <g clipPath="url(#clip0_3718_1454)">
                        <path d="M9.99984 5.00008V10.0001L13.3332 11.6667M18.3332 10.0001C18.3332 14.6025 14.6022 18.3334 9.99984 18.3334C5.39746 18.3334 1.6665 14.6025 1.6665 10.0001C1.6665 5.39771 5.39746 1.66675 9.99984 1.66675C14.6022 1.66675 18.3332 5.39771 18.3332 10.0001Z" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                      </g>
                      <defs>
                        <clipPath id="clip0_3718_1454">
                          <rect width="20" height="20" fill="white"/>
                        </clipPath>
                      </defs>
                    </svg>
                    <input
                      type="time"
                      className="form-input"
                      value={appointment.dateTime?.toDate?.().toISOString().slice(11,16) || ''}
                      onChange={e => setAppointment({ ...appointment, dateTime: new Date((appointment.dateTime?.toDate?.().toISOString().slice(0,10) || '') + 'T' + e.target.value) })}
                    />
                  </div>
                </div>
              </div>

              <div className="form-row">
                <div className="form-field">
                  <label className="field-label">Healthcare Provider</label>
                  <div className="input-wrapper">
                    <input
                      type="text"
                      className="form-input"
                      value={appointment.provider || ''}
                      onChange={e => setAppointment({ ...appointment, provider: e.target.value })}
                      placeholder="Dr. Williams"
                    />
                  </div>
                </div>
              </div>

              <div className="form-field full-width">
                <label className="field-label">Location</label>
                <div className="input-wrapper">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M16.6668 8.33341C16.6668 12.4942 12.051 16.8276 10.501 18.1659C10.3566 18.2745 10.1808 18.3332 10.0002 18.3332C9.8195 18.3332 9.64373 18.2745 9.49933 18.1659C7.94933 16.8276 3.3335 12.4942 3.3335 8.33341C3.3335 6.5653 4.03588 4.86961 5.28612 3.61937C6.53636 2.36913 8.23205 1.66675 10.0002 1.66675C11.7683 1.66675 13.464 2.36913 14.7142 3.61937C15.9645 4.86961 16.6668 6.5653 16.6668 8.33341Z" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                    <path d="M10.0002 10.8334C11.3809 10.8334 12.5002 9.71413 12.5002 8.33341C12.5002 6.9527 11.3809 5.83341 10.0002 5.83341C8.61945 5.83341 7.50016 6.9527 7.50016 8.33341C7.50016 9.71413 8.61945 10.8334 10.0002 10.8334Z" stroke="#616161" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                  <input
                    type="text"
                    className="form-input"
                    value={appointment.location || ''}
                    onChange={e => setAppointment({ ...appointment, location: e.target.value })}
                    placeholder="Women's Health Center, 123 Main St"
                  />
                </div>
              </div>

              <div className="form-field full-width">
                <label className="field-label">Notes/ Questions for Provider</label>
                <div className="input-wrapper textarea-wrapper">
                  <textarea
                    className="form-textarea"
                    value={notes[0] || ''}
                    onChange={e => handleNoteChange(0, e.target.value)}
                    placeholder="Discuss recent fatigue and nutrition plan"
                    rows={4}
                  />
                </div>
              </div>

              <button className="save-btn" onClick={saveAppointment} disabled={saving}>
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AppointmentDetail;
