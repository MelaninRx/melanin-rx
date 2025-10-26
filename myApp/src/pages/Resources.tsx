import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonBackButton,
  IonButtons,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import { useState, useEffect, useMemo } from "react";
import { useLocation } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { logoutUser } from "../services/authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Resources.css";

interface Resource {
  title: string;
  description: string;
  category: string;
}

const Resources: React.FC = () => {
  const user = useCurrentUser();
  const location = useLocation<{ refresh?: boolean }>();
  const [userData, setUserData] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  

  const fetchDashboard = async () => {
    if (!user) return;

    setLoading(true);
    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      if (userDoc.exists()) {
        const data = userDoc.data();
        setUserData(data);
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  useIonViewWillEnter(() => {
    fetchDashboard();
  });

  useEffect(() => {
    if (location.state?.refresh) fetchDashboard();
  }, [location.state]);

  useEffect(() => {
    fetchDashboard();
  }, [user]);

  // ✅ Group resources by category
  const groupedResources = useMemo(() => {
    const groups: Record<string, Resource[]> = {};
    for (const resource of resources) {
      const category = resource.category || "Other";
      if (!groups[category]) groups[category] = [];
      groups[category].push(resource);
    }
    return groups;
  }, [resources]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Resources</IonTitle>
          <IonButtons slot="start">
                <IonBackButton defaultHref="/home" />
            </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="resources-content">
        {loading ? (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <IonSpinner name="crescent" />
            <p>Loading your personalized dashboard...</p>
          </div>
        ) : (
          <>
            {/* Container */}
            <div className="resources-container">
              {/* Pregnancy Info */}
              <section className="resource-section">
                <h3 className="section-heading">Your Pregnancy Journey</h3>
                <div className="card-grid">
                  <div className="resource-card">
                    <h3>Overview</h3>
                    <p>
                      <strong>Location:</strong> {userData?.location}
                      <br />
                      <strong>Trimester:</strong> {userData?.trimester}
                    </p>
                  </div>
                </div>
              </section>

              {/* Grouped Resource Sections */}
              {Object.keys(groupedResources).length > 0 ? (
                Object.entries(groupedResources).map(([category, items]) => (
                  <section key={category} className="resource-section">
                    <h3 className="section-heading">{category}</h3>
                    <div className="card-grid">
                      {items.map((r, i) => (
                        <div key={i} className="resource-card">
                          <h3>{r.title}</h3>
                          <p>{r.description}</p>
                        </div>
                      ))}
                    </div>
                  </section>
                ))
              ) : (
                <p>No resources found.</p>
              )}
            </div>
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Resources;
