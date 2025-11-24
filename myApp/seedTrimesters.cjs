const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where } = require("firebase/firestore");
require("dotenv").config(); // if you use env vars

// Your Firebase config
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: process.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Trimester data to seed
const trimesters = [
  {
    index: 1,
    title: 'First Trimester',
    weeksRange: 'Weeks 1–13',
    summary: 'Early body changes, confirmation of pregnancy, prenatal vitamins (folate), manage nausea, schedule first prenatal visit.',
    checklist: [
      'Start prenatal vitamins (as advised).',
      'Book first prenatal appointment.',
      'Discuss screenings and family health history.',
      'Hydration + small frequent meals for nausea.'
    ],
    doctorTips: [
      'Safe meds for nausea/heartburn.',
      'Baseline labs & genetic screens.'
    ]
  },
  {
    index: 2,
    title: 'Second Trimester',
    weeksRange: 'Weeks 14–27',
    summary: 'Often most comfortable period. Anatomy scan; feel movement; BP + glucose screening timing.',
    checklist: [
      'Schedule anatomy ultrasound (~20 weeks).',
      'Explore childbirth education resources.',
      'Begin pelvic floor exercises.'
    ],
    doctorTips: [
      'Gestational diabetes screening window.',
      'Exercise guidance & warning signs.'
    ]
  },
  {
    index: 3,
    title: 'Third Trimester',
    weeksRange: 'Weeks 28–40+',
    summary: 'Birth plan conversations, fetal position checks, GBS testing, weekly visits near term.',
    checklist: [
      'Finalize birth preferences & support team.',
      'Pack hospital bag & install car seat.',
      'Plan postpartum support resources.'
    ],
    doctorTips: [
      'Preeclampsia warning signs & kick counts.',
      'Delivery options & induction policies.'
    ]
  }
];

async function seedTrimesters() {
  try {
    // Check if trimesters already exist
    const existingQuery = query(collection(db, "trimesters"));
    const existingSnapshot = await getDocs(existingQuery);
    
    if (!existingSnapshot.empty) {
      console.log("⚠️  Trimesters already exist in Firestore. Skipping seed.");
      console.log(`Found ${existingSnapshot.size} existing trimester(s).`);
      return;
    }

    // Add each trimester to Firestore
    for (const trimester of trimesters) {
      await addDoc(collection(db, "trimesters"), trimester);
      console.log(`✅ Added: ${trimester.title} (Index ${trimester.index})`);
    }
    
    console.log("🎉 All trimesters added to Firestore!");
  } catch (error) {
    console.error("❌ Error seeding trimesters:", error);
    process.exit(1);
  }
}

seedTrimesters();

