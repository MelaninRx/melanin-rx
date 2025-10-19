import React, { useState } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonText } from "@ionic/react";
import { loginUser, registerUser } from "../services/authService";
import { useHistory } from "react-router-dom";
import "./Auth.css";

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
      <IonContent className="ion-padding auth-content">
        <IonInput
          placeholder="Email"
          value={email}
          onIonChange={(e) => setEmail(e.detail.value!)}
        />
        <IonInput
          placeholder="Password"
          type="password"
          value={password}
          onIonChange={(e) => setPassword(e.detail.value!)}
        />
        <IonButton expand="block" className="btn-primary" onClick={handleLogin}>
          Login
        </IonButton>
        <IonButton expand="block" className="btn-secondary" onClick={handleRegister}>
          Register
        </IonButton>
        {error && <IonText color="danger">{error}</IonText>}
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;
