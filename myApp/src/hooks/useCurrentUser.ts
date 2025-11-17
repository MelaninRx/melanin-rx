import { useState, useEffect } from "react";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "../firebaseConfig";

export function useCurrentUser() {
  // Start as undefined so screens can distinguish "auth initializing" state
  const [user, setUser] = useState<any>(undefined);
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, setUser);
    return () => unsub();
  }, []);
  return user;
}
