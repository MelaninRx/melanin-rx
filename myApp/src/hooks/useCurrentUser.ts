import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";
import { getFirestore, doc, onSnapshot } from "firebase/firestore";

export function useCurrentUser() {
  const [user, setUser] = useState<any>(undefined);
  
  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (firebaseUser) => {
      if (!firebaseUser) {
        setUser(null);
        return;
      }
      const db = getFirestore();
      const userDocRef = doc(db, "users", firebaseUser.uid);
      // Listen for real-time updates to the user doc
      const unsubDoc = onSnapshot(userDocRef, (userDoc) => {
        const profile = userDoc.exists() ? userDoc.data() : {};
        console.log("[useCurrentUser] onboardingComplete (realtime):", profile.onboardingComplete);
        setUser({ ...firebaseUser, ...profile });
      });
      // Clean up Firestore listener on unmount or auth change
      return unsubDoc;
    });
    return () => unsubAuth();
  }, []);
  
  return user;
}