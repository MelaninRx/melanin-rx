import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
  IonInput,
  IonButton,
  IonIcon,
  IonItem,
  IonSpinner,
} from "@ionic/react";
import { loginUser } from "../services/authService";
import { useHistory } from "react-router-dom";
import "./Auth.css";
import MelaninRxIcon from "../icons/MelaninRX.svg";
import ArrowLeftIcon from "../icons/arrow-left.svg";
import EmailIcon from "../icons/mail.svg";
import LockIcon from "../icons/lock.svg";
import { auth, db } from "../firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc } from "firebase/firestore";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";


const AuthPage: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const history = useHistory();

  // ✅ Automatically route logged-in users
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        const hasUserDoc = await checkUserDocument(user.uid);
        history.push(hasUserDoc ? "/home" : "/onboarding");
      }
    });
    return () => unsubscribe();
  }, [history]);

  // ✅ Check if Firestore doc exists
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

  // ✅ Map Firebase error codes → clean messages
  const handleError = (errorCode: string) => {
    const messages: Record<string, string> = {
      "auth/invalid-email": "Please enter a valid email address.",
      "auth/user-not-found": "No account found with this email.",
      "auth/wrong-password": "Incorrect password. Please try again.",
      default: "Something went wrong. Please try again.",
    };
    setErrorMessage(messages[errorCode] || messages.default);
  };

  // ✅ Login handler
  const handleLogin = async () => {
    setErrorMessage("");
    if (!email || !password) {
      setErrorMessage("Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);
      const userCredential = await loginUser(email, password);
      const hasUserDoc = await checkUserDocument(userCredential.user.uid);
      if (hasUserDoc) {
        history.push("/home");
      } else {
        setErrorMessage("No account found with this email.");
      }
    } catch (err: any) {
      console.error(err);
      handleError(err.code || "default");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Navigate to onboarding (Sign Up)
  const handleSignUpRedirect = () => {
    history.push("/onboarding");
  };

  // ✅ Handle Google login
const handleGoogleLogin = async () => {
  const provider = new GoogleAuthProvider();
  try {
    setLoading(true);
    const result = await signInWithPopup(auth, provider);
    const user = result.user;

    const userDocRef = doc(db, "users", user.uid);
    const userDoc = await getDoc(userDocRef);

    if (userDoc.exists()) {
      history.push("/home");
    } else {
      history.push("/onboarding");
    }
  } catch (error) {
    console.error("Google login error:", error);
    setErrorMessage("There was a problem signing in with Google.");
  } finally {
    setLoading(false);
  }
};


  return (
    <IonPage className="auth-page">
      <IonContent fullscreen scrollY={false} className="auth-content">
        <div className="auth-wrapper">
          {/* ===== Left Side ===== */}
          <div className="auth-left" onClick={() => history.push("/Landing")}>
            <div className="auth-left-top">
              <IonIcon icon={MelaninRxIcon} />
            </div>
            <div className="auth-left-bottom">
              <h1 className="auth-left-slogan">Bridging</h1>
              <h1 className="auth-left-slogan">Gaps in Black</h1>
              <h1 className="auth-left-slogan">Women's Healthcare</h1>
            </div>
          </div>

          {/* ===== Right Side ===== */}
          <div className="auth-right">
            <div
              className="auth-right-top"
              onClick={() => history.push("/Landing")}
            >
              <IonIcon icon={ArrowLeftIcon}></IonIcon>
            </div>

            <div className="auth-form-wrapper">
              <div className="auth-heading">
                <h1>Welcome Back</h1>
                <p>Sign in to access your personalized dashboard</p>
              </div>

              <div className="input-wrapper">
                <label className="input-label">Email Address</label>
                <IonItem className="input-with-icon">
                  <IonIcon src={EmailIcon} slot="start" className="input-icon" />
                  <IonInput
                    value={email}
                    onIonChange={(e) => setEmail(e.detail.value!)}
                    className="input"
                    autocomplete="email"
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
                    autocomplete="current-password"
                  />
                </IonItem>
              </div>

              <div className="actions">
                <IonButton
                  expand="block"
                  className="btn-primary"
                  onClick={handleLogin}
                  disabled={loading}
                >
                  {loading ? <IonSpinner name="crescent" /> : "Login"}
                </IonButton>

                
                <IonButton
                  expand="block"
                  className="btn-secondary"
                  onClick={handleGoogleLogin}
                >
                  Login with Google
                </IonButton>
              </div>
              <p className="auth-small-text">
                  Don’t have an account?{" "}
                  <span onClick={handleSignUpRedirect}>Sign up</span>
                </p>

              {errorMessage && (
                <div className="auth-error">
                  <IonIcon icon={LockIcon} className="auth-error-icon" />
                  <p>{errorMessage}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default AuthPage;
