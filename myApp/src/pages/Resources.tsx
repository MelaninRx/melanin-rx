import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButtons,
  IonButton,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import { useState, useEffect, useMemo } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Resources.css";

interface Resource {
  title: string;
  description: string;
  category: string;
  url?: string;
  image?: string;
}

const Resources: React.FC = () => {
  const user = useCurrentUser();
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("");

  // ✅ Fetch resources directly from user's Firestore document
  const fetchResources = async () => {
    console.log("🔹 Starting resource fetch...");
    if (!user) {
      console.warn("No user detected yet.");
      setLoading(false);
      return;
    }

    try {
      const userDocRef = doc(db, "users", user.uid);
      const userDoc = await getDoc(userDocRef);

      if (!userDoc.exists()) {
        console.warn("❌ No user document found — redirecting to onboarding.");
        window.location.href = "/onboarding";
        return;
      }

      const data = userDoc.data();
      console.log("✅ User data fetched:", data);

      if (!data.resources || data.resources.length === 0) {
        console.warn("⚠️ No resources found in Firestore document.");
        setResources([]);
      } else {
        console.log(`📦 Loaded ${data.resources.length} resources`);
        setResources(data.resources);
      }
    } catch (error) {
      console.error("🔥 Error fetching resources:", error);
    } finally {
      console.log("⏹️ Stopping loading spinner");
      setLoading(false);
    }
  };

  useIonViewWillEnter(() => {
    fetchResources();
  });

  // Optional: re-fetch when user changes
  useEffect(() => {
    if (user) fetchResources();
  }, [user]);

  // ✅ Category logic
  const categories = useMemo(() => {
    const unique = [...new Set(resources.map((r) => r.category))];
    return unique.sort();
  }, [resources]);

  useEffect(() => {
    if (resources.length > 0 && !activeTab) {
      setActiveTab(resources[0].category);
    }
  }, [resources, activeTab]);

  const filteredResources = useMemo(() => {
    if (!activeTab) return [];
    return resources.filter(
      (r) => r.category.toLowerCase() === activeTab.toLowerCase()
    );
  }, [resources, activeTab]);

  // ✅ UI rendering
  return (
    <IonPage className="resources-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton routerLink="/home" routerDirection="root" color="medium">
              Home
            </IonButton>
          </IonButtons>
          <IonTitle className="centered-title">Health Resources</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="resources-content">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading your recommended resources...</p>
          </div>
        ) : (
          <div className="resources-wrapper">
            <h1 className="resources-title">Recommended Resources</h1>

            {resources.length === 0 ? (
              <p>No resources found for your profile.</p>
            ) : (
              <>
                <div className="resources-tabs">
                  {categories.map((cat) => (
                    <button
                      key={cat}
                      className={`tab ${activeTab === cat ? "active" : ""}`}
                      onClick={() => setActiveTab(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <div className="resources-grid">
                  {filteredResources.length > 0 ? (
                    filteredResources.map((r, i) => (
                      <div key={i} className="resource-card">
                        {r.image ? (
                          <img
                            src={r.image}
                            alt={r.title}
                            className="resource-image"
                          />
                        ) : (
                          <div className="placeholder-image"></div>
                        )}
                        <h3 className="resource-title">{r.title}</h3>
                        <p className="resource-description">{r.description}</p>
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="visit-website-btn"
                          >
                            Visit Website
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p>No resources available in this category.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Resources;
