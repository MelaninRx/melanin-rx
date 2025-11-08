import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon
} from "@ionic/react";
import OnboardingForm from "../components/OnboardingForm";
import "./Onboarding.css"
import MelaninRxIcon from '../icons/MelaninRX.svg';

const OnboardingPage: React.FC = () => {
  return (
    <IonPage>
      
      <IonHeader className="onboarding-header">
        <IonToolbar>
          <div className="header-left">
            <IonIcon icon={MelaninRxIcon} />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="onboarding-bg">
        <div className="onboarding-container">
          <div className="onboarding-card"> 
            <OnboardingForm />
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;