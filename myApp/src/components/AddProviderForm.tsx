import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonSelect,
  IonSelectOption,
  IonTextarea,
  IonButton,
} from "@ionic/react";
import { MapContainer, TileLayer, Marker } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

// Custom map marker
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

interface AddProviderFormProps {
  isOpen: boolean;
  onClose: () => void;
}

const AddProviderForm: React.FC<AddProviderFormProps> = ({ isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [specialty, setSpecialty] = useState("");
  const [address, setAddress] = useState("");
  const [state, setState] = useState("MA");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [bio, setBio] = useState("");

  const handleSubmit = async () => {
    if (!name || !lat || !lng) {
      alert("Please provide name and coordinates.");
      return;
    }

    await addDoc(collection(db, "providers"), {
  name,
  specialty,
  address,
  state,
  lat: parseFloat(lat),
  lng: parseFloat(lng),
  bio,
  insurance: ["Not specified"],
  createdAt: serverTimestamp(),
});


    setName("");
    setSpecialty("");
    setAddress("");
    setLat("");
    setLng("");
    setBio("");
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={onClose} breakpoints={[0.75, 0.9]} initialBreakpoint={0.9}>

      <IonHeader>
        <IonToolbar>
          <IonTitle>Add a Provider</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding" scrollY={true}>

        <IonInput
          placeholder="Provider name"
          value={name}
          onIonChange={(e) => setName(e.detail.value!)}
        />
        <IonInput
          placeholder="Specialty"
          value={specialty}
          onIonChange={(e) => setSpecialty(e.detail.value!)}
        />
        <IonInput
          placeholder="Address"
          value={address}
          onIonChange={(e) => setAddress(e.detail.value!)}
        />
        <IonSelect value={state} onIonChange={(e) => setState(e.detail.value!)}>
          <IonSelectOption value="MA">Massachusetts</IonSelectOption>
          <IonSelectOption value="NY">New York</IonSelectOption>
          <IonSelectOption value="CA">California</IonSelectOption>
          <IonSelectOption value="TX">Texas</IonSelectOption>
          <IonSelectOption value="GA">Georgia</IonSelectOption>
          <IonSelectOption value="FL">Florida</IonSelectOption>
        </IonSelect>

        {/* --- Clickable map for coordinates --- */}
        <div style={{ height: "200px", marginTop: "12px" }}>
          {/* Add a ref to the MapContainer */}
          <MapContainer
            center={[42.36, -71.06]}
            zoom={6}
            style={{ height: "100%", width: "100%" }}
            whenReady={() => {}}
            ref={(mapRef: any) => {
              if (mapRef && mapRef.leafletElement && !mapRef._clickHandlerAdded) {
                mapRef.leafletElement.on("click", (e: any) => {
                  setLat(e.latlng.lat.toFixed(6));
                  setLng(e.latlng.lng.toFixed(6));
                });
                mapRef._clickHandlerAdded = true;
              }
            }}
          >
            <TileLayer url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png" />
            {lat && lng && (
              <Marker
                position={[parseFloat(lat), parseFloat(lng)]}
                icon={customIcon}
              />
            )}
          </MapContainer>
        </div>

        <IonInput
          placeholder="Latitude"
          value={lat}
          onIonChange={(e) => setLat(e.detail.value!)}
        />
        <IonInput
          placeholder="Longitude"
          value={lng}
          onIonChange={(e) => setLng(e.detail.value!)}
        />
        <IonTextarea
          placeholder="Provider bio"
          value={bio}
          onIonChange={(e) => setBio(e.detail.value!)}
        />

        <div
  style={{
    position: "sticky",
    bottom: 0,
    background: "white",
    padding: "12px 16px",
    borderTop: "1px solid #eee",
    boxShadow: "0 -4px 10px rgba(0,0,0,0.05)",
    zIndex: 10,
  }}
>
  <IonButton expand="block" onClick={handleSubmit}>
    Save Provider
  </IonButton>
</div>

      </IonContent>
    </IonModal>
  );
};

export default AddProviderForm;
