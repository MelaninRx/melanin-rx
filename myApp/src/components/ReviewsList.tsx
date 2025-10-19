import React, { useEffect, useState } from "react";
import { db } from "../firebaseConfig";
import { collection, query, where, orderBy, onSnapshot } from "firebase/firestore";

interface Review {
  id: string;
  providerId: string;
  comment: string;
  userName?: string;
  createdAt?: any;
}

interface ReviewsListProps {
  providerId: string;
}

const ReviewsList: React.FC<ReviewsListProps> = ({ providerId }) => {
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

    return () => unsubscribe();
  }, [providerId]);

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
          <p style={{ marginBottom: "6px", color: "#333" }}>{r.comment}</p>

          {r.userName && (
            <p style={{ fontSize: "13px", color: "#666", margin: 0 }}>— {r.userName}</p>
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

export default ReviewsList;
