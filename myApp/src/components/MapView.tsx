import React, { useState, useEffect } from "react";
import {
  IonModal,
  IonContent,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButton,
  IonInput,
  IonTextarea,
  IonSelect,
  IonSelectOption,
  IonFooter,
  IonPage,
} from "@ionic/react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import {
  db
} from "../firebaseConfig";
import {
  collection,
  query,
  where,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

// ---------- Custom Marker ----------
const customIcon = new L.Icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

const seedProviders = [
  {
    id: "1",
    name: "Robin R Brown, MD",
    specialty: "OB/GYN",
    address: "50 W 77th St 1st Floor, New York, NY 10024",
    state: "NY",
    lat: 40.7775,
    lng: -73.9751,
    insurance: ["AETNA - Commercial", "AETNA - Medicare", "CIGNA Healthcare", "Centivo","EmblemHealth - GHI-PPO",
"Empire Blue Cross Blue Shield - Commercial/Exchange","Empire Blue Cross Blue Shield - Medicare","Horizon NJ",
"Magnacare-Health Care","Medicare - NJ","Medicare - NY","Multiplan PHCS","Oscar","Oxford - Freedom and Liberty",
"United Health Care - Commercial","United Health Care - Empire Plan","United Health Care - Oxford Care",
"United Health Care - Top Tier"],
    bio: "Board-certified obstetrician-gynecologist in the Department of Obstetrics, Gynecology and Reproductive Science at the Icahn School of Medicine at Mount Sinai.",
  },
  {
    id: "2",
    name: "Emily Blanton, MD",
    specialty: "Gynecologist",
    address: "90 Maiden Lane, Suite 300, New York, NY 10038",
    state: "NY",
    lat: 40.7053,
    lng: -74.0071,
    insurance: ["Unknown"],
    bio: "A board certified gynecologist who has a proven track record when it comes to putting others first in her medical career, earning awards in each year of her postgraduate studies for commitment to her fellow healthcare professionals, dedication to selfless patient care, and technical skills.",
  },
  {
    id: "3",
    name: "Antonette Whitehead, MD",
    specialty: "OB/GYN",
    address: "568 Broadway, Suite 304 & 404. New Yoxqrk, NY 10012",
    state: "NY",
    lat: 40.7251,
    lng: -74.0039,
    insurance: ["AETNA", "CIGNA", "EMPIRE BLUE CROSS BLUE SHIELD", "MULTIPLAN/PHCS – PPO ONLY", "Emblem health (GHI) – PPO/EPO", "NYS Empire Plan", "OXFORD", "UNITED HEALTHCARE", "Medicare"],
    bio: "Dr. Antonette Whitehead joined the Downtown Women OB/GYN team in August 2011.  Moving her practice from the Midwest, she enjoys delivering gynecologic and obstetric care to the women of New York City.",
  },
];


// ---------- Fix for Leaflet Rendering ----------
const ResizeMap: React.FC = () => {
  const map = useMap();
  useEffect(() => {
    setTimeout(() => map.invalidateSize(), 200);
  }, [map]);
  return null;
};

const MapMover: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();
  useEffect(() => {
    map.setView(center, 7); // zoomed out to show state
  }, [center]);
  return null;
};


// ---------- Reviews List ----------

interface Review {
  id: string;
  providerId: string;
  comment: string;
  userName?: string;
  createdAt?: any;
}

export const ReviewsList: React.FC<{ providerId: string }> = ({ providerId }) => {
  const [reviews, setReviews] = useState<Review[]>([]);

  useEffect(() => {
    if (!providerId) return;

    const q = query(
      collection(db, "reviews"),
      where("providerId", "==", providerId),
      orderBy("createdAt", "desc")
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetched = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Review[];

      setReviews(fetched);
    });

    return () => unsubscribe(); // ✅ cleanup
  }, [providerId]);

  console.log("Reviews:", reviews);


  if (reviews.length === 0) {
    return <p>No reviews yet. Be the first to write one!</p>;
  }

  return (
  <ul style={{ listStyle: "none", padding: 0 }}>
    {reviews.map((r) => (
      <li
        key={r.id}
        style={{
          marginBottom: "12px",
          padding: "12px",
          borderRadius: "10px",
          background: "#f9f9fb",
          boxShadow: "0 1px 3px rgba(0,0,0,0.08)",
        }}
      >
        <p style={{ marginBottom: "6px", color: "#333" }}>
          {r.comment}
        </p>

        {r.userName && (
          <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>
            — {r.userName}
          </p>
        )}

        {r.createdAt?.toDate && (
          <small style={{ color: "#999" }}>
            {r.createdAt.toDate().toLocaleDateString()}
          </small>
        )}
      </li>
    ))}
  </ul>
);

};


// ---------- Review Form ----------
const ReviewForm = ({
  providerId,
  isOpen,
  onClose,
}: {
  providerId: string;
  isOpen: boolean;
  onClose: () => void;
}) => {
  const [name, setName] = useState("");
  const [rating, setRating] = useState<number>(5);
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
  if (!comment.trim()) return;
  await addDoc(collection(db, "reviews"), {
    providerId,       // ✅ must match ReviewsList filter
    comment,
    createdAt: serverTimestamp(),
  });
  setComment("");
  onClose();
};

  return (
  <IonModal isOpen={isOpen} onDidDismiss={onClose}>
    <IonHeader>
      <IonToolbar>
        <IonTitle>Write a Review</IonTitle>
      </IonToolbar>
    </IonHeader>

    <IonContent className="ion-padding">
      <IonInput
        placeholder="Your name (optional)"
        value={name}
        onIonChange={(e) => setName(e.detail.value!)}
      />

      <IonTextarea
        placeholder="Share your experience..."
        value={comment}
        onIonChange={(e) => setComment(e.detail.value!)}
      />

      
      <IonButton
        expand="block"
        style={{ marginTop: "350px" }}
        onClick={handleSubmit}
      >
        Submit
      </IonButton>
    </IonContent>
  </IonModal>
);








};

