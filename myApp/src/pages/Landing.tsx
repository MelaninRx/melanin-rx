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
import { useHistory } from 'react-router-dom';

const Landing: React.FC = () => {
  const history = useHistory();

  console.log('Landing loaded');

  const goToChatbot = () => {
    history.push('/chatbot');
  };

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
      <IonContent className="ion-padding">
        <h1>MelaninRx</h1>
        <p>Safeguard your pregnancy journey with MelaninRx.</p>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
