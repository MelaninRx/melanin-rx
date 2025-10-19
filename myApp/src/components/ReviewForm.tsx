import React, { useState } from "react";
import {
  IonModal,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonInput,
  IonTextarea,
  IonButton,
} from "@ionic/react";
import { db } from "../firebaseConfig";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

interface ReviewFormProps {
  providerId: string;
  isOpen: boolean;
  onClose: () => void;
}

const ReviewForm: React.FC<ReviewFormProps> = ({ providerId, isOpen, onClose }) => {
  const [name, setName] = useState("");
  const [comment, setComment] = useState("");

  const handleSubmit = async () => {
    if (!comment.trim()) return;

    await addDoc(collection(db, "reviews"), {
      providerId,
      comment,
      userName: name || "Anonymous",
      createdAt: serverTimestamp(),
    });

    setComment("");
    setName("");
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

        <IonButton expand="block" style={{ marginTop: "350px" }} onClick={handleSubmit}>
          Submit
        </IonButton>
      </IonContent>
    </IonModal>
  );
};

export default ReviewForm;
