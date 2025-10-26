import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonSpinner,
  useIonViewWillEnter,
} from "@ionic/react";
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { logoutUser } from "../services/authService";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebaseConfig";

interface Resource {
  title: string;
  description: string;
  category: string;
}

const Home: React.FC = () => {
  const user = useCurrentUser();
  const location = useLocation<{ refresh?: boolean }>();
  const [userData, setUserData] = useState<any>(null);
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchDashboard = async () => {
    if (!user) {
      console.log("Waiting for user...");
      return;
    }

    console.log("Fetching dashboard for user:", user.uid);
    setLoading(true);

    try {
      const userDoc = await getDoc(doc(db, "users", user.uid));
      console.log("User doc exists:", userDoc.exists());
      
      if (userDoc.exists()) {
        const data = userDoc.data();
        console.log("User data:", data);
        setUserData(data);
        setResources(data.resources || []);
      }
    } catch (error) {
      console.error("Error loading dashboard:", error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data every time the page becomes active (Ionic lifecycle)
  useIonViewWillEnter(() => {
    console.log("Page entering - fetching dashboard");
    fetchDashboard();
  });

  // Also fetch when coming from onboarding with refresh flag
  useEffect(() => {
    if (location.state?.refresh) {
      console.log("Refresh flag detected - fetching dashboard");
      fetchDashboard();
    }
  }, [location.state]);

  // Initial fetch on mount
  useEffect(() => {
    fetchDashboard();
  }, [user]);

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <h2>Hello {userData?.name || user?.email || "Guest"}</h2>
        <IonButton onClick={logoutUser}>Logout</IonButton>

        {loading ? (
          <div style={{ textAlign: "center", marginTop: "2rem" }}>
            <IonSpinner name="crescent" />
            <p>Loading your personalized dashboard...</p>
          </div>
        ) : (
          <>
            <IonCard style={{ marginTop: "20px" }}>
              <IonCardHeader>
                <IonCardTitle>Your Pregnancy Journey</IonCardTitle>
              </IonCardHeader>
              <IonCardContent>
                <p><strong>Location:</strong> {userData?.location}</p>
                <p><strong>Trimester:</strong> {userData?.trimester}</p>
              </IonCardContent>
            </IonCard>

            <h3 style={{ marginTop: "20px", marginBottom: "10px" }}>
              Resources for You
            </h3>

            {resources.length > 0 ? (
              resources.map((resource, index) => (
                <IonCard key={index} style={{ marginBottom: "15px" }}>
                  <IonCardHeader>
                    <IonCardTitle style={{ fontSize: "18px" }}>
                      {resource.title}
                    </IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    <p>{resource.description}</p>
                    {resource.category && (
                      <p style={{ 
                        marginTop: "10px", 
                        fontSize: "12px", 
                        color: "#666",
                        fontStyle: "italic" 
                      }}>
                        Category: {resource.category}
                      </p>
                    )}
                  </IonCardContent>
                </IonCard>
              ))
            ) : (
              <p>No resources found.</p>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;