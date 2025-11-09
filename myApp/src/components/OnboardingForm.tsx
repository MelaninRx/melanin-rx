import React, { useState } from "react";
import "./OnboardingForm.css";
import { useHistory } from "react-router-dom";
import { getAuth } from "firebase/auth";
import EmailIcon from '../icons/mail.svg';
import LockIcon from '../icons/lock.svg';
import CityIcon from "../icons/solar_city-bold.svg"
import UserIcon from "../icons/mdi_user.svg"
import PregnancyIcon from "../icons/streamline-ultimate_pregnancy-pregnant-bold.svg"

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
} from "@ionic/react";
import { db } from "../firebaseConfig";
import {
  collection,
  doc,
  getDoc,
  setDoc,
  getDocs,
  query,
  where,
} from "firebase/firestore";

const OnboardingForm: React.FC = () => {
  const auth = getAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    trimester: "",
  });

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    console.log("Form Submitted:", formData);
    setLoading(true);

    try {
      const user = auth.currentUser;
      if (!user) throw new Error("No user is signed in.");

      const existingUserDoc = await getDoc(doc(db, "users", user.uid));
      if (existingUserDoc.exists()) {
        console.log("User already onboarded, redirecting...");
        history.push("/home");
        return;
      }

      const trimesterLabel = {
        "1": "first",
        "2": "second",
        "3": "third",
      }[formData.trimester];

      const resourceQuery = query(
        collection(db, "resources"),
        where("trimester", "array-contains", trimesterLabel),
        where("location", "in", [formData.location, "national"])
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

      const fullPrompt = `Location: ${formData.location}
Trimester: ${formData.trimester}

Resources:
${readableResources}`;

      const response = await fetch("https://api.openai.com/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_OPEN_AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: "gpt-4-turbo",
          messages: [
            {
              role: "system",
              content:
                "You are a culturally-aware health assistant helping pregnant Black women understand their pregnancy journey. Create personalized dashboards using ONLY the exact information provided.",
            },
            {
              role: "user",
              content: fullPrompt,
            },
          ],
          temperature: 0.1,
        }),
      });

      console.log("OpenAI Response status:", response.status);
      const result = await response.json();
      console.log("OpenAI result:", result);

      if (!response.ok) {
        throw new Error(`OpenAI API error: ${result.error?.message || "Unknown error"}`);
      }

      const dashboardText = result.choices?.[0]?.message?.content;
      if (!dashboardText) {
        throw new Error("No dashboard text returned from OpenAI");
      }

      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        trimester: formData.trimester,
        dashboard: dashboardText,
        resources: formattedResources,
        updatedAt: new Date(),
      });

      console.log("✅ Data saved to Firestore!");
      
      await new Promise(resolve => setTimeout(resolve, 500));
      
      history.push("/home", { refresh: true });
      
    } catch (error) {
      console.error("Error during onboarding:", error);
      alert("There was an error submitting your form. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  // ✅ Loading screen shown while generating dashboard
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
    <>
      <h1>Create Your Account</h1>
      <p>Tell us about yourself to get started</p>
      
      <IonList>
        <div className="input-wrapper">
          <div className="label-with-icon">
            <IonIcon src={UserIcon} slot="start" className="label-icon" />
            <label className="input-label">Name</label>
          </div>
          <IonItem className="input-item">
            <IonInput
              value={formData.name}
              placeholder="Enter your name"
              onIonChange={(e) => handleChange("name", e.detail.value!)}
            />
          </IonItem>
        </div>

        <div className="input-wrapper">
          <div className="label-with-icon">
            <IonIcon src={EmailIcon} slot="start" className="label-icon" />
            <label className="input-label">Email</label>
          </div>
          <IonItem className="input-item">
            <IonInput
              type="email"
              value={formData.email}
              placeholder="Enter your email"
              onIonChange={(e) => handleChange("email", e.detail.value!)}
            />
          </IonItem>
        </div>

        <div className="input-wrapper">
          <div className="label-with-icon">
            <IonIcon src={CityIcon} slot="start" className="label-icon" />
            <label className="input-label">Location</label>
          </div>
          <IonItem className="input-item">
            <IonInput
              value={formData.location}
              placeholder="City or ZIP code"
              onIonChange={(e) => handleChange("location", e.detail.value!)}
            />
          </IonItem>
        </div>

        <div className="input-wrapper">
          <div className="label-with-icon">
            <IonIcon src={PregnancyIcon} slot="start" className="label-icon" />
            <label className="input-label">Trimester</label>
          </div>
          <IonItem className="input-item">
            <IonSelect
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

      <IonButton expand="block" className="btn-primary" onClick={handleSubmit}>
        Submit
      </IonButton>
    </>
  );
};

export default OnboardingForm;