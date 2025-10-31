import React, { useState, useEffect } from "react";
import { IonPage, IonContent, IonInput, IonButton, IonText, IonSpinner } from "@ionic/react";
import { loginUser, registerUser } from "../services/authService";
import { useHistory } from "react-router-dom";
import { auth, db } from "../firebaseConfig"; // adjust path as needed
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import "./Auth.css";

const AuthPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const history = useHistory(); // use this for navigation

  useEffect(() => {
    // Check if user is already authenticated
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        // User is signed in, check if they have a Firestore document
        const hasUserDoc = await checkUserDocument(user.uid);
        
        if (hasUserDoc) {
          history.push("/home");
        } else {
          history.push("/onboarding");
        }
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [history]);

  // Check if user document exists in Firestore
  const checkUserDocument = async (uid: string): Promise<boolean> => {
    try {
      const userDocRef = doc(db, "users", uid);
      const userDoc = await getDoc(userDocRef);
      return userDoc.exists();
    } catch (error) {
      console.error("Error checking user document:", error);
      return false;
    }
  };

  const handleLogin = async () => {
    try {
      setError("");
      const userCredential = await loginUser(email, password);
      
      // Check if user has completed onboarding (has Firestore document)
      const hasUserDoc = await checkUserDocument(userCredential.user.uid);
      
      if (hasUserDoc) {
        history.push("/home");
      } else {
        history.push("/onboarding");
      }
    } catch (err: any) {
      setError(err.message);
    }
  };

  const handleRegister = async () => {
    try {
      setError("");
      await registerUser(email, password);
      // New users always go to onboarding to create their Firestore document
      history.push("/onboarding");
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
