import { IonContent, IonHeader, IonPage, IonTitle, IonToolbar, IonButton } from '@ionic/react';
import ExploreContainer from '../components/ExploreContainer';
import './Home.css';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { logoutUser } from "../services/authService";



const Home: React.FC = () => {
  const user = useCurrentUser();
 
  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Home</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="ion-padding">
        <IonHeader collapse="condense">
          <IonToolbar>
            <IonTitle size="large">Welcome</IonTitle>
          </IonToolbar>
        </IonHeader>

        <ExploreContainer />

        <h1>Hello {user?.email}</h1>
        <IonButton onClick={logoutUser}>Logout</IonButton>
      </IonContent>
    </IonPage>
  );
};

export default Home;
