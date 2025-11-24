import React from 'react';
import styles from '../pages/timeline.module.css';

// Fetal development data by week
const fetalDevelopmentData: { [week: number]: { size: string; description: string; length?: string; weight?: string } } = {
  4: { size: 'a poppy seed', description: 'Neural tube begins forming', length: 'tiny', weight: 'less than 0.1 oz' },
  5: { size: 'a sesame seed', description: 'Heart begins to beat', length: 'about 0.1 inches', weight: 'less than 0.1 oz' },
  6: { size: 'a lentil', description: 'Arms and legs begin forming', length: 'about 0.25 inches', weight: 'less than 0.1 oz' },
  7: { size: 'a blueberry', description: 'Brain and face developing', length: 'about 0.5 inches', weight: 'less than 0.1 oz' },
  8: { size: 'a kidney bean', description: 'Fingers and toes forming', length: 'about 0.6 inches', weight: 'less than 0.1 oz' },
  9: { size: 'a grape', description: 'Basic body structure complete', length: 'about 1 inch', weight: 'less than 0.1 oz' },
  10: { size: 'a kumquat', description: 'Vital organs functioning', length: 'about 1 inch', weight: 'about 0.1 oz' },
  11: { size: 'a fig', description: 'Baby moving around', length: 'about 1.5 inches', weight: 'about 0.25 oz' },
  12: { size: 'a lime', description: 'Reflexes developing', length: 'about 2 inches', weight: 'about 0.5 oz' },
  13: { size: 'a peapod', description: 'Unique fingerprints forming', length: 'about 3 inches', weight: 'about 1 oz' },
  14: { size: 'a lemon', description: 'Can make facial expressions', length: 'about 3.5 inches', weight: 'about 1.5 oz' },
  15: { size: 'an apple', description: 'Can sense light', length: 'about 4 inches', weight: 'about 2.5 oz' },
  16: { size: 'an avocado', description: 'Hearing developing', length: 'about 4.5 inches', weight: 'about 3.5 oz' },
  17: { size: 'a turnip', description: 'Skeleton hardening', length: 'about 5 inches', weight: 'about 5 oz' },
  18: { size: 'a bell pepper', description: 'Yawning and hiccupping', length: 'about 5.5 inches', weight: 'about 7 oz' },
  19: { size: 'a tomato', description: 'Vernix coating skin', length: 'about 6 inches', weight: 'about 8 oz' },
  20: { size: 'a banana', description: 'Halfway point!', length: 'about 6.5 inches', weight: 'about 10 oz' },
  21: { size: 'a carrot', description: 'Taste buds developing', length: 'about 10.5 inches', weight: 'about 13 oz' },
  22: { size: 'a spaghetti squash', description: 'Hair becoming visible', length: 'about 11 inches', weight: 'about 15 oz' },
  23: { size: 'a large mango', description: 'Rapid brain development', length: 'about 11.5 inches', weight: 'about 1 lb' },
  24: { size: 'an ear of corn', description: 'Lungs developing', length: 'about 12 inches', weight: 'about 1.3 lbs' },
  25: { size: 'a rutabaga', description: 'Responds to your voice', length: 'about 13.5 inches', weight: 'about 1.5 lbs' },
  26: { size: 'a head of lettuce', description: 'Eyes opening', length: 'about 14 inches', weight: 'about 1.7 lbs' },
  27: { size: 'a head of cauliflower', description: 'Sleeping and waking cycles', length: 'about 14.5 inches', weight: 'about 2 lbs' },
  28: { size: 'an eggplant', description: 'Third trimester begins', length: 'about 15 inches', weight: 'about 2.2 lbs' },
  29: { size: 'a butternut squash', description: 'Kicking and stretching', length: 'about 15 inches', weight: 'about 2.5 lbs' },
  30: { size: 'a large cabbage', description: 'Eyesight improving', length: 'about 16 inches', weight: 'about 3 lbs' },
  31: { size: 'a coconut', description: 'All five senses working', length: 'about 16 inches', weight: 'about 3.5 lbs' },
  32: { size: 'a jicama', description: 'Practicing breathing', length: 'about 17 inches', weight: 'about 4 lbs' },
  33: { size: 'a pineapple', description: 'Immune system developing', length: 'about 17 inches', weight: 'about 4 lbs' },
  34: { size: 'a cantaloupe', description: 'Skin smoothing out', length: 'about 18 inches', weight: 'about 5 lbs' },
  35: { size: 'a honeydew melon', description: 'Rapid weight gain', length: 'about 18 inches', weight: 'about 5 lbs' },
  36: { size: 'a head of romaine lettuce', description: 'Getting ready for birth', length: 'about 19 inches', weight: 'about 6 lbs' },
  37: { size: 'a bunch of Swiss chard', description: 'Full-term!', length: 'about 19 inches', weight: 'about 6 lbs' },
  38: { size: 'a leek', description: 'Fully developed', length: 'about 20 inches', weight: 'about 7 lbs' },
  39: { size: 'a mini watermelon', description: 'Ready to meet you!', length: 'about 20 inches', weight: 'about 7 lbs' },
  40: { size: 'a small pumpkin', description: 'Any day now!', length: 'about 20 inches', weight: 'about 7.5 lbs' },
};

// Get development data for a specific week
function getDevelopmentData(week: number) {
  // Clamp week between 4 and 40
  const clampedWeek = Math.max(4, Math.min(40, week));
  // Find closest week with data
  let dataWeek = clampedWeek;
  while (!fetalDevelopmentData[dataWeek] && dataWeek >= 4) {
    dataWeek--;
  }
  return fetalDevelopmentData[dataWeek] || fetalDevelopmentData[4];
}

// Calculate visual size for the baby representation (scaled for display)
function getVisualSize(week: number): number {
  // Scale from 20px (week 4) to 120px (week 40)
  const minSize = 20;
  const maxSize = 120;
  const progress = (week - 4) / (40 - 4);
  return minSize + (maxSize - minSize) * progress;
}

interface FetalDevelopmentProps {
  currentWeek: number;
}

export default function FetalDevelopment({ currentWeek }: FetalDevelopmentProps) {
  const development = getDevelopmentData(currentWeek);
  const visualSize = getVisualSize(currentWeek);
  
  return (
    <section className={styles.infoCard}>
      <div className={styles.cardTitle} style={{ marginBottom: '16px' }}>Fetal Development</div>
      
      <div style={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        gap: '20px',
        padding: '20px 0'
      }}>
        {/* Visual representation */}
        <div style={{
          width: `${visualSize}px`,
          height: `${visualSize}px`,
          borderRadius: '50%',
          background: 'linear-gradient(135deg, var(--color-primary), var(--color-accent))',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: '0 8px 24px rgba(127, 93, 140, 0.25)',
          position: 'relative',
          transition: 'all 0.3s ease'
        }}>
          <div style={{
            width: `${visualSize * 0.7}px`,
            height: `${visualSize * 0.7}px`,
            borderRadius: '50%',
            background: 'var(--color-light)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: `${Math.max(12, visualSize * 0.15)}px`,
            color: 'var(--color-primary)',
            fontWeight: 700
          }}>
            {currentWeek}w
          </div>
        </div>
        
        {/* Size comparison text */}
        <div style={{ textAlign: 'center' }}>
          <p style={{ 
            fontSize: '20px', 
            fontWeight: 700, 
            color: 'var(--color-primary)',
            margin: '0 0 8px 0'
          }}>
            Your baby is the size of
          </p>
          <p style={{ 
            fontSize: '24px', 
            fontWeight: 800, 
            color: 'var(--text-primary)',
            margin: '0 0 12px 0',
            textTransform: 'capitalize'
          }}>
            {development.size}
          </p>
          <p style={{ 
            fontSize: '14px', 
            color: 'var(--text-secondary)',
            margin: '0 0 8px 0'
          }}>
            {development.description}
          </p>
          {development.length && development.weight && (
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              justifyContent: 'center',
              marginTop: '12px',
              fontSize: '13px',
              color: 'var(--text-muted)'
            }}>
              <span><strong>Length:</strong> {development.length}</span>
              <span><strong>Weight:</strong> {development.weight}</span>
            </div>
          )}
        </div>
      </div>
    </section>
  );
}

