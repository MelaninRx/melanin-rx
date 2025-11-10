import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon
} from "@ionic/react";
import OnboardingForm from "../components/OnboardingForm";
import './Onboarding.css';
import MelaninRxIcon from '../icons/MelaninRX.svg';

const OnboardingPage: React.FC = () => {
  return (
    <IonPage>
      <IonHeader className="onboarding-header">
        <IonToolbar>
          <div className="header-left">
            <IonIcon src={MelaninRxIcon} className="brand-logo" />
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent className="onboarding-bg">
        <OnboardingForm />
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;