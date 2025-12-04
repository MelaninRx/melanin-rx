import {
  IonContent,
  IonPage,
  IonSpinner,
} from "@ionic/react";
import { useState, useEffect, useMemo } from "react";
import { collection, getDocs } from "firebase/firestore";
import { db } from "../firebaseConfig";
import "./Resources.css";
import SidebarNav from "../components/SidebarNav";
import MobileMenuButton from '../components/MobileMenuButton';

interface Resource {
  title: string;
  description: string;
  category: string;
  url?: string;
  image?: string;
}

const Resources: React.FC = () => {
  const [resources, setResources] = useState<Resource[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<string>("");

  const fetchResources = async () => {
    console.log("🔹 Starting resource fetch...");
    try {
      const resourcesSnapshot = await getDocs(collection(db, "resources"));
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

  return (
    <IonPage className="resources-page">
      <IonContent fullscreen>
        <MobileMenuButton />
        <SidebarNav />

        {loading ? (
          <div className="loading-container">
            <IonSpinner name="crescent" />
            <p>Loading your recommended resources...</p>
          </div>
        ) : (
          <div className="resources-wrapper">
            <h1 className="page-title">Resources</h1>

            <div className="category-description-container">
              {categories.map((cat) => (
                activeTab === cat && (
                  <div key={cat} className="category-description">
                    {cat === 'Community and peer support' && 'Connect with support groups and local services for expectant parents.'}
                    {cat === 'Doulas and midwives' && 'Find resources and organizations supporting Black doulas and midwives.'}
                    {cat === 'Educational resources' && 'Learn more about pregnancy, birth, and postpartum care.'}
                    {cat === 'Mental health support' && 'Access resources for emotional well-being during pregnancy.'}
                    {cat === 'National and community organizations' && 'Explore organizations working to improve Black maternal health and support families.'}
                  </div>
                )
              ))}
            </div>

            {resources.length === 0 ? (
              <p className="no-resources">No resources found for your profile.</p>
            ) : (
              <>
                <div className="tab-buttons">
                  {categories.filter(cat => cat && cat.trim() !== '').map((cat) => (
                    <button
                      key={cat}
                      className={`tab-button ${activeTab === cat ? "active" : ""}`}
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
                          />
                        ) : (
                          <div className="resource-image-placeholder"></div>
                        )}
                        {(() => {console.log('Resource image:', r.image, 'Resource url:', r.url); return null;})()}
                        <h3 className="resource-title">{r.title}</h3>
                        <p className="resource-description">{r.description}</p>
                        {r.url && (
                          <a
                            href={r.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="visit-button"
                          >
                            Visit Website
                          </a>
                        )}
                      </div>
                    ))
                  ) : (
                    <p className="no-resources">No resources available in this category.</p>
                  )}
                </div>
              </>
            )}
          </div>
        )}
        
        <div className="footer"></div>
      </IonContent>
    </IonPage>
  );
};

export default Resources;
