import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonGrid,
  IonRow,
  IonCol,
  IonImg,
  IonAccordionGroup,
  IonAccordion,
  IonItem,
} from '@ionic/react';
import logoIcon from '../icons/MelaninRX.svg';

import './Landing.css';
import 'typeface-source-serif-pro';

const Landing: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="landing-header">
        <IonToolbar className="landing-toolbar">

          <IonButtons slot="end" className="nav-links">
            <IonButton onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
              About Us
            </IonButton>
            <IonButton onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Features
            </IonButton>
            <IonButton routerLink="/auth">Log in</IonButton>
            <IonButton routerLink="/auth" fill="solid" className = "signup-btn" style={{color: 'white'}}>
              Signup
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        

        {/* Hero section */}
        <section className="hero-section">
          <div className="hero-left">
            <div className="hero-text">
              <h1>Bridging Gaps in Black Women's Healthcare</h1>
              <p>Helping Black women communcate clearer with providers, grounded in trusted research</p>
              </div>
            </div>
                
          <div className="hero-right">
            <IonImg src={logoIcon} alt="Hero Image" className="hero-img" />
            </div>
          </section>

        {/* Facts Section */}
        <section id="about" className="facts-section">
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

            </div>
          </section>


        {/* Section 2: feature */}
        <section id="features" className="feature-section">
          <h1 className="feature-title">Features</h1>
          <IonGrid>
            <IonRow className="feature-row">
              <IonCol size="12" sizeMd="4">
                <div className="feature-card">
                  <IonImg src="/chatbot_feature.png" alt="Feature 1" className="feature-img" />
                  <div className="feature-text">
                    <h3>Chatbot</h3>
                    <p>Prepare for doctor visits and communicate your symptoms clearly.</p>
                    </div>
                  </div>
                </IonCol>
              
              <IonCol size="12" sizeMd="4">
                <div className="feature-card">
                  <IonImg src="/timeline_feature.png" alt="Feature 2" className="feature-img" />
                  <div className="feature-text">
                    <h3>Timeline</h3>
                    <p>Keep track of your pregnancy through the weeks and trimesters.</p>
                    </div>
                  </div>
                </IonCol>

              <IonCol size="12" sizeMd="4">
                <div className="feature-card">
                  <IonImg src="/planner_feature.png" alt="Feature 3" className="feature-img" />
                  <div className="feature-text">
                    <h3>Planner</h3>
                    <p>Keep track of upcoming appointments, jot down notes and questions for your visits.</p>
                    </div>
                  </div>
                </IonCol>
              </IonRow>
            </IonGrid>
          </section>
      </IonContent>
    </IonPage>
  );
};

export default Landing;