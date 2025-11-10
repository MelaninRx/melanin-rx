import React, { useState } from "react";
import "./OnboardingForm.css";
import { useHistory } from "react-router-dom";
import {
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonList,
  IonSpinner,
  IonIcon,
  IonPage,
  IonContent,
} from "@ionic/react";
import { db, auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";
import EmailIcon from "../icons/mail.svg";
import CityIcon from "../icons/solar_city-bold.svg";
import UserIcon from "../icons/mdi_user.svg";
import PregnancyIcon from "../icons/streamline-ultimate_pregnancy-pregnant-bold.svg";
import LockIcon from "../icons/lock.svg";

const OnboardingForm: React.FC = () => {
  const history = useHistory();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [isGoogleUser, setIsGoogleUser] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    trimester: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setFormData({
        ...formData,
        name: user.displayName || "",
        email: user.email || "",
        password: "", // No password needed
      });

      setIsGoogleUser(true); // Hide the button after signing in
    } catch (error: any) {
      console.error("Google signup error:", error);
      setError("There was a problem signing up with Google.");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async () => {
    console.log("Form Submitted:", formData);
    setLoading(true);
    setError("");

    try {
      const { name, email, password, location, trimester } = formData;

      if (!name || !email || !location || !trimester) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      let user: User | null = auth.currentUser;

      // ✅ Case 1: Google user already signed in
      if (isGoogleUser && user) {
        await updateProfile(user, { displayName: name });
      }

      if (!isGoogleUser) {
        if (!password) {
          setError("Please enter a password or use Sign up with Google.");
          setLoading(false);
          return;
        }

        const userCredential = await createUserWithEmailAndPassword(
          auth,
          email,
          password
        );
        user = userCredential.user;
        await updateProfile(user, { displayName: name });
      }

      if (!user) {
        throw new Error("User authentication failed. Please try again.");
      }

      const trimesterLabel = { "1": "first", "2": "second", "3": "third" }[
        trimester
      ];
      const resourceQuery = query(
        collection(db, "resources"),
        where("trimester", "array-contains", trimesterLabel),
        where("location", "in", [location, "national"])
      );
      const querySnapshot = await getDocs(resourceQuery);
      const resources = querySnapshot.docs.map((doc) => doc.data());

      const formattedResources = resources.map((r) => ({
        title: r.title?.trim() || "Untitled",
        description: r.description?.trim() || "",
        category: r.category || "General",
      }));

      const readableResources = formattedResources
        .map((r, i) => `${i + 1}. **${r.title}**\n${r.description}`)
        .join("\n\n");

      if (!readableResources || readableResources.length < 10) {
        throw new Error("Resources are empty or improperly formatted.");
      }

      const fullPrompt = `Location: ${location}
Trimester: ${trimester}
Resources:
${readableResources}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${import.meta.env.VITE_OPEN_AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a culturally-aware health assistant helping pregnant Black women understand their pregnancy journey. Create personalized dashboards using ONLY the exact information provided.",
            },
            { role: "user", content: fullPrompt },
          ],
          temperature: 0.1,
        }),
      });

      const result = await response.json();
      if (!response.ok)
        throw new Error(`OpenAI API error: ${result.error?.message || "Unknown error"}`);

      const dashboardText = result.choices?.[0]?.message?.content;
      if (!dashboardText)
        throw new Error("No dashboard text returned from OpenAI.");

      // ✅ Create Firestore document linked to Auth UID
      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        location,
        trimester,
        dashboard: dashboardText,
        resources: formattedResources,
        createdAt: new Date(),
      });

      console.log("User + Firestore setup complete!");
      history.push("/home", { refresh: true });
    } catch (error: any) {
      console.error("Error during onboarding:", error);
      setError(error.message || "There was an error creating your account.");
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "20%" }}>
        <IonSpinner name="dots" />
        <h2>✨ Creating your personalized dashboard...</h2>
        <p>Please hang tight. We're tailoring your journey.</p>
      </div>
    );
  }

  return (
    <div className="onboarding-container">
      <div className="onboarding-card">
        <h1 className="onboarding-title">Create Your Account</h1>
        <p className="onboarding-subtitle">Tell us about yourself to get started</p>
        <IonList>
          {/* Name */}
          <div className="input-wrapper">
            <div className="label-with-icon">
              <IonIcon src={UserIcon} slot="start" className="label-icon" />
              <label className="input-label">Name</label>
            </div>
            <IonItem className="input-item" style={{
              '--background': '#fff',
              '--color': '#2a1d31',
              '--border-radius': '12px',
              '--border-color': '#73587e',
              border: '1px solid #73587e',
              marginBottom: '12px'
            }}>
              <IonInput
                style={{
                  '--color': '#2a1d31',
                  '--placeholder-color': '#7d6c87',
                  fontSize: '16px'
                }}
                value={formData.name}
                placeholder="Enter your name"
                onIonChange={(e) => handleChange("name", e.detail.value!)}
              />
            </IonItem>
          </div>

          {/* Email */}
          <div className="input-wrapper">
            <div className="label-with-icon">
              <IonIcon src={EmailIcon} slot="start" className="label-icon" />
              <label className="input-label">Email</label>
            </div>
            <IonItem className="input-item" style={{
              '--background': '#fff',
              '--color': '#2a1d31',
              '--border-radius': '12px',
              '--border-color': '#73587e',
              border: '1px solid #73587e',
              marginBottom: '12px'
            }}>
              <IonInput
                style={{
                  '--color': '#2a1d31',
                  '--placeholder-color': '#7d6c87',
                  fontSize: '16px'
                }}
                type="email"
                value={formData.email}
                placeholder="Enter your email"
                onIonChange={(e) => handleChange("email", e.detail.value!)}
                disabled={isGoogleUser}
              />
            </IonItem>
          </div>

          {/* Password (only for non-Google users) */}
          {!isGoogleUser && (
            <div className="input-wrapper">
              <div className="label-with-icon">
                <IonIcon src={LockIcon} slot="start" className="label-icon" />
                <label className="input-label">Password</label>
              </div>
              <IonItem className="input-item" style={{
                '--background': '#fff',
                '--color': '#2a1d31',
                '--border-radius': '12px',
                '--border-color': '#73587e',
                border: '1px solid #73587e',
                marginBottom: '12px'
              }}>
                <IonInput
                  style={{
                    '--color': '#2a1d31',
                    '--placeholder-color': '#7d6c87',
                    fontSize: '16px'
                  }}
                  type="password"
                  value={formData.password}
                  placeholder="Create a password"
                  onIonChange={(e) => handleChange("password", e.detail.value!)}
                />
              </IonItem>
            </div>
          )}

          {/* Location */}
          <div className="input-wrapper">
            <div className="label-with-icon">
              <IonIcon src={CityIcon} slot="start" className="label-icon" />
              <label className="input-label">Location</label>
            </div>
            <IonItem className="input-item" style={{
              '--background': '#fff',
              '--color': '#2a1d31',
              '--border-radius': '12px',
              '--border-color': '#73587e',
              border: '1px solid #73587e',
              marginBottom: '12px'
            }}>
              <IonInput
                style={{
                  '--color': '#2a1d31',
                  '--placeholder-color': '#7d6c87',
                  fontSize: '16px'
                }}
                value={formData.location}
                placeholder="City or ZIP code"
                onIonChange={(e) => handleChange("location", e.detail.value!)}
              />
            </IonItem>
          </div>

          {/* Trimester */}
          <div className="input-wrapper">
            <div className="label-with-icon">
              <IonIcon src={PregnancyIcon} slot="start" className="label-icon" />
              <label className="input-label">Trimester</label>
            </div>
            <IonItem className="input-item" style={{
              '--background': '#fff',
              '--color': '#2a1d31',
              '--border-radius': '12px',
              '--border-color': '#73587e',
              border: '1px solid #73587e',
              marginBottom: '12px'
            }}>
              <IonSelect
                style={{
                  '--color': '#2a1d31',
                  '--placeholder-color': '#7d6c87',
                  fontSize: '16px'
                }}
                value={formData.trimester}
                placeholder="Select trimester"
                onIonChange={(e) => handleChange("trimester", e.detail.value)}
              >
                <IonSelectOption value="1">1st Trimester</IonSelectOption>
                <IonSelectOption value="2">2nd Trimester</IonSelectOption>
                <IonSelectOption value="3">3rd Trimester</IonSelectOption>
              </IonSelect>
            </IonItem>
          </div>
        </IonList>

        {error && <p style={{ color: "red", marginTop: "10px" }}>{error}</p>}

        <div className="onboarding-buttons">
          <button
            className="onboarding-btn"
            onClick={handleSubmit}
            disabled={loading}
            type="button"
          >
            CREATE ACCOUNT
          </button>
          {!isGoogleUser && (
            <button
              className="onboarding-btn google"
              onClick={handleGoogleSignup}
              disabled={loading}
              type="button"
            >
              SIGN UP WITH GOOGLE
            </button>
          )}
        </div>

        <p className="auth-small-text">
          Already have an account?{" "}
          <span onClick={() => history.push("/auth")}>Log in</span>
        </p>
      </div>
    </div>
  );
};

export default OnboardingForm;
