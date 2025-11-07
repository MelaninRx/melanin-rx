import React, { useState } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonText, IonIcon, IonItem } from "@ionic/react";
import { loginUser, registerUser } from "../services/authService";
import { useHistory } from "react-router-dom";
import "./Auth.css";
import MelaninRxIcon from '../icons/MelaninRX.svg';
import ArrowLeftIcon from '../icons/arrow-left.svg';
import EmailIcon from '../icons/mail.svg';
import LockIcon from '../icons/lock.svg';


const AuthPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const history = useHistory(); // use this for navigation

  const handleLogin = async () => {
    try {
      await loginUser(email, password);
      history.push("/home"); // redirect straight to the Home page
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      await registerUser(email, password);
      history.push("/home");
    } catch (err: any) {
      setError(err.message);
    }
  };

  return (
    <IonPage className="auth-page">
      <IonContent fullscreen scrollY={false} className="auth-content">
        <div className="auth-wrapper">
          <div className="auth-left">
            <div className="auth-left-top"
            onClick={() => history.push("/Landing")}>
              <IonIcon icon={MelaninRxIcon} />
            </div>
            <div className="auth-left-bottom">
              <h1 className="auth-left-slogan">Bridging</h1>
              <h1 className="auth-left-slogan">Gaps in Black</h1>
              <h1 className="auth-left-slogan">Women's Healthcare</h1>
            </div>
          </div>

          <div className="auth-right">
            <div className="auth-right-top"
            onClick={() => history.push("/Landing")}>
              <IonIcon icon={ArrowLeftIcon}></IonIcon>
            </div>

            <div className="auth-form-wrapper">
              <div className="auth-heading">
                <h1>Sign in to Your Account</h1>
                <p>Let's sign in to your account to get started</p>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Email Address</label>
                <IonItem className="input-with-icon">
                  <IonIcon src={EmailIcon} slot="start" className="input-icon" />
                  <IonInput
                    value={email}
                    onIonChange={(e) => setEmail(e.detail.value!)}
                    className="input"
                  />
                </IonItem>
              </div>
              
              <div className="input-wrapper">
                <label className="input-label">Password</label>
                <IonItem className="input-with-icon">
                  <IonIcon src={LockIcon} slot="start" className="input-icon" />
                  <IonInput
                    type="password"
                    value={password}
                    onIonChange={(e) => setPassword(e.detail.value!)}
                    className="input"
                  />
                </IonItem>
              </div>

              <div className="actions">
                <IonButton expand="block" className="btn-primary" onClick={handleLogin}>
                  Login
                </IonButton>
                <IonButton expand="block" className="btn-secondary" onClick={handleRegister}>
                  Register
                </IonButton>
              </div>
              {error && <IonText color="danger">{error}</IonText>}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;
