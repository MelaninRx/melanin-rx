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
    summary: 'The first trimester is a critical period of early development. Your body is undergoing significant changes as your baby\'s major organs and systems begin to form. This is the time to establish healthy habits, confirm your pregnancy, and begin prenatal care. Many women experience morning sickness, fatigue, and emotional changes during this time. It\'s important to prioritize self-care, take prenatal vitamins with folic acid, and establish a relationship with your healthcare provider early.',
    checklist: [
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
    doctorTips: [
      'What tests and screenings will be done at my first prenatal visit?',
      'What genetic screening options are available, and which ones do you recommend for me?',
      'What medications are safe for me to take if I experience nausea or morning sickness?',
      'What can I take for heartburn or indigestion during pregnancy?',
      'What do my baseline lab results mean, and are there any concerns I should know about?',
      'What will the early ultrasound show, and when will I be able to see my baby?',
      'When should I call you immediately versus waiting for my next appointment?',
      'What warning signs should I watch for that require immediate medical attention?',
      'As a Black woman, what are my specific risk factors, and how will we monitor for complications?',
      'I\'ve been feeling anxious/depressed - what mental health resources or support do you recommend?',
      'How often will I have appointments during this trimester, and what will happen at each visit?',
      'What lifestyle changes should I make right now to support a healthy pregnancy?',
      'Are there any symptoms I\'m experiencing that I should be concerned about?'
    ]
  },
  {
    index: 2,
    title: 'Second Trimester',
    weeksRange: 'Weeks 14–27',
    summary: 'Often called the "honeymoon period" of pregnancy, the second trimester brings relief from early symptoms for many women. You\'ll likely start feeling your baby move (quickening), your energy may return, and your baby bump becomes more visible. This is an ideal time to focus on nutrition, exercise, and preparation. Your baby is growing rapidly, and important screenings like the anatomy scan happen during this trimester. This is also when many women feel most comfortable and confident in their pregnancy journey.',
    checklist: [
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
    doctorTips: [
      'What will the anatomy scan show, and what questions should I ask during the ultrasound?',
      'When should I have my gestational diabetes screening, and what should I expect during the test?',
      'How often should my blood pressure be checked, and what numbers should concern me?',
      'I\'m concerned about my weight gain - what\'s healthy for me, and how can I manage it?',
      'What exercises are safe for me to do, and are there any activities I should avoid?',
      'I\'ve noticed decreased fetal movement - when should I be concerned and call you?',
      'What are the warning signs I should watch for that require immediate medical attention?',
      'I\'m experiencing pain/discomfort - is this normal, or should I be concerned?',
      'How can I tell the difference between Braxton Hicks contractions and real labor?',
      'I\'d like to discuss my birth preferences - can we talk about my options and what to expect?',
      'Given my medical history, are there any additional screenings or precautions I should consider?',
      'I\'ve been feeling stressed/anxious - what mental health support is available to me?',
      'As a Black woman, what specific complications should I be aware of, and how will we monitor for them?',
      'What questions should I ask about my baby\'s development and growth at this stage?'
    ]
  },
  {
    index: 3,
    title: 'Third Trimester',
    weeksRange: 'Weeks 28–40+',
    summary: 'The final stretch! Your baby is growing rapidly and preparing for life outside the womb. You\'ll likely experience more physical discomfort as your body prepares for birth. This trimester focuses on final preparations, monitoring for complications, and getting ready to meet your baby. Regular prenatal visits become more frequent, and you\'ll discuss your birth plan, postpartum care, and what to expect during labor and delivery. This is also the time to finalize practical preparations and build your support network.',
    checklist: [
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
    ],
    doctorTips: [
      'How often will my appointments be now, and what will happen at each visit?',
      'What is the Group B Strep test, when will I have it, and what happens if I test positive?',
      'What are the warning signs of preeclampsia I should watch for, and when should I call you immediately?',
      'My blood pressure has been elevated - what does this mean, and how will we monitor it?',
      'How should I track my baby\'s movements, and when should decreased movement concern me?',
      'What are the signs that I\'m going into labor, and when should I come to the hospital?',
      'I\'m having contractions - how do I know if it\'s real labor or false labor?',
      'What are my options for pain management during labor, and how do I communicate my preferences?',
      'Under what circumstances would you recommend induction, and what are my options?',
      'What should I expect during recovery after delivery, and what support will I need?',
      'I want to breastfeed - what resources and support are available to help me succeed?',
      'As a Black woman, I\'m concerned about my care - how can I ensure my concerns are heard and addressed?',
      'What are my options if I need a cesarean delivery, and how can I prepare for that possibility?',
      'I\'ve been feeling anxious about delivery and postpartum - what mental health resources are available?',
      'What will the final ultrasounds show, and what questions should I ask about my baby\'s position and growth?',
      'What should I pack in my hospital bag, and when should I have it ready?',
      'Who can I bring with me to appointments and during delivery for support?',
      'If I have concerns about my care or feel I\'m not being heard, what should I do?'
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

