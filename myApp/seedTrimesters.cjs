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
      'Start taking prenatal vitamins with at least 400-800 mcg of folic acid daily (ideally before conception)',
      'Schedule your first prenatal appointment (typically around 8-12 weeks)',
      'Discuss your family health history and any genetic concerns with your provider',
      'Eat small, frequent meals to help manage nausea and maintain blood sugar',
      'Stay hydrated - aim for 8-10 glasses of water daily',
      'Avoid alcohol, smoking, and recreational drugs',
      'Limit caffeine intake to 200mg per day (about one 12oz coffee)',
      'Avoid raw fish, deli meats, unpasteurized dairy, and high-mercury fish',
      'Begin gentle exercise if cleared by your provider (walking, prenatal yoga)',
      'Get adequate rest - your body is working hard to support early development',
      'Start tracking your symptoms and questions for your provider',
      'Research and choose a healthcare provider you trust and feel comfortable with',
      'Discuss any medications you\'re currently taking with your provider',
      'Begin thinking about your birth preferences and support team'
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
      'Begin or continue regular exercise - aim for 150 minutes of moderate activity per week',
      'Start pelvic floor exercises (Kegels) to prepare for birth and recovery',
      'Explore childbirth education classes and breastfeeding resources',
      'Begin thinking about your birth plan and preferences',
      'Research and tour potential birth locations (hospital, birth center)',
      'Start planning your maternity leave and work arrangements',
      'Begin shopping for maternity clothes and comfortable shoes',
      'Start sleeping on your left side to improve circulation',
      'Continue taking prenatal vitamins and eating a balanced diet',
      'Stay hydrated and monitor your blood pressure',
      'Begin tracking your baby\'s movements (you\'ll feel them more consistently around 20+ weeks)',
      'Discuss travel plans with your provider (air travel is generally safe until 36 weeks)',
      'Start researching pediatricians for your baby',
      'Consider creating a registry and planning your baby shower',
      'Begin gentle stretching and prenatal yoga to ease aches and prepare for birth'
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
      'Finalize your birth plan and discuss it with your provider and support person',
      'Pack your hospital/birth center bag (include comfortable clothes, toiletries, phone charger, snacks)',
      'Install and learn how to use your baby\'s car seat (required for discharge)',
      'Plan your postpartum support - who will help with meals, childcare, and recovery',
      'Prepare your home for baby\'s arrival (nursery setup, safe sleep space)',
      'Continue tracking baby\'s movements daily - report any decrease immediately',
      'Attend childbirth education classes and breastfeeding classes if you haven\'t already',
      'Write down your birth preferences but remain flexible',
      'Prepare freezer meals for postpartum recovery',
      'Set up postpartum care appointments (pediatrician, lactation consultant if needed)',
      'Discuss postpartum contraception options with your provider',
      'Learn about newborn care basics (feeding, diapering, safe sleep)',
      'Plan your route to the hospital/birth center and have backup options',
      'Prepare older siblings or pets for the new baby\'s arrival',
      'Finalize maternity leave and work arrangements',
      'Continue prenatal vitamins and stay hydrated',
      'Practice relaxation and breathing techniques for labor',
      'Get plenty of rest - your body needs energy for labor and recovery'
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

