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
import { useLocation } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { doc, getDoc, collection, getDocs, query, where } from "firebase/firestore";
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
  const location = useLocation<{ refresh?: boolean }>();
  const [userData, setUserData] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("");

  // 🔹 Fetch user data + resources from Firestore
  const fetchDashboard = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);

        const trimesterLabel =
          data.trimester === "1"
            ? "first"
            : data.trimester === "2"
            ? "second"
            : data.trimester === "3"
            ? "third"
            : null;

        let resourceQuery = collection(db, "resources");

        if (trimesterLabel && data.location) {
          resourceQuery = query(
            collection(db, "resources"),
            where("trimester", "array-contains", trimesterLabel),
            where("location", "in", [data.location, "national"])
          ) as any;
        } else if (trimesterLabel) {
          resourceQuery = query(
            collection(db, "resources"),
            where("trimester", "array-contains", trimesterLabel)
          ) as any;
        }

        const querySnapshot = await getDocs(resourceQuery);
        const firestoreResources = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        const formattedResources = firestoreResources.map((r: any) => ({
          title: r.title?.trim() || "Untitled",
          description: r.description?.trim() || "",
          category: r.category || "General",
          url: r.url || r.website || "",
          image: r.image || r.logo || "",
        }));

        setResources(formattedResources);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

 // FIX: wrap async function call
useIonViewWillEnter(() => {
  fetchDashboard();
});

  useEffect(() => {
    if ((location.state as any)?.refresh) fetchDashboard();
  }, [location.state]);
  useEffect(() => {
    fetchDashboard();
  }, [user]);

  // 🔹 Dynamically generate list of unique categories
  const categories = useMemo(() => {
    const unique = [...new Set(resources.map((r) => r.category))];
    return unique.sort(); // optional alphabetical sort
  }, [resources]);

  // 🔹 Initialize first tab automatically
  useEffect(() => {
    if (resources.length > 0 && !activeTab) {
      setActiveTab(resources[0].category);
    }
  }, [resources, activeTab]);

  // 🔹 Filter resources by selected tab/category
  const filteredResources = useMemo(() => {
    if (!activeTab) return [];
    return resources.filter(
      (r) => r.category.toLowerCase() === activeTab.toLowerCase()
    );
  }, [resources, activeTab]);

  // Debug logging
  useEffect(() => {
    if (resources.length > 0) {
      console.log("📋 Total resources:", resources.length);
      console.log("📋 Categories:", categories);
      console.log("📋 Active tab:", activeTab);
      console.log("📋 Filtered resources:", filteredResources.map((r) => r.title));
    } else {
      console.log("⚠️ No resources loaded");
    }
  }, [resources, activeTab, filteredResources]);

  return (
    <IonPage className="resources-page">
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonButton routerLink="/home" routerDirection="root" color="medium">
              Home
            </IonButton>
          </IonButtons>
          <IonTitle className="centered-title">Resources</IonTitle>
        </IonToolbar>
      </IonHeader>


      <IonContent className="resources-content">
        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading your personalized dashboard...</p>
          </div>
        ) : (
          <div className="resources-wrapper">
            <h1 className="resources-title">Your Resources</h1>

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
                    <div className="resource-image">
                      {r.image ? (
                        <img src={r.image} alt={r.title} />
                      ) : (
                        <div className="placeholder-image"></div>
                      )}
                    </div>
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
                <div className="no-resources">
                  <p>No resources found in this category.</p>
                </div>
              )}
            </div>

            <footer className="resources-footer" />
          </div>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Resources;