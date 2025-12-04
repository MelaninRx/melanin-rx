import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { getAuth } from "firebase/auth";
import {
  IonInput,
  IonItem,
  IonLabel,
  IonSelect,
  IonSelectOption,
  IonButton,
  IonList,
  IonSpinner,
  IonListHeader,
  IonNote,
  IonText,
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

/** ---------- Types for new fields ---------- **/
type Role =
  | "first_time_mom"
  | "experienced_mom"
  | "medical_professional"
  | "support_partner"
  | "community_advocate"
  | "other";

type TermFamiliarity = "low" | "medium" | "high";
type ExplanationStyle = "visual_simple" | "balanced" | "in_depth";
type TonePref = "warm" | "neutral" | "professional";
type MediaPref = "images" | "audio" | "translation";
type Goal =
  | "learn_stages"
  | "culturally_relevant_guidance"
  | "symptom_tracking"
  | "pro_insights"
  | "mental_health"
  | "community_connection";
type UsageFreq = "daily" | "weekly" | "occasional";

type Persona =
  | "clinician"
  | "new_parent"
  | "experienced_parent"
  | "support_partner"
  | "advocate"
  | "general_user";

type ChatbotConfig = {
  persona: Persona;
  reading_level: "grade_6" | "grade_8" | "grade_10" | "college";
  explanation_depth: "basic" | "standard" | "scholarly";
  citations_mode: "none" | "light" | "strict";
  tone: TonePref;
  include_visuals: boolean;
  include_audio: boolean;
  language: "en";
  cultural_context: "center_black_maternal_health";
  module_priority: string[];
  session_length_hint: "short" | "medium" | "deep_dive";
  escalation_paths: string[];
  image_policy?: "always" | "on_demand" | "never";
};

const OnboardingForm: React.FC = () => {
  const auth = getAuth();
  const history = useHistory();
  const [loading, setLoading] = useState(false);

  // ---------- Existing fields ----------
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    location: "",
    trimester: "", // "1" | "2" | "3"
  });

  // ---------- New personalization fields ----------
  const [role, setRole] = useState<Role[]>([]);
  const [termFamiliarity, setTermFamiliarity] = useState<TermFamiliarity | "">(
    ""
  );
  const [explanationStyle, setExplanationStyle] = useState<
    ExplanationStyle | ""
  >("");
  const [tonePref, setTonePref] = useState<TonePref | "">("");
  const [mediaPrefs, setMediaPrefs] = useState<MediaPref[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [usageFrequency, setUsageFrequency] = useState<UsageFreq | "">("");

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  /** ---------- Mapping helpers for chatbot config ---------- **/
  const pickPersona = (roles: Role[]): Persona => {
    if (roles.includes("medical_professional")) return "clinician";
    if (roles.includes("first_time_mom")) return "new_parent";
    if (roles.includes("experienced_mom")) return "experienced_parent";
    if (roles.includes("support_partner")) return "support_partner";
    if (roles.includes("community_advocate")) return "advocate";
    return "general_user";
  };

  const baselineFor = (persona: Persona): ChatbotConfig => {
    const base: Record<Persona, ChatbotConfig> = {
      clinician: {
        persona: "clinician",
        reading_level: "college",
        explanation_depth: "scholarly",
        citations_mode: "strict",
        tone: "professional",
        include_visuals: false,
        include_audio: false,
        language: "en",
        cultural_context: "center_black_maternal_health",
        module_priority: ["pro_library", "symptoms", "stages", "community_resources", "mental_health"],
        session_length_hint: "medium",
        escalation_paths: [],
        image_policy: "on_demand",
      },
      new_parent: {
        persona: "new_parent",
        reading_level: "grade_6",
        explanation_depth: "basic",
        citations_mode: "light",
        tone: "warm",
        include_visuals: true,
        include_audio: false,
        language: "en",
        cultural_context: "center_black_maternal_health",
        module_priority: ["stages", "symptoms", "mental_health", "community_resources", "pro_library"],
        session_length_hint: "short",
        escalation_paths: [],
        image_policy: "always",
      },
      experienced_parent: {
        persona: "experienced_parent",
        reading_level: "grade_8",
        explanation_depth: "standard",
        citations_mode: "light",
        tone: "neutral",
        include_visuals: false,
        include_audio: false,
        language: "en",
        cultural_context: "center_black_maternal_health",
        module_priority: ["symptoms", "stages", "mental_health", "community_resources", "pro_library"],
        session_length_hint: "medium",
        escalation_paths: [],
        image_policy: "on_demand",
      },
      support_partner: {
        persona: "support_partner",
        reading_level: "grade_6",
        explanation_depth: "basic",
        citations_mode: "none",
        tone: "warm",
        include_visuals: true,
        include_audio: false,
        language: "en",
        cultural_context: "center_black_maternal_health",
        module_priority: ["stages", "community_resources", "mental_health", "symptoms", "pro_library"],
        session_length_hint: "short",
        escalation_paths: [],
        image_policy: "always",
      },
      advocate: {
        persona: "advocate",
        reading_level: "grade_10",
        explanation_depth: "standard",
        citations_mode: "light",
        tone: "neutral",
        include_visuals: false,
        include_audio: false,
        language: "en",
        cultural_context: "center_black_maternal_health",
        module_priority: ["community_resources", "pro_library", "mental_health", "stages", "symptoms"],
        session_length_hint: "medium",
        escalation_paths: [],
        image_policy: "on_demand",
      },
      general_user: {
        persona: "general_user",
        reading_level: "grade_8",
        explanation_depth: "standard",
        citations_mode: "light",
        tone: "neutral",
        include_visuals: false,
        include_audio: false,
        language: "en",
        cultural_context: "center_black_maternal_health",
        module_priority: ["stages", "symptoms", "mental_health", "community_resources", "pro_library"],
        session_length_hint: "medium",
        escalation_paths: [],
        image_policy: "on_demand",
      },
    };
    return { ...base[persona] };
  };

  const personaDefaultModules = (persona: Persona): string[] => {
    return baselineFor(persona).module_priority.slice();
  };

  const bumpByGoals = (mods: string[], selectedGoals: Goal[]): string[] => {
    const order: Goal[] = [
      "pro_insights",
      "symptom_tracking",
      "learn_stages",
      "mental_health",
      "culturally_relevant_guidance",
      "community_connection",
    ];
    const bumpMap: Record<Goal, string> = {
      pro_insights: "pro_library",
      symptom_tracking: "symptoms",
      learn_stages: "stages",
      mental_health: "mental_health",
      culturally_relevant_guidance: "community_resources",
      community_connection: "community_resources",
    };
    const next = mods.slice();
    order.forEach((g) => {
      if (selectedGoals.includes(g)) {
        const key = bumpMap[g];
        const i = next.indexOf(key);
        if (i > -1) {
          next.splice(i, 1);
          next.unshift(key);
        }
      }
    });
    return next;
  };

  const nudgeByStage = (mods: string[], trimester: string): string[] => {
    const t = trimester as "1" | "2" | "3" | "";
    const out = mods.slice();
    if (t === "1" || t === "2" || t === "3") {
      // ensure stages & symptoms are top-2
      ["symptoms", "stages"].forEach((m) => {
        const i = out.indexOf(m);
        if (i > -1) {
          out.splice(i, 1);
          out.unshift(m);
        }
      });
    }
    return out;
  };

  const deriveConfig = (): ChatbotConfig => {
    const persona = pickPersona(role);
    const cfg = baselineFor(persona);

    // Explanation style overrides
    if (explanationStyle === "visual_simple") {
      cfg.reading_level = "grade_6";
      cfg.explanation_depth = "basic";
      cfg.image_policy = "always";
    } else if (explanationStyle === "in_depth") {
      if (persona !== "clinician") {
        cfg.reading_level = "grade_10";
        cfg.explanation_depth = "scholarly";
        cfg.citations_mode = "strict";
        cfg.image_policy = "on_demand";
      }
    }

    // Term familiarity nudges
    if (termFamiliarity === "low") {
      cfg.reading_level = "grade_6";
      cfg.explanation_depth = "basic";
    } else if (termFamiliarity === "high") {
      if (explanationStyle === "in_depth" || persona === "clinician") {
        cfg.reading_level = "college";
      }
    }

    // Tone hard override
    if (tonePref) cfg.tone = tonePref;

    // Media prefs
    const wantsImages = mediaPrefs.includes("images");
    const wantsAudio = mediaPrefs.includes("audio");
    cfg.include_visuals = wantsImages || cfg.image_policy === "always";
    cfg.include_audio = wantsAudio;

    // Modules by persona → goals → stage
    let modules = personaDefaultModules(persona);
    modules = bumpByGoals(modules, goals);
    modules = nudgeByStage(modules, formData.trimester);
    cfg.module_priority = modules;

    // Session length by frequency
    if (usageFrequency === "daily") cfg.session_length_hint = "short";
    else if (usageFrequency === "weekly") cfg.session_length_hint = "medium";
    else if (usageFrequency === "occasional") cfg.session_length_hint = "deep_dive";

    // Escalations
    const esc: string[] = [];
    if (persona === "clinician" || explanationStyle === "in_depth") {
      esc.push("show_clinical_papers");
    }
    cfg.escalation_paths = esc;

    // Cultural guardrail (non-overridable)
    cfg.cultural_context = "center_black_maternal_health";

    return cfg;
  };

  const handleSubmit = async () => {
    console.log("Form Submitted:", { ...formData, role, termFamiliarity, explanationStyle, tonePref, mediaPrefs, goals, usageFrequency });
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

      const trimesterLabel =
        {
          "1": "first",
          "2": "second",
          "3": "third",
        }[formData.trimester] || undefined;

      // --- Firestore resource query (unchanged) ---
      const resourceQuery = query(
        collection(db, "resources"),
        where("trimester", "array-contains", trimesterLabel),
        where("location", "in", [formData.location, "national"])
      );
      const querySnapshot = await getDocs(resourceQuery);
      const resources = querySnapshot.docs.map((d) => d.data() as any);

      const formattedResources = resources.map((r: any) => ({
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

      // --- OpenAI call (unchanged – consider proxying server-side later) ---
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

      // --- NEW: normalize answers + derive chatbot config ---
      const normalizedAnswers = {
        role,
        gestational_stage: formData.trimester
          ? (["", "trimester_1", "trimester_2", "trimester_3"][
              Number(formData.trimester)
            ] as "trimester_1" | "trimester_2" | "trimester_3")
          : undefined,
        term_familiarity: termFamiliarity || undefined,
        explanation_style: explanationStyle || undefined,
        tone_pref: tonePref || undefined,
        media_prefs: mediaPrefs,
        goals,
        usage_frequency: usageFrequency || undefined,
      };

      const chatbotConfig = deriveConfig();

      // --- Save everything to Firestore (extends your existing write) ---
      await setDoc(doc(db, "users", user.uid), {
        name: formData.name,
        email: formData.email,
        location: formData.location,
        trimester: formData.trimester,
        dashboard: dashboardText,
        resources: formattedResources,
        onboardingAnswers: normalizedAnswers,
        chatbotConfig, // <- your router can read this to personalize chat
        updatedAt: new Date(),
      });

      console.log("✅ Data saved to Firestore!");

      // small UX pause
      await new Promise((resolve) => setTimeout(resolve, 500));

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
      <h2>👋 Let's get to know you</h2>

      <IonList>
        {/* ----- Existing fields ----- */}
        <IonItem>
          <IonLabel position="stacked">Name</IonLabel>
          <IonInput
            value={formData.name}
            placeholder="Enter your name"
            onIonChange={(e) => handleChange("name", e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Email</IonLabel>
          <IonInput
            type="email"
            value={formData.email}
            placeholder="Enter your email"
            onIonChange={(e) => handleChange("email", e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Location</IonLabel>
          <IonInput
            value={formData.location}
            placeholder="City or ZIP code"
            onIonChange={(e) => handleChange("location", e.detail.value!)}
          />
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Trimester</IonLabel>
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
      </IonList>

      {/* ----- NEW: Personalization section ----- */}
      <IonList style={{ marginTop: 16 }}>
        <IonListHeader>
          <IonLabel>
            <strong>Personalize your experience</strong>
            <IonNote color="medium" style={{ display: "block" }}>
              Help us tailor tone, visuals, and depth of explanations.
            </IonNote>
          </IonLabel>
        </IonListHeader>

        <IonItem>
          <IonLabel position="stacked">Which best describes you?</IonLabel>
          <IonSelect
            multiple
            value={role}
            placeholder="Select all that apply"
            onIonChange={(e) => setRole(e.detail.value as Role[])}
          >
            <IonSelectOption value="first_time_mom">First-time mom</IonSelectOption>
            <IonSelectOption value="experienced_mom">Experienced mom</IonSelectOption>
            <IonSelectOption value="medical_professional">Medical professional</IonSelectOption>
            <IonSelectOption value="support_partner">Support partner / family</IonSelectOption>
            <IonSelectOption value="community_advocate">Community advocate</IonSelectOption>
            <IonSelectOption value="other">Other</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Comfort with medical terminology</IonLabel>
          <IonSelect
            value={termFamiliarity}
            placeholder="Choose one"
            onIonChange={(e) => setTermFamiliarity(e.detail.value as TermFamiliarity)}
          >
            <IonSelectOption value="low">Low — keep it simple</IonSelectOption>
            <IonSelectOption value="medium">Medium — basics are fine</IonSelectOption>
            <IonSelectOption value="high">High — I'm trained/experienced</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Explanation style</IonLabel>
          <IonSelect
            value={explanationStyle}
            placeholder="Choose one"
            onIonChange={(e) => setExplanationStyle(e.detail.value as ExplanationStyle)}
          >
            <IonSelectOption value="visual_simple">Visual & simple</IonSelectOption>
            <IonSelectOption value="balanced">Balanced</IonSelectOption>
            <IonSelectOption value="in_depth">In-depth & research-backed</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Tone preference</IonLabel>
          <IonSelect
            value={tonePref}
            placeholder="Choose one"
            onIonChange={(e) => setTonePref(e.detail.value as TonePref)}
          >
            <IonSelectOption value="warm">Warm & encouraging</IonSelectOption>
            <IonSelectOption value="neutral">Neutral & factual</IonSelectOption>
            <IonSelectOption value="professional">Professional & direct</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Media preferences</IonLabel>
          <IonSelect
            multiple
            value={mediaPrefs}
            placeholder="Select any"
            onIonChange={(e) => setMediaPrefs(e.detail.value as MediaPref[])}
          >
            <IonSelectOption value="images">Include photos/diagrams</IonSelectOption>
            <IonSelectOption value="audio">Offer audio explanations</IonSelectOption>
            <IonSelectOption value="translation">Offer translations</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">Your goals (pick up to 3)</IonLabel>
          <IonSelect
            multiple
            value={goals}
            placeholder="Select goals"
            onIonChange={(e) => setGoals(e.detail.value as Goal[])}
          >
            <IonSelectOption value="learn_stages">Learn pregnancy stages</IonSelectOption>
            <IonSelectOption value="symptom_tracking">Understand symptoms</IonSelectOption>
            <IonSelectOption value="mental_health">Mental health support</IonSelectOption>
            <IonSelectOption value="pro_insights">Professional-grade insights</IonSelectOption>
            <IonSelectOption value="culturally_relevant_guidance">Culturally relevant guidance</IonSelectOption>
            <IonSelectOption value="community_connection">Community connection</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem>
          <IonLabel position="stacked">How often will you use MelaninRx?</IonLabel>
          <IonSelect
            value={usageFrequency}
            placeholder="Choose one"
            onIonChange={(e) => setUsageFrequency(e.detail.value as UsageFreq)}
          >
            <IonSelectOption value="daily">Daily</IonSelectOption>
            <IonSelectOption value="weekly">Weekly</IonSelectOption>
            <IonSelectOption value="occasional">Occasionally</IonSelectOption>
          </IonSelect>
        </IonItem>

        <IonItem lines="none">
          <IonText color="medium" style={{ fontSize: 12 }}>
            You can change these in Settings later.
          </IonText>
        </IonItem>
      </IonList>

      <IonButton expand="block" onClick={handleSubmit} style={{ marginTop: 16 }}>
        Submit
      </IonButton>
    </>
  );
};

export default OnboardingForm;
