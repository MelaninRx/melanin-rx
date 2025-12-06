import React, { useState, useEffect } from "react";
import "./OnboardingForm.css";
import { useHistory } from "react-router-dom";
import {
  IonInput,
  IonItem,
  IonLabel,
  IonButton,
  IonList,
  IonSpinner,
  IonIcon,
} from "@ionic/react";
import { db, auth } from "../firebaseConfig";
import {
  createUserWithEmailAndPassword,
  updateProfile,
  GoogleAuthProvider,
  signInWithPopup,
  User,
  onAuthStateChanged,
} from "firebase/auth";
import {
  collection,
  doc,
  setDoc,
  getDocs,
  query,
  where,
  getDoc,
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
  const [waitingForOnboard, setWaitingForOnboard] = useState(false);
  const [isPolling, setIsPolling] = useState(false);
  const [submitted, setSubmitted] = useState(() => {
    return sessionStorage.getItem("onboardingSubmitted") === "true";
  });

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    password: "",
    location: "",
    dueDate: "",
  });

  // Calculate trimester from due date
  // Due date is typically 40 weeks from LMP (last menstrual period)
  // Current week = 40 - (weeks until due date)
  const calculateTrimester = (dueDateString: string): string => {
    if (!dueDateString) return "";
    
    const dueDate = new Date(dueDateString);
    const today = new Date();
    // Set both to midnight for accurate day calculation
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    // Calculate weeks until due date
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksUntilDue = Math.floor(daysUntilDue / 7);
    
    // Current week of pregnancy (assuming 40 week pregnancy)
    const currentWeek = Math.max(0, 40 - weeksUntilDue);
    
    // Determine trimester
    if (currentWeek < 14) return "1";
    if (currentWeek < 28) return "2";
    return "3";
  };

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleGoogleSignup = async () => {
    setLoading(true);
    setError("");
    const provider = new GoogleAuthProvider();

    try {
      // Set flag before popup to persist through any redirects
      sessionStorage.setItem("googleSignupInProgress", "true");

      const result = await signInWithPopup(auth, provider);
      const user = result.user;

      setFormData((prev) => ({
        ...prev,
        name: user.displayName || "",
        email: user.email || "",
        password: "",
      }));

      setIsGoogleUser(true);
      setError("");
    } catch (error: any) {
      console.error("Google signup error:", error);
      sessionStorage.removeItem("googleSignupInProgress");

      if (error.code === "auth/popup-closed-by-user") {
        setError("Sign-in cancelled. Please try again.");
      } else if (error.code === "auth/popup-blocked") {
        setError("Pop-up blocked. Please allow pop-ups for this site.");
      } else if (error.code === "auth/cancelled-popup-request") {
        setError(""); // User closed popup, don't show error
      } else {
        setError("There was a problem signing up with Google. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  const pollOnboardingComplete = async (uid: string) => {
    setIsPolling(true);
    console.log('[OnboardingForm] Starting polling for onboardingComplete');
    const userDocRef = doc(db, "users", uid);
    // Increased timeout to 30 seconds (30 attempts) to allow for slower API responses
    for (let i = 0; i < 30; i++) {
      const userDoc = await getDoc(userDocRef);
      console.log(`[OnboardingForm] Poll attempt ${i + 1}:`, userDoc.exists() ? userDoc.data().onboardingComplete : 'no user doc');
      if (userDoc.exists() && userDoc.data().onboardingComplete === true) {
        console.log('[OnboardingForm] onboardingComplete is true, redirecting to home');
        setWaitingForOnboard(false);
        setIsPolling(false);
        setLoading(false);
        setSubmitted(false);
        sessionStorage.removeItem("onboardingSubmitted");
        history.push("/home", { refresh: true });
        return;
      }
      await new Promise(res => setTimeout(res, 1000));
    }
    console.log('[OnboardingForm] Polling timed out, onboardingComplete not true');
    setError("Onboarding did not complete. The account may have been created but the dashboard is still loading. Please refresh the page.");
    setWaitingForOnboard(false);
    setIsPolling(false);
    setLoading(false);
    setSubmitted(false);
    sessionStorage.removeItem("onboardingSubmitted");
  };

  const handleSubmit = async () => {
    setSubmitted(true);
    sessionStorage.setItem("onboardingSubmitted", "true");
    console.log("Form Submitted:", formData);
    setLoading(true);
    setError("");

    try {
      const { name, email, password, location, dueDate } = formData;

      if (!name || !email || !location || !dueDate) {
        setError("Please fill in all required fields.");
        setLoading(false);
        return;
      }

      // Calculate trimester from due date
      const trimester = calculateTrimester(dueDate);
      if (!trimester) {
        setError("Please enter a valid due date.");
        setLoading(false);
        return;
      }

      let user: User | null = auth.currentUser;

      // Case 1: Google user already signed in
      if (isGoogleUser && user) {
        await updateProfile(user, { displayName: name });
      }

      // Case 2: Email/password signup
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
        setError("No user detected. Please log in again.");
        setLoading(false);
        return;
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

      // Add timeout to prevent hanging (15 seconds)
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      let dashboardText = "";
      try {
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
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const result = await response.json();
        if (!response.ok) {
          throw new Error(`OpenAI API error: ${result.error?.message || "Unknown error"}`);
        }

        dashboardText = result.choices?.[0]?.message?.content;
        if (!dashboardText) {
          throw new Error("No dashboard text returned from OpenAI.");
        }
      } catch (error: any) {
        clearTimeout(timeoutId);
        // If API call fails or times out, continue with empty dashboard
        // User can still complete onboarding and we'll use a default message
        console.warn("Dashboard generation failed, continuing with default:", error);
        dashboardText = "Welcome to your personalized dashboard. We're here to support you through your pregnancy journey.";
      }

      await setDoc(doc(db, "users", user.uid), {
        name,
        email,
        location,
        trimester,
        dueDate: dueDate,
        dashboard: dashboardText,
        resources: formattedResources,
        createdAt: new Date(),
        onboardingComplete: true,
      }, { merge: true });

      await auth.currentUser?.reload();
      sessionStorage.removeItem("googleSignupInProgress");
      setWaitingForOnboard(true);
      setIsPolling(true);
      pollOnboardingComplete(user.uid);
      return;
    } catch (error: any) {
      console.error("Error during onboarding:", error);
      setError(error.message || "There was an error creating your account.");
      // Reset states on error so user can try again
      setLoading(false);
      setSubmitted(false);
      setWaitingForOnboard(false);
      setIsPolling(false);
      sessionStorage.removeItem("onboardingSubmitted");
      sessionStorage.removeItem("googleSignupInProgress");
    }
  };

  // Check for Google user on component mount
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      if (user) {
        setWaitingForOnboard(true); // Show loading immediately when user is present
        const userDoc = await getDoc(doc(db, "users", user.uid));
        const isGoogle = user.providerData.some(p => p.providerId === "google.com");

        if (!userDoc.exists()) {
          // New user - populate form
          setFormData((prev) => ({
            ...prev,
            name: user.displayName || "",
            email: user.email || "",
          }));
          setIsGoogleUser(isGoogle);
          if (isGoogle) sessionStorage.setItem("googleSignupInProgress", "true");
          setWaitingForOnboard(false); // Show form for new user
        } else if (userDoc.data()?.onboardingComplete) {
          // Only redirect if onboarding is actually complete
          sessionStorage.removeItem("onboardingSubmitted");
          setSubmitted(false);
          history.push("/home", { refresh: true });
        } else {
          // If doc exists but onboarding not complete, show loading screen
          setWaitingForOnboard(true);
        }
        setIsGoogleUser(isGoogle);
      } else {
        setIsGoogleUser(false);
        setWaitingForOnboard(false); // Show form if no user
      }
    });
    return () => unsubscribe();
  }, [history]);

  if (submitted) {
    return (
      <div className="centered-loading">
        <IonSpinner name="dots" />
        <h2>✨ Creating your personalized dashboard...</h2>
        <p>Please hang tight. We're tailoring your journey.</p>
        {error && (
          <div style={{ marginTop: '20px', color: 'red', fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  if (loading || waitingForOnboard || isPolling) {
    return (
      <div className="centered-loading">
        <IonSpinner name="dots" />
        <h2>✨ Creating your personalized dashboard...</h2>
        <p>Please hang tight. We're tailoring your journey.</p>
        {error && (
          <div style={{ marginTop: '20px', color: 'red', fontSize: '14px' }}>
            {error}
          </div>
        )}
      </div>
    );
  }

  // Only show onboarding form if not waitingForOnboard AND not loading
  if (!waitingForOnboard && !loading && !isPolling) {
    return (
      <div className="onboarding-container">
        <div className="onboarding-card">
          <h1 className="onboarding-title">Create Your Account</h1>
          <p className="onboarding-subtitle">
            {isGoogleUser 
              ? `Welcome, ${formData.name}! Complete your profile below.` 
              : "Tell us about yourself to get started"}
          </p>
          <IonList>
            {/* Name (only for non-Google users) */}
            {!isGoogleUser && (
              <div className="input-wrapper">
                <div className="label-with-icon">
                  <IonIcon src={UserIcon} slot="start" className="label-icon" />
                  <label className="input-label">Name</label>
                </div>
                <IonItem className="input-item" style={{
                  '--background': '#fff',
                  '--color': '#2a1d31',
                  '--border-radius': '12px',
                  '--border-color': 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
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
            )}
            {/* Email (only for non-Google users) */}
            {!isGoogleUser && (
              <div className="input-wrapper">
                <div className="label-with-icon">
                  <IonIcon src={EmailIcon} slot="start" className="label-icon" />
                  <label className="input-label">Email</label>
                </div>
                <IonItem className="input-item" style={{
                  '--background': '#fff',
                  '--color': '#2a1d31',
                  '--border-radius': '12px',
                  '--border-color': 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
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
                  />
                </IonItem>
              </div>
            )}
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
                  '--border-color': 'var(--color-primary)',
                  border: '1px solid var(--color-primary)',
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
            {/* Estimated Due Date */}
            <div className="input-wrapper">
              <div className="label-with-icon">
                <IonIcon src={PregnancyIcon} slot="start" className="label-icon" />
                <label className="input-label">Estimated Due Date</label>
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
                  type="date"
                  value={formData.dueDate}
                  placeholder="Select your estimated due date"
                  onIonChange={(e) => handleChange("dueDate", e.detail.value!)}
                />
              </IonItem>
              {formData.dueDate && (
                <div style={{ 
                  fontSize: '12px', 
                  color: '#7d6c87', 
                  marginTop: '4px',
                  marginLeft: '32px'
                }}>
                  {(() => {
                    const trimester = calculateTrimester(formData.dueDate);
                    const trimesterLabels = { "1": "1st Trimester", "2": "2nd Trimester", "3": "3rd Trimester" };
                    return trimester ? `Currently in ${trimesterLabels[trimester as "1" | "2" | "3"]}` : "";
                  })()}
                </div>
              )}
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
  }

  return null;
};

export default OnboardingForm;