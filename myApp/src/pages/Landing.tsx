import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonCard,
  IonCardHeader,
  IonCardTitle,
  IonCardContent,
  IonImg
} from '@ionic/react';
import './Landing.css';
import 'typeface-source-serif-pro';

const Landing: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="landing-header">
        <IonToolbar className="landing-toolbar">
          <div className="logo-section">
            <IonImg src="/assets/logo.png" alt="App Logo" className="logo" />
          </div>

          <IonButtons slot="end" className="nav-links">
            <IonButton routerLink="/features">Features</IonButton>
            <IonButton routerLink="/about">About Us</IonButton>
            <IonButton routerLink="/login">Log in</IonButton>
            <IonButton routerLink="/signup" fill="solid" className = "signup">
              Signup
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="landing-content">
        {/* Hero 区块 */}
        <section className="hero-section">
          <div className="hero-left">
            <div className="hero-text">
              <h1>Bridging Gaps in Black Women's Healthcare</h1>
              <p>Helping Black women communcate clearer with providers, grounded in trusted research</p>
              </div>
            <div className="hero-buttons">
              <IonButton routerLink="/chat" className="cta-btn">
              Chat now
              </IonButton>
              <IonButton routerLink="/explore" className="cta-btn-outline">
              Explore
              </IonButton>
              </div>
            </div>
                
          <div className="hero-right">
            <IonImg src="/assets/hero-image.png" alt="Hero Image" className="hero-img" />
            </div>
          </section>

        {/* 三个功能块 */}
        <IonGrid fixed className="features-section">
          <IonRow>
            <IonCol size="12" sizeMd="4">
              <IonCard className="feature-card">
                <IonCardHeader>
                  <IonCardTitle>🚀 Fast</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Enjoy lightning-fast performance powered by Ionic and React.
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="4">
              <IonCard className="feature-card">
                <IonCardHeader>
                  <IonCardTitle>💡 Smart</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  Intelligent design and automation make your work seamless.
                </IonCardContent>
              </IonCard>
            </IonCol>

            <IonCol size="12" sizeMd="4">
              <IonCard className="feature-card">
                <IonCardHeader>
                  <IonCardTitle>🎨 Beautiful</IonCardTitle>
                </IonCardHeader>
                <IonCardContent>
                  A modern, elegant interface designed for productivity.
                </IonCardContent>
              </IonCard>
            </IonCol>
          </IonRow>
        </IonGrid>

        {/* Section 2: Advantages */}
        <section className="advantages-section">
          <h2>Why Choose Us</h2>
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="6">
                <IonCard className="adv-card">
                  <IonCardHeader>
                    <IonCardTitle>Reliable</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    We ensure uptime, security, and reliability for all users.
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeMd="6">
                <IonCard className="adv-card">
                  <IonCardHeader>
                    <IonCardTitle>Support</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    24/7 customer support to help you anytime.
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        {/* Section 3: Testimonials */}
        <section className="testimonials-section">
          <h2>What Our Users Say</h2>
          <IonGrid>
            <IonRow>
              <IonCol size="12" sizeMd="4">
                <IonCard className="testimonial-card">
                  <IonCardHeader>
                    <IonCardTitle>John Doe</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    "This app changed the way I work. Fast and intuitive!"
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonCard className="testimonial-card">
                  <IonCardHeader>
                    <IonCardTitle>Jane Smith</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    "Amazing design and smooth experience. Highly recommend!"
                  </IonCardContent>
                </IonCard>
              </IonCol>
              <IonCol size="12" sizeMd="4">
                <IonCard className="testimonial-card">
                  <IonCardHeader>
                    <IonCardTitle>Bob Lee</IonCardTitle>
                  </IonCardHeader>
                  <IonCardContent>
                    "Reliable and feature-rich. Best app I have used."
                  </IonCardContent>
                </IonCard>
              </IonCol>
            </IonRow>
          </IonGrid>
        </section>

        {/* 页脚 */}
        <footer className="landing-footer">
          <p>© {new Date().getFullYear()} MyApp. All rights reserved.</p>
        </footer>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
