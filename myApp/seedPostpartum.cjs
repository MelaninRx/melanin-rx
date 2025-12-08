const { initializeApp } = require("firebase/app");
const { getFirestore, collection, addDoc, getDocs, query, where, doc, setDoc } = require("firebase/firestore");
require("dotenv").config();

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

// Postpartum (4th Trimester) data
const postpartum = {
  id: 'postpartum',
  index: 4,
  title: 'Fourth Trimester (Postpartum)',
  weeksRange: 'Weeks 0–12+ After Birth',
  summary: 'The fourth trimester is a transformative period of healing, adjustment, and bonding with your new baby. Your body is recovering from childbirth while you\'re learning to care for a newborn. This time can be both beautiful and challenging. Many new mothers experience physical recovery, emotional changes, sleep deprivation, and significant lifestyle adjustments. It\'s crucial to prioritize self-care, monitor your mental health, and build a strong support network. Remember that postpartum depression and anxiety are common and treatable - seeking help is a sign of strength. Your health and well-being matter just as much as your baby\'s.',
  checklist: [
    'Schedule your 6-week postpartum checkup with your OB/GYN or midwife',
    'Schedule your baby\'s first pediatrician appointment (typically within first week)',
    'Set up a postpartum support system (family, friends, or postpartum doula)',
    'Create a plan for who can help with meals, cleaning, and baby care',
    'Monitor your physical recovery (bleeding, healing, pain levels)',
    'Track your mental health and emotional well-being daily',
    'Schedule a mental health check-in with a therapist or counselor if needed',
    'Learn about postpartum depression and anxiety warning signs',
    'Set up safe sleep environment for your baby (firm mattress, no soft bedding)',
    'Learn about safe sleep practices (back to sleep, room sharing)',
    'Research and connect with a lactation consultant if planning to breastfeed',
    'Set up a comfortable feeding space with snacks and water',
    'Prepare a postpartum care kit (pads, peri bottle, pain relief, etc.)',
    'Plan for adequate rest - sleep when baby sleeps when possible',
    'Set boundaries with visitors to protect your recovery and bonding time',
    'Prepare for baby\'s first vaccinations and wellness visits',
    'Learn about newborn care basics (bathing, diapering, soothing)',
    'Research and join postpartum support groups (online or in-person)',
    'Prepare for potential challenges with feeding (have backup plan)',
    'Plan for returning to work or adjusting work arrangements if applicable'
  ],
  doctorTips: [
    'What should I expect at my 6-week postpartum checkup, and what should I prepare?',
    'I\'m experiencing excessive bleeding - what\'s normal versus when should I call you?',
    'I\'m having trouble with pain or healing - what should I do, and when is it concerning?',
    'How can I tell the difference between baby blues and postpartum depression?',
    'I\'ve been feeling overwhelmed, anxious, or unable to bond with my baby - is this normal?',
    'What are the warning signs of postpartum depression and anxiety I should watch for?',
    'I\'m concerned about my mental health - what resources and support are available to me?',
    'When should I contact you about mental health concerns versus seeing a mental health provider?',
    'I\'m having trouble breastfeeding - what support and resources can help me?',
    'What can I take for pain management while breastfeeding, and what medications are safe?',
    'When can I resume normal activities like exercise, driving, and returning to work?',
    'I\'m having issues with my postpartum recovery (tearing, episiotomy, c-section healing) - what should I do?',
    'What contraception options are safe for me now, and when should I start them?',
    'My periods haven\'t returned yet - when should I expect them, and is this normal?',
    'I\'m experiencing issues with my pelvic floor - what should I do, and should I see a specialist?',
    'As a Black woman, I\'m concerned about my postpartum care - how can I ensure my concerns are heard?',
    'What follow-up appointments do I need, and what should I expect at each one?',
    'I\'m having trouble sleeping even when the baby sleeps - what can help?',
    'When should I be concerned about my baby\'s health, and what are emergency warning signs?',
    'I want to ensure I\'m receiving quality postpartum care - what questions should I ask?'
  ]
};

async function seedPostpartum() {
  try {
    // Check if postpartum already exists
    const postpartumRef = doc(db, "trimesters", "postpartum");
    const existingDoc = await getDocs(query(collection(db, "trimesters"), where("id", "==", "postpartum")));
    
    if (!existingDoc.empty) {
      console.log("⚠️  Postpartum data already exists in Firestore. Skipping seed.");
      return;
    }

    // Add postpartum data to Firestore with a specific document ID
    await setDoc(doc(db, "trimesters", "postpartum"), postpartum);
    console.log(`✅ Added: ${postpartum.title} (Index ${postpartum.index})`);
    
    console.log("🎉 Postpartum data added to Firestore!");
  } catch (error) {
    console.error("❌ Error seeding postpartum:", error);
    process.exit(1);
  }
}

seedPostpartum();

