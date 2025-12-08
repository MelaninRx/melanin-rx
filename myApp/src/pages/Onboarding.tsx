import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonIcon,
  IonButtons,
  IonButton,
  IonSpinner
} from "@ionic/react";
import OnboardingForm from "../components/OnboardingForm";
import './Onboarding.css';
import MelaninRxIcon from '../icons/MelaninRX.svg';
import homeIcon from '../icons/house.svg';
import addIcon from '../icons/Vector.svg';
import menuIcon from '../icons/menu.svg';
import chatbotIcon from '../icons/message-square.svg';
import communityIcon from '../icons/users.svg';
import timelineIcon from '../icons/calendar-days.svg';
import AppointmentIcon from '../icons/Frame 112.svg';
import LogoutIcon from "../icons/log-out.svg";
import settingsIcon from '../icons/settings.svg';
import profileIcon from '../icons/circle-user-round.svg';
import { logoutUser } from '../services/authService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { Redirect } from 'react-router-dom';

const OnboardingPage: React.FC = () => {
  const user = useCurrentUser();
  
  // NOTE: All onboarding redirects removed. If onboarding data is missing, user will stay on the current page and see the form or loading spinner.
  // If onboardingComplete is not true, user remains here. No redirect to /onboarding.
  if (user === undefined) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ textAlign: 'center', marginTop: '50%' }}>
            <IonSpinner />
            <p>Loading your profile data...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  return (
    <IonPage>
      
      <IonContent fullscreen>
        <OnboardingForm />
      </IonContent>
    </IonPage>
  );
};

export default OnboardingPage;