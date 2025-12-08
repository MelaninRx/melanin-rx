const { initializeApp } = require("firebase/app");
const { getFirestore, collection, getDocs, query, doc, updateDoc } = require("firebase/firestore");
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

// Updated checklist data
const updatedChecklists = {
  1: [
    'Schedule your first prenatal appointment (typically around 8-12 weeks)',
    'Start taking prenatal vitamins with at least 400-800 mcg of folic acid daily',
    'Research and select a healthcare provider you trust and feel comfortable with',
    'Create a list of your family health history and genetic concerns to discuss with your provider',
    'Review and document all current medications with your provider for safety assessment',
    'Set up a system to track symptoms, questions, and appointments (app or notebook)',
    'Complete initial prenatal lab work and screenings ordered by your provider',
    'Attend your first prenatal visit with questions prepared',
    'Discuss genetic screening options and decide which tests are right for you',
    'Schedule any recommended genetic counseling appointments if needed',
    'Review insurance coverage for prenatal care and delivery',
    'Begin researching childbirth education classes in your area'
  ],
  2: [
    'Schedule your anatomy/level 2 ultrasound (typically 18-22 weeks)',
    'Complete gestational diabetes screening test (usually around 24-28 weeks)',
    'Attend your anatomy scan appointment with questions prepared',
    'Research and tour potential birth locations (hospital, birth center)',
    'Enroll in childbirth education classes (in-person or online)',
    'Enroll in breastfeeding/feeding preparation classes',
    'Interview and select a pediatrician for your baby',
    'Draft your birth plan and discuss preferences with your support person',
    'Submit maternity leave paperwork and finalize work arrangements',
    'Research and register for baby essentials (registry or shopping list)',
    'Schedule dental cleaning and address any dental concerns',
    'Plan and book your baby shower if desired',
    'Create a list of postpartum support people and their roles',
    'Research and connect with postpartum doula services if interested'
  ],
  3: [
    'Complete Group B Strep (GBS) screening test (typically 35-37 weeks)',
    'Finalize your birth plan document and review it with your provider',
    'Pack your hospital/birth center bag with all essentials',
    'Install and practice using your baby\'s car seat correctly',
    'Complete car seat installation check with certified technician',
    'Schedule final prenatal appointments through your due date',
    'Set up postpartum pediatrician appointment for baby (first week after birth)',
    'Research and book lactation consultant if planning to breastfeed',
    'Prepare and freeze 2-3 weeks worth of meals for postpartum recovery',
    'Set up baby\'s safe sleep space (bassinet or crib with fitted sheet only)',
    'Complete nursery setup or prepare sleeping area for baby',
    'Schedule postpartum care appointment for yourself (typically 6 weeks after birth)',
    'Discuss postpartum contraception options and plan with your provider',
    'Plan your route to the hospital/birth center and identify backup routes',
    'Prepare older siblings with age-appropriate information and activities',
    'Finalize and submit all maternity leave paperwork',
    'Attend any remaining childbirth or breastfeeding education classes',
    'Write emergency contact list and birth preferences for your support person'
  ]
};

async function updateChecklists() {
  try {
    const trimestersQuery = query(collection(db, "trimesters"));
    const snapshot = await getDocs(trimestersQuery);
    
    if (snapshot.empty) {
      console.log("⚠️  No trimesters found in Firestore. Please run seedTrimesters.cjs first.");
      return;
    }

    console.log(`Found ${snapshot.size} trimester(s) in Firestore.`);
    
    for (const docSnapshot of snapshot.docs) {
      const data = docSnapshot.data();
      const index = data.index;
      
      if (updatedChecklists[index]) {
        await updateDoc(doc(db, "trimesters", docSnapshot.id), {
          checklist: updatedChecklists[index]
        });
        console.log(`✅ Updated checklist for: ${data.title} (Index ${index})`);
      } else {
        console.log(`⚠️  No updated checklist found for index ${index}`);
      }
    }
    
    console.log("🎉 All checklists updated in Firestore!");
  } catch (error) {
    console.error("❌ Error updating checklists:", error);
    process.exit(1);
  }
}

updateChecklists();

