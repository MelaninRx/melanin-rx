import { IonPage, IonContent } from "@ionic/react";
import MapView from "../components/MapView";

const MapPage: React.FC = () => {
  return (
    <IonPage>
      <IonContent fullscreen>
        <MapView />
      </IonContent>
    </IonPage>
  );
};

export default MapPage;
