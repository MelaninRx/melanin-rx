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
            <IonButton routerLink="/signup" fill="solid" className = "signup-btn">
              Signup
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="landing-content">
        {/* Hero section */}
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

        {/* Facts Section */}
        <section className="facts-section">
          <div className="facts-content">
            <h2>According to the CDC:</h2>
            <p>
              “More than 80% of pregnancy-related deaths are preventable.” <br /> 
              & <br />
              “Black women are 3x more likely to die from pregnancy-related causes.”
              </p>
            <p>
              Our mission is to <strong>empower</strong> Black women to take control of their health by providing <strong>trusted</strong> research, <strong>amplifying</strong> community voices, and helping users <strong>communicate</strong> effectively with healthcare providers.
              </p>

            <IonButton routerLink ="/learnmore" className="learn-more-btn">Learn more</IonButton>
            </div>
          </section>


        {/* Section 2: feature */}
        <section className="feature-section">
          <h1 className="feature-title">Features</h1>
          <IonGrid>
            <IonRow className="feature-row">
              <IonCol size="12" sizeMd="4">
                <div className="feature-card">
                  <IonImg src="/assets/feature1.png" alt="Feature 1" className="feature-img" />
                  <div className="feature-text">
                    <h3>Chatbot</h3>
                    <p>Prepare for doctor visits and communicate your symptoms clearly.</p>
                    </div>
                  </div>
                </IonCol>
              
              <IonCol size="12" sizeMd="4">
                <div className="feature-card">
                  <IonImg src="/assets/feature2.png" alt="Feature 2" className="feature-img" />
                  <div className="feature-text">
                    <h3>Community</h3>
                    <p>Connect with other Black women for support and shared experiences.</p>
                    </div>
                  </div>
                </IonCol>

              <IonCol size="12" sizeMd="4">
                <div className="feature-card">
                  <IonImg src="/assets/feature3.png" alt="Feature 3" className="feature-img" />
                  <div className="feature-text">
                    <h3>Planner</h3>
                    <p>Keep track of upcoming appointments, jot down notes and questions for your visits.</p>
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </section>


        {/* Section 3: Testimonials */}
        <section className="faq-section">
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
