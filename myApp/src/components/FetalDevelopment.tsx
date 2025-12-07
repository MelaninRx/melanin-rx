import React from 'react';
import styles from '../pages/timeline.module.css';

// Postpartum baby development milestones (weeks 1-12 after birth)
const postpartumBabyData: { [week: number]: { milestone: string; description: string } } = {
  1: { milestone: 'Newborn', description: 'Learning to eat and sleep. Focus on bonding and recovery.' },
  2: { milestone: '2 weeks', description: 'First social smiles may appear. Establishing feeding routine.' },
  3: { milestone: '3 weeks', description: 'More alert and responsive. Beginning to track objects with eyes.' },
  4: { milestone: '1 month', description: 'Lifting head briefly during tummy time. Recognizes your voice.' },
  5: { milestone: '5 weeks', description: 'Making cooing sounds. Sleeping patterns becoming more regular.' },
  6: { milestone: '6 weeks', description: 'Stronger head control. Starting to follow moving objects.' },
  7: { milestone: '7 weeks', description: 'More expressive facial expressions. Enjoying interactive play.' },
  8: { milestone: '2 months', description: 'First vaccinations. Smiling and recognizing familiar faces.' },
  9: { milestone: '9 weeks', description: 'Hands becoming more active. Beginning to grasp objects.' },
  10: { milestone: '10 weeks', description: 'Longer periods of alertness. Babbling and vocalizing more.' },
  11: { milestone: '11 weeks', description: 'Rolling from side to side. Responding to your voice with sounds.' },
  12: { milestone: '3 months', description: 'Laughing out loud. Reaching for and holding toys.' },
};

const fetalDevelopmentData: { [week: number]: { size: string; description: string; length?: string; weight?: string } } = {
  4: { size: 'poppy seed', description: 'Neural tube begins forming', length: 'tiny', weight: 'less than 0.1 oz' },
  5: { size: 'sesame seed', description: 'Heart begins to beat', length: 'about 0.1 inches', weight: 'less than 0.1 oz' },
  6: { size: 'lentil', description: 'Arms and legs begin forming', length: 'about 0.25 inches', weight: 'less than 0.1 oz' },
  7: { size: 'blueberry', description: 'Brain and face developing', length: 'about 0.5 inches', weight: 'less than 0.1 oz' },
  8: { size: 'kidney bean', description: 'Fingers and toes forming', length: 'about 0.6 inches', weight: 'less than 0.1 oz' },
  9: { size: 'grape', description: 'Basic body structure complete', length: 'about 1 inch', weight: 'less than 0.1 oz' },
  10: { size: 'kumquat', description: 'Vital organs functioning', length: 'about 1 inch', weight: 'about 0.1 oz' },
  11: { size: 'fig', description: 'Baby moving around', length: 'about 1.5 inches', weight: 'about 0.25 oz' },
  12: { size: 'lime', description: 'Reflexes developing', length: 'about 2 inches', weight: 'about 0.5 oz' },
  13: { size: 'peapod', description: 'Unique fingerprints forming', length: 'about 3 inches', weight: 'about 1 oz' },
  14: { size: 'lemon', description: 'Can make facial expressions', length: 'about 3.5 inches', weight: 'about 1.5 oz' },
  15: { size: 'apple', description: 'Can sense light', length: 'about 4 inches', weight: 'about 2.5 oz' },
  16: { size: 'avocado', description: 'Hearing developing', length: 'about 4.5 inches', weight: 'about 3.5 oz' },
  17: { size: 'turnip', description: 'Skeleton hardening', length: 'about 5 inches', weight: 'about 5 oz' },
  18: { size: 'bell pepper', description: 'Yawning and hiccupping', length: 'about 5.5 inches', weight: 'about 7 oz' },
  19: { size: 'tomato', description: 'Vernix coating skin', length: 'about 6 inches', weight: 'about 8 oz' },
  20: { size: 'banana', description: 'Halfway point!', length: 'about 6.5 inches', weight: 'about 10 oz' },
  21: { size: 'carrot', description: 'Taste buds developing', length: 'about 10.5 inches', weight: 'about 13 oz' },
  22: { size: 'spaghetti squash', description: 'Hair becoming visible', length: 'about 11 inches', weight: 'about 15 oz' },
  23: { size: 'large mango', description: 'Rapid brain development', length: 'about 11.5 inches', weight: 'about 1 lb' },
  24: { size: 'ear of corn', description: 'Lungs developing', length: 'about 12 inches', weight: 'about 1.3 lbs' },
  25: { size: 'rutabaga', description: 'Responds to your voice', length: 'about 13.5 inches', weight: 'about 1.5 lbs' },
  26: { size: 'head of lettuce', description: 'Eyes opening', length: 'about 14 inches', weight: 'about 1.7 lbs' },
  27: { size: 'head of cauliflower', description: 'Sleeping and waking cycles', length: 'about 14.5 inches', weight: 'about 2 lbs' },
  28: { size: 'eggplant', description: 'Third trimester begins', length: 'about 15 inches', weight: 'about 2.2 lbs' },
  29: { size: 'butternut squash', description: 'Kicking and stretching', length: 'about 15 inches', weight: 'about 2.5 lbs' },
  30: { size: 'large cabbage', description: 'Eyesight improving', length: 'about 16 inches', weight: 'about 3 lbs' },
  31: { size: 'coconut', description: 'All five senses working', length: 'about 16 inches', weight: 'about 3.5 lbs' },
  32: { size: 'jicama', description: 'Practice breathing', length: 'about 17 inches', weight: 'about 4 lbs' },
  33: { size: 'pineapple', description: 'Immune system developing', length: 'about 17 inches', weight: 'about 4 lbs' },
  34: { size: 'cantaloupe', description: 'Skin smoothing out', length: 'about 18 inches', weight: 'about 5 lbs' },
  35: { size: 'honeydew melon', description: 'Rapid weight gain', length: 'about 18 inches', weight: 'about 5 lbs' },
  36: { size: 'head of romaine lettuce', description: 'Getting ready for birth', length: 'about 19 inches', weight: 'about 6 lbs' },
  37: { size: 'bunch of Swiss chard', description: 'Full-term!', length: 'about 19 inches', weight: 'about 6 lbs' },
  38: { size: 'leek', description: 'Fully developed', length: 'about 20 inches', weight: 'about 7 lbs' },
  39: { size: 'mini watermelon', description: 'Ready to meet you!', length: 'about 20 inches', weight: 'about 7 lbs' },
  40: { size: 'small pumpkin', description: 'Any day now!', length: 'about 20 inches', weight: 'about 7.5 lbs' },
};

function getDevelopmentData(week: number) {
  const clampedWeek = Math.max(4, Math.min(40, week));
  let dataWeek = clampedWeek;
  while (!fetalDevelopmentData[dataWeek] && dataWeek >= 4) {
    dataWeek--;
  }
  return fetalDevelopmentData[dataWeek] || fetalDevelopmentData[15];
}

function getPostpartumData(weeksPostpartum: number) {
  // Clamp to available data (1-12 weeks postpartum)
  const clamped = Math.max(1, Math.min(12, weeksPostpartum));
  return postpartumBabyData[clamped] || postpartumBabyData[1];
}

interface FetalDevelopmentProps {
  currentWeek: number;
  isPostpartum?: boolean;
}

export default function FetalDevelopment({ currentWeek, isPostpartum = false }: FetalDevelopmentProps) {
  // For postpartum, calculate weeks old and get postpartum-specific data
  const weeksPostpartum = isPostpartum && currentWeek > 40 ? currentWeek - 40 : 0;
  const postpartumData = isPostpartum && weeksPostpartum > 0 ? getPostpartumData(weeksPostpartum) : null;
  const development = getDevelopmentData(currentWeek);
  
  // Format week label - use shorter format to fit in circle
  // For postpartum: "2w" instead of "2w old", "1mo" for months
  let weekLabel: string;
  if (isPostpartum && weeksPostpartum > 0) {
    if (weeksPostpartum === 4 || weeksPostpartum === 8 || weeksPostpartum === 12) {
      // Use month format for milestone weeks
      weekLabel = weeksPostpartum === 4 ? '1mo' : weeksPostpartum === 8 ? '2mo' : '3mo';
    } else {
      weekLabel = `${weeksPostpartum}w`;
    }
  } else {
    weekLabel = `${currentWeek}w`;
  }
  
  return (
    <div className={styles.fetalCard}>
      <div className={styles.fetalTitle}>{isPostpartum ? 'Baby Development' : 'Fetal Development'}</div>
      
      <div className={styles.fetalContent}>
        <div style={{ position: 'relative', width: '130px', height: '130px' }}>
          <svg width="140" height="140" viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ filter: 'drop-shadow(0 4px 5px rgba(0, 0, 0, 0.25))', position: 'absolute', top: '-5px', left: '-5px' }}>
            <defs>
              <linearGradient id="circleGradient" x1="70" y1="1" x2="70" y2="131" gradientUnits="userSpaceOnUse">
                <stop stopColor="#642D56"/>
                <stop offset="1" stopColor="#B369A0"/>
              </linearGradient>
            </defs>
            <circle cx="70" cy="66" r="52.5" stroke="url(#circleGradient)" strokeWidth="25" fill="none"/>
          </svg>
          <div className={styles.fetalWeek} style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)' }}>{weekLabel}</div>
        </div>

        {isPostpartum && postpartumData ? (
          <>
            <div className={styles.fetalSizeLabel}>This week</div>
            <div className={styles.fetalSize}>{postpartumData.milestone}</div>
            <div className={styles.fetalDescription}>{postpartumData.description}</div>
          </>
        ) : (
          <>
            <div className={styles.fetalSizeLabel}>Your baby is the size of a</div>
            <div className={styles.fetalSize}>{development.size}</div>
            <div className={styles.fetalDescription}>{development.description}</div>
            
            {development.length && development.weight && (
              <div className={styles.fetalStats}>
                <div className={styles.fetalStat}>
                  <span className={styles.fetalStatLabel}>Length</span>
                  <span className={styles.fetalStatValue}>: {development.length}</span>
                </div>
                <div className={styles.fetalStat}>
                  <span className={styles.fetalStatLabel}>Weight</span>
                  <span className={styles.fetalStatValue}>: {development.weight}</span>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
