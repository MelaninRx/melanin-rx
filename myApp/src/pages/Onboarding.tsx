import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
} from "@ionic/react";
import OnboardingForm from "../components/OnboardUser";

const OnboardingPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Welcome to MelaninRx 💜</IonTitle>
        </IonToolbar>
      </IonHeader>
      <IonContent className="ion-padding">
        <OnboardingForm />
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;