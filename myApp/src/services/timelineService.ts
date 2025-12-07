import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, doc, getDoc, orderBy, query, where } from 'firebase/firestore';

function getDb() {
  if (!getApps().length) {
    initializeApp({
      apiKey: process.env.VITE_FIREBASE_API_KEY,
      authDomain: process.env.VITE_FIREBASE_AUTH_DOMAIN,
      projectId: process.env.VITE_FIREBASE_PROJECT_ID,
      appId: process.env.VITE_FIREBASE_APP_ID,
    });
  }
  return getFirestore();
}

// schema for trimester
export type Trimester = {
  id: string;
  index: 1 | 2 | 3 | 4;
  title: string;
  weeksRange: string;
  summary: string;
  checklist: string[];
  doctorTips: string[];
};

// fallback for trimester info
const FALLBACK: Trimester[] = [
  {
    id: 't1',
    index: 1,
    title: 'First Trimester',
    weeksRange: 'Weeks 1–13',
    summary:
      'Early body changes, confirmation of pregnancy, prenatal vitamins (folate), manage nausea, schedule first prenatal visit.',
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
    id: 't2',
    index: 2,
    title: 'Second Trimester',
    weeksRange: 'Weeks 14–27',
    summary:
      'Often most comfortable period. Anatomy scan; feel movement; BP + glucose screening timing.',
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
    id: 't3',
    index: 3,
    title: 'Third Trimester',
    weeksRange: 'Weeks 28–40+',
    summary:
      'Birth plan conversations, fetal position checks, GBS testing, weekly visits near term.',
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

export async function getTrimesters(): Promise<Trimester[]> {
  try {
    const db = getDb();
    const q = query(collection(db, 'trimesters'), orderBy('index', 'asc'));
    const snap = await getDocs(q);
    if (snap.empty) return FALLBACK;
    const rows = snap.docs.map(d => ({ id: d.id, ...d.data() })) as Trimester[];
    return rows.sort((a, b) => a.index - b.index).filter(t => t.index <= 3); // Only return trimesters 1-3
  } catch {
    return FALLBACK;
  }
}

export async function getPostpartum(): Promise<Trimester | null> {
  try {
    const db = getDb();
    
    // First, try to get the document by ID
    try {
      const postpartumDoc = await getDoc(doc(db, 'trimesters', 'postpartum'));
      if (postpartumDoc.exists()) {
        return { id: postpartumDoc.id, ...postpartumDoc.data() } as Trimester;
      }
    } catch (e) {
      // Document might not exist with that ID, continue to query
    }
    
    // Try to find postpartum by querying for index 4
    const q = query(collection(db, 'trimesters'), where('index', '==', 4));
    const snapshot = await getDocs(q);
    if (!snapshot.empty) {
      const doc = snapshot.docs[0];
      return { id: doc.id, ...doc.data() } as Trimester;
    }
    
    // Fallback postpartum data
    return {
      id: 'postpartum',
      index: 4,
      title: 'Fourth Trimester (Postpartum)',
      weeksRange: 'Weeks 0–12+ After Birth',
      summary: 'The fourth trimester is a transformative period of healing, adjustment, and bonding with your new baby. Your body is recovering from childbirth while you\'re learning to care for a newborn. This time can be both beautiful and challenging. Many new mothers experience physical recovery, emotional changes, sleep deprivation, and significant lifestyle adjustments. It\'s crucial to prioritize self-care, monitor your mental health, and build a strong support network. Remember that postpartum depression and anxiety are common and treatable - seeking help is a sign of strength. Your health and well-being matter just as much as your baby\'s.',
      checklist: [
        'Schedule your 6-week postpartum checkup with your OB/GYN or midwife',
        'Schedule your baby\'s first pediatrician appointment (typically within first week)',
        'Set up a postpartum support system (family, friends, or postpartum doula)',
        'Monitor your physical recovery (bleeding, healing, pain levels)',
        'Track your mental health and emotional well-being daily'
      ],
      doctorTips: [
        'What should I expect at my 6-week postpartum checkup?',
        'How can I tell the difference between baby blues and postpartum depression?',
        'What are the warning signs of postpartum depression and anxiety?',
        'I\'m having trouble breastfeeding - what support and resources can help me?'
      ]
    };
  } catch (error) {
    console.error('Error fetching postpartum data:', error);
    return null;
  }
}