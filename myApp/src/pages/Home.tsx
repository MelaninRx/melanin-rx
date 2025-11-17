import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
} from '@ionic/react';
import './Home.css';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { logoutUser } from '../services/authService';

const Home: React.FC = () => {
  const user = useCurrentUser();

  return (
    <IonPage className="home-page">
      <IonHeader className="home-header">
        <IonToolbar className="home-toolbar">
          <IonTitle className="home-app-title">MelaninRX</IonTitle>
          <IonButtons slot="end">
            <IonButton className="btn-ghost" routerLink="/community" routerDirection="root">
              Community
            </IonButton>
            <IonButton className="btn-ghost" onClick={logoutUser}>
              Logout
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="home-content">
        {/* Hero */}
        <section className="hero">
          <div className="hero-text">
            <h1 className="hero-title">
              Your pregnancy, your pace.
            </h1>
            <p className="hero-subtitle">
              {user?.email
                ? `Welcome back, ${user.email}.`
                : 'Personalized tools to navigate each trimester with confidence.'}
            </p>

            <div className="cta-row">
              <IonButton routerLink="/timeline" routerDirection="root" className="btn-primary">
                View Timeline
              </IonButton>
              <IonButton routerLink="/resources" routerDirection="root" className="btn-secondary">
                Find Care
              </IonButton>
              <IonButton routerLink="/chatbot" routerDirection="root" className="btn-outline">
                Ask the Chatbot
              </IonButton>
            </div>
          </div>
        </section>

        {/* Quick panels */}
        <section className="panels">
          <article className="panel-card">
            <h3 className="panel-title">Today’s Focus</h3>
            <p className="panel-body">
              Check your trimester checklist and plan one small step today.
            </p>
            <IonButton routerLink="/timeline" routerDirection="root" className="link-inline">Open Timeline</IonButton>
          </article>

          <article className="panel-card">
            <h3 className="panel-title">Community & Care</h3>
            <p className="panel-body">
              Explore trusted providers and resources tailored to you.
            </p>
            <IonButton routerLink="/resources" routerDirection="root" className="link-inline">Open Resources</IonButton>
          </article>

          <article className="panel-card">
            <h3 className="panel-title">Questions?</h3>
            <p className="panel-body">
              Ask MelaninRX for quick guidance and next steps.
            </p>
            <IonButton routerLink="/chatbot" routerDirection="root" className="link-inline">Open Chatbot</IonButton>
          </article>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Home;
