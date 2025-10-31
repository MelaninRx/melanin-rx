import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import OnboardingForm from "../components/OnboardingForm";

const OnboardingPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome to MelaninRx 💜</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding ion-color-light">
        <div style={{ 
          background: '#ffffff', 
          color: '#000000', 
          minHeight: '100%',
          padding: '20px'
        }}>
          <OnboardingForm />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;