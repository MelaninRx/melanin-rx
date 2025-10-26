// // updateResources.ts
// import "dotenv/config";
// import { initializeApp } from "firebase/app";
// import { getFirestore, collection, addDoc } from "firebase/firestore";
// import resources from "./src/resources.json" assert { type: "json" };

// // ✅ Load env vars manually
// const firebaseConfig = {
//     apiKey: process.env.VITE_FIREBASE_API_KEY,
//     authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
//     projectId: process.env.VITE_FIREBASE_PROJECT_ID,
//     storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
//     messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
//     appId: process.env.VITE_FIREBASE_APP_ID,
// };

// const app = initializeApp(firebaseConfig);
// const db = getFirestore(app);

// async function uploadResources() {
//   const colRef = collection(db, "resources");
//   for (const item of resources) {
//     await addDoc(colRef, item);
//     console.log(`✅ Added ${item.title}`);
//   }
//   console.log("All resources uploaded!");
// }

// uploadResources();
