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
  IonInput,
  IonButton,
  IonSpinner,
} from "@ionic/react";
import { useHistory } from "react-router-dom";
import { db, auth } from "../firebaseConfig";
import { doc, getDoc, updateDoc } from "firebase/firestore";
import { updatePassword } from "firebase/auth";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { logoutUser } from '../services/authService';
import SidebarNav from '../components/SidebarNav';
import './Settings.css';
import MobileMenuButton from '../components/MobileMenuButton';

const Settings: React.FC = () => {
  const history = useHistory();
  const currentUser = useCurrentUser();
  const [userData, setUserData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    location: ""
  });

  useEffect(() => {
    if (!currentUser) return;
    setLoading(true);
    const fetchUser = async () => {
      const docRef = doc(db, "users", currentUser.uid);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        const data = docSnap.data();
        setUserData(data);
        setForm({
          firstName: data.firstName || "",
          lastName: data.lastName || "",
          email: data.email || currentUser.email || "",
          password: data.password || "",
          location: data.location || ""
        });
      }
      setLoading(false);
    };
    fetchUser();
  }, [currentUser]);

  const handleChange = (field: string, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const saveChanges = async () => {
    if (!currentUser) return;
    setSaving(true);
    try {
      // Update Firestore profile fields
      await updateDoc(doc(db, "users", currentUser.uid), {
        firstName: form.firstName,
        lastName: form.lastName,
        location: form.location,
      });
      // Use the actual Firebase Auth user for password change
      if (form.password && form.password !== "" && auth.currentUser) {
        await updatePassword(auth.currentUser, form.password);
      }
      alert("Account updated!");
    } catch (err: any) {
      alert("Failed to update account: " + (err.message || err));
    }
    setSaving(false);
  };

  if (currentUser === undefined) {
    return <IonSpinner />;
  }

  if (!currentUser) {
    return (
      <IonPage className="settings-page">
        <IonContent fullscreen>
          <div className="settings-wrapper">
            <p style={{textAlign: 'center', marginTop: '2rem'}}>User not found. Please log in.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (loading) return <IonSpinner />;

  return (
    <IonPage className="settings-page">
      <IonContent fullscreen>
        <div className="settings-wrapper" style={{minHeight: '100vh', padding: 0, background: "transparent", display: 'flex', flexDirection: 'row'}}>
          <MobileMenuButton />
          <SidebarNav />
          <div style={{ position: 'relative', margin: '1rem auto', maxWidth: 700, flex: 1 }}>
            <IonCard className="settings-card" style={{ position: 'relative' }}>
              <button
                style={{ position: 'absolute', top: 20, right: 20, marginTop: '10px',marginRight: '10px',backgroundColor: 'red', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px', cursor: 'pointer', zIndex: 1 }}
                onClick={logoutUser}
              >
                Log Out
              </button>
              <IonCardHeader>
                <IonCardTitle>Account Details</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <IonItem className="form-item">
                  <IonLabel position="stacked">Email Address</IonLabel>
                  <IonInput value={form.email} disabled />
                </IonItem>
                <div className="form-row">
                  <IonItem className="form-item">
                    <IonLabel position="stacked">First Name</IonLabel>
                    <IonInput value={form.firstName} onIonChange={e => handleChange('firstName', e.detail.value!)} />
                  </IonItem>
                  <IonItem className="form-item">
                    <IonLabel position="stacked">Last Name</IonLabel>
                    <IonInput value={form.lastName} onIonChange={e => handleChange('lastName', e.detail.value!)} />
                  </IonItem>
                </div>
                <IonItem className="form-item">
                  <IonLabel position="stacked">Password</IonLabel>
                  {showPasswordInput ? (
                    <IonInput type="password" value={form.password} onIonChange={e => handleChange('password', e.detail.value!)} />
                  ) : (
                    <IonButton fill="clear" style={{ color: '#6C4AB6', fontSize: '0.95rem', marginTop: '0.5rem' }} onClick={() => setShowPasswordInput(true)}>
                      Change Password
                    </IonButton>
                  )}
                </IonItem>
                <IonItem className="form-item">
                  <IonLabel position="stacked">Location</IonLabel>
                  <IonInput value={form.location} onIonChange={e => handleChange('location', e.detail.value!)} />
                </IonItem>
                <IonButton expand="block" className="save-btn" style={{marginTop: '1.2rem'}} onClick={saveChanges} disabled={saving}>
                  {saving ? <IonSpinner name="crescent" /> : 'Save Changes'}
                </IonButton>
              </IonCardContent>
            </IonCard>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Settings;
