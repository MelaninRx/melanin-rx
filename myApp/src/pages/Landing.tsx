import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButton } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Landing.css';

const Landing: React.FC = () => {
  const history = useHistory();

  console.log('Landing loaded');

  const goToChatbot = () => {
    history.push('/chatbot');
  };

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>MelaninRx</IonTitle>
          <IonButton slot="end" onClick={goToChatbot}>Chatbot</IonButton>
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