// ---------- Main MapView ----------
const MapView: React.FC = () => {
  const [selected, setSelected] = useState<any | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [showReviewForm, setShowReviewForm] = useState(false);

  const [selectedState, setSelectedState] = useState("MA");

  const stateCenters: Record<string, [number, number]> = {
    MA: [42.36, -71.06],
    NY: [40.71, -74.00],
    CA: [36.77, -119.42],
    TX: [31.97, -99.90],
    GA: [33.75, -84.39],
    FL: [27.99, -81.76],
  };

  const handleMarkerClick = (place: any) => {
    setSelected(place);
    setShowModal(true);
  };

  const MapMover: React.FC<{ center: [number, number] }> = ({ center }) => {
  const map = useMap();

  useEffect(() => {
    const currentZoom = map.getZoom(); // 👈 save user zoom
    map.setView(center, currentZoom);  // 👈 keep that zoom
  }, [center]);

  return null;
};

  return (
    <div
      style={{
        padding: "16px",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        background: "#f4f4f8",
        height: "100vh",
      }}
    >
      <IonSelect
          placeholder="Select State"
          value={selectedState}
          onIonChange={(e) => setSelectedState(e.detail.value!)}
          style={{
            width: "90%",
            margin: "12px auto",
            borderRadius: "12px",
            boxShadow: "0 2px 6px rgba(0,0,0,0.1)",
          }}
        >
          <IonSelectOption value="MA">Massachusetts</IonSelectOption>
          <IonSelectOption value="NY">New York</IonSelectOption>
          <IonSelectOption value="CA">California</IonSelectOption>
          <IonSelectOption value="TX">Texas</IonSelectOption>
          <IonSelectOption value="GA">Georgia</IonSelectOption>
          <IonSelectOption value="FL">Florida</IonSelectOption>
        </IonSelect>
      {/* ---- Compact, rounded map ---- */}
      <div
        style={{
          width: "100%",
          height: "60vh",
          borderRadius: "20px",
          overflow: "hidden",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
        }}
      >
        

        <MapContainer
          center={stateCenters[selectedState]}
          zoom={7}
          style={{ height: "100%", width: "100%" }}
        >
          <MapMover center={stateCenters[selectedState]} />
          <TileLayer
            url="https://{s}.tile.openstreetmap.fr/hot/{z}/{x}/{y}.png"
            attribution="© OpenStreetMap contributors"
          />
          <ResizeMap />

          {seedProviders
            .filter((p) => p.state === selectedState)
            .map((place) => (
              <Marker
                key={place.id}
                position={[place.lat, place.lng]}
                icon={customIcon}
                eventHandlers={{
                  click: () => handleMarkerClick(place),
                }}
              />
            ))}
        </MapContainer>
      </div>

      <div style={{ marginTop: "16px", textAlign: "center" }}>
        <h2 style={{ margin: "0", color: "#333" }}>Explore Trusted Providers</h2>
        <p style={{ color: "#777", fontSize: "14px" }}>
          Tap a pin to see details and reviews.
        </p>
      </div>

      {/* ---- Provider Modal ---- */}
      <IonModal
  isOpen={showModal}
  onDidDismiss={() => setShowModal(false)}
  initialBreakpoint={1}
  breakpoints={[0, 0.45, 0.75, 0.9]}
>
  <IonHeader>
    <IonToolbar>
      <IonTitle>{selected?.name}</IonTitle>
    </IonToolbar>
  </IonHeader>

  {/* Full container for scroll + fixed footer */}
  <div
    style={{
      position: "relative",
      display: "flex",
      flexDirection: "column",
      height: "100%",
      background: "white",
    }}
  >
    {/* ---- Scrollable doctor + reviews area ---- */}
    <IonContent
      style={{
        flex: 1,
        overflowY: "auto",
        padding: "16px",
        paddingBottom: "90px", // 👈 keeps space for the button, but scroll still works
      }}
    >
      {selected && (
        <>
          <p><strong>Specialty:</strong> {selected.specialty}</p>
          <p><strong>Address:</strong> {selected.address}</p>
          <p><strong>Insurance:</strong> {selected.insurance.join(", ")}</p>
          <p>{selected.bio}</p>

          <h3 style={{ marginTop: "24px" }}>Community Reviews</h3>
          <ReviewsList providerId={selected.id} />
        </>
      )}
    </IonContent>

    {/* ---- Fixed "Write a Review" button ---- */}
    <div
      style={{
        position: "sticky", // 👈 keeps it visible during scroll
        bottom: 0,
        background: "white",
        padding: "12px 16px",
        borderTop: "1px solid #eee",
        boxShadow: "0 -4px 10px rgba(0,0,0,0.05)",
        zIndex: 10,
      }}
    >
      <IonButton expand="block" onClick={() => setShowReviewForm(true)}>
        Write a Review
      </IonButton>
    </div>
  </div>
</IonModal>




      {/* ---- Review Form Modal ---- */}
      {selected && (
        <ReviewForm
          providerId={selected.id}
          isOpen={showReviewForm}
          onClose={() => setShowReviewForm(false)}
        />
      )}
    </div>
  );
};

export default MapView;
