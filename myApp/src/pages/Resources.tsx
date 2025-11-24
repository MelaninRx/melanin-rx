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
  IonIcon,
} from "@ionic/react";
import { useState, useEffect, useMemo } from "react";
import { useCurrentUser } from "../hooks/useCurrentUser";
import { doc, getDoc, collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Resources.css";
import homeIcon from '../icons/house.svg';
import addIcon from '../icons/Vector.svg';
import menuIcon from '../icons/menu.svg';
import chatbotIcon from '../icons/message-square.svg';
import communityIcon from '../icons/users.svg';
import timelineIcon from '../icons/calendar-days.svg';
import AppointmentIcon from '../icons/Frame 112.svg';
import LogoutIcon from "../icons/log-out.svg";
import settingsIcon from '../icons/settings.svg';
import profileIcon from '../icons/circle-user-round.svg';
import { logoutUser } from '../services/authService';

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

  const fetchResources = async () => {
    console.log("🔹 Starting resource fetch...");
    try {
      // Fetch all documents from the top-level resources collection
      const resourcesSnapshot = await getDocs(collection(db, "resources"));
      // Map Firestore DocumentData to Resource type and add id
      const resourcesList = resourcesSnapshot.docs.map(doc => ({
        id: doc.id,
        ...(doc.data() as Resource)
      }));
      setResources(resourcesList);
      setLoading(false);
    } catch (error) {
      console.error("🔥 Error fetching resources:", error);
      setLoading(false);
    } finally {
      console.log("ℹ️ Stopping loading spinner");
    }
  };

  useEffect(() => {
    fetchResources();
  }, []);

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
      (r) => r && r.category && typeof r.category === 'string' && r.category.toLowerCase() === activeTab.toLowerCase()
    );
  }, [resources, activeTab]);

  // ✅ UI rendering
  return (
    <IonPage className="resources-page">
      
      <IonContent fullscreen>
        <aside className="side-panel">
          <div className="nav-top">
            <IonButton fill="clear" routerLink="/menu">
              <IonIcon icon={menuIcon} />
              <span className="menu-text">Menu</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/home">
              <IonIcon icon={homeIcon} />
              <span className="menu-text">Home</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/add">
              <IonIcon icon={addIcon} />
              <span className="menu-text">New Chat</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/chatbot">
              <IonIcon icon={chatbotIcon} />
              <span className="menu-text">Chats</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/community">
              <IonIcon icon={communityIcon} />
              <span className="menu-text">Communities</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/timeline">
              <IonIcon icon={timelineIcon} />
              <span className="menu-text">Timeline</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/appointments">
              <IonIcon icon={AppointmentIcon} />
              <span className="menu-text">Appointments</span>
            </IonButton>
          </div>
          <div className="nav-bottom">
            <IonButton fill='clear' onClick={logoutUser}>
              <IonIcon icon={LogoutIcon} />
              <span className="menu-text">Log out</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/settings">
              <IonIcon icon={settingsIcon} />
              <span className="menu-text">Setting</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/profile">
              <IonIcon icon={profileIcon} />
              <span className="menu-text">Profile</span>
            </IonButton>
          </div>
        </aside>

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading your recommended resources...</p>
          </div>
        ) : (
          <div className="resources-wrapper">
            <h1 className="resources-title">Recommended Resources</h1>

            {/* Category description - only show for active tab */}
            <div className="resources-category-descriptions" style={{ marginBottom: '16px', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              {categories.map((cat) => (
                activeTab === cat && (
                  <div key={cat} style={{ fontSize: '1.05rem', color: 'var(--color-primary)', fontWeight: 600, background: 'var(--color-light-purple)', borderRadius: '12px', padding: '8px 16px', boxShadow: '0 2px 8px rgba(127,93,140,0.10)', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
                    {cat === 'Community and peer support' && 'Connect with support groups and local services for expectant parents.'}
                    {cat === 'Doulas and midwives' && 'Find resources and organizations supporting Black doulas and midwives.'}
                    {cat === 'Educational resources' && 'Learn more about pregnancy, birth, and postpartum care.'}
                    {cat === 'Mental health support' && 'Access resources for emotional well-being during pregnancy.'}
                    {cat === 'National and community organizations' && 'Explore organizations working to improve Black maternal health and support families.'}
                    {/* Add more category descriptions as needed */}
                  </div>
                )
              ))}
            </div>

            {resources.length === 0 ? (
              <p>No resources found for your profile.</p>
            ) : (
              <>
                <div className="resources-tabs">
                  {categories.filter(cat => cat && cat.trim() !== '').map((cat) => (
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
                        {r.image && typeof r.image === 'string' && r.image.trim() !== '' ? (
                          <img
                            src={r.image}
                            alt={r.title}
                            className="resource-image"
                            style={{ width: '100%', maxHeight: '120px', objectFit: 'contain', marginBottom: '12px', borderRadius: '12px', background: '#fff' }}
                          />
                        ) : (
                          <div className="placeholder-image" style={{ height: '120px', background: '#f3e8ff', borderRadius: '12px', marginBottom: '12px' }}></div>
                        )}
                        {(() => {console.log('Resource image:', r.image, 'Resource url:', r.url); return null;})()}
                        <h3 className="resource-title">{r.title}</h3>
                        <p className="resource-description">{r.description}</p>
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="visit-website-btn"
                            style={{ display: 'inline-block', marginTop: '8px', padding: '8px 16px', background: 'var(--color-primary)', color: 'var(--text-light)', borderRadius: '8px', textDecoration: 'none', fontWeight: 600 }}
                          >
                            View Website
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
