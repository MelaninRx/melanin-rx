import { initializeApp, getApps } from 'firebase/app';
import { getFirestore, collection, getDocs, orderBy, query } from 'firebase/firestore';

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
  index: 1 | 2 | 3;
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
    return rows.sort((a, b) => a.index - b.index);
  } catch {
    return FALLBACK;
  }
}