import React from 'react';
import styles from '../pages/timeline.module.css';
import { getFetalDevelopmentData } from '../services/fetalDevelopmentService';

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
  const development = getFetalDevelopmentData(currentWeek);
  
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
