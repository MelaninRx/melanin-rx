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
  IonLabel,
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
            <IonButton onClick={() => document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' })}>
              Features
            </IonButton>
            <IonButton onClick={() => document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' })}>
              About Us
            </IonButton>
            <IonButton onClick={() => document.getElementById('faq')?.scrollIntoView({ behavior: 'smooth' })}>
              FAQ
            </IonButton>
            <IonButton routerLink="/auth">Log in</IonButton>
            <IonButton routerLink="/auth" fill="solid" className = "signup-btn">
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

            <IonButton routerLink ="/learnmore" className="learn-more-btn">Learn more</IonButton>
            </div>
          </section>


        {/* Section 2: feature */}
        <section id="features" className="feature-section">
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


        {/* Section 3: FAQ */}
        <section id="faq" className="faq-section">
          <h1 className="faq-title">Frequently Asked Questions</h1>

          <div className="faq-row">
          {/* Left: Message Box */}
            <div className="faq-message-box">
              <h1>Any Questions?</h1>
              <textarea placeholder="Your message..." />
              <IonButton className="faq-submit-btn">Send</IonButton>
              </div>

            {/* Right: FAQ Toggle List */}
            <div className="faq-toggle-list">
              <IonAccordionGroup>
                <IonAccordion value="q1">
                  <IonItem slot="header" lines="none">
                    <div className="faq-question-wrapper">
                      <h2 className="faq-question">Question 1</h2>
                      </div>
                    </IonItem>
                  <div className="accordion-content" slot="content">
                    <p>ANSWER</p>
                    </div>
                  </IonAccordion>

                <IonAccordion value="q2">
                  <IonItem slot="header" lines="none">
                    <div className="faq-question-wrapper">
                      <h2 className="faq-question">Question 2</h2>
                      </div>
                    </IonItem>
                  <div className="accordion-content" slot="content">
                    <p>ANSWER</p>
                    </div>
                  </IonAccordion>

                <IonAccordion value="q3">
                  <IonItem slot="header" lines="none">
                    <div className="faq-question-wrapper">
                      <h2 className="faq-question">Question 3</h2>
                      </div>
                    </IonItem>
                  <div className="accordion-content" slot="content">
                    <p>ANSWER</p>
                    </div>
                  </IonAccordion>
                </IonAccordionGroup>
              </div>
            </div>
          </section>

      </IonContent>
    </IonPage>
  );
};

export default Landing;
