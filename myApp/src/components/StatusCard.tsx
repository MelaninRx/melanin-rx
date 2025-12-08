import React from 'react';
import styles from '../pages/timeline.module.css';
import { getBabySize } from '../services/fetalDevelopmentService';

export default function StatusCard({
  currentWeek,
  dueDate,
  isPostpartum = false,
}: { currentWeek: number; dueDate: Date; isPostpartum?: boolean; }) {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const dueDateCopy = new Date(dueDate);
  dueDateCopy.setHours(0, 0, 0, 0);
  
  const daysRemaining = Math.floor((dueDateCopy.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
  const daysPostpartum = isPostpartum ? Math.abs(daysRemaining) : 0;
  const weeksPostpartum = isPostpartum ? Math.floor(daysPostpartum / 7) : 0;
  const niceDate = dueDate.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });

  // Use the shared fetal development service to ensure consistency with FetalDevelopment component
  const babySize = getBabySize(currentWeek);
  
  // Handle articles (a/an) for the size comparison
  const article = babySize.match(/^[aeiou]/i) ? 'an' : 'a';

  return (
    <section className={styles.statusHeader}>
      <div className={styles.statusContent}>
        {isPostpartum ? (
          <>
            <div className={styles.statusWeek}>Postpartum</div>
            <div className={styles.statusBabySize}>Congratulations! Your baby is here! 🎉</div>
            <div className={styles.statusInfo}>
              <div className={styles.statusInfoItem}>
                <div className={styles.statusInfoLabel}>Birth Date</div>
                <div className={styles.statusInfoValue}>{niceDate}</div>
              </div>
              <div className={styles.statusInfoItem}>
                <div className={styles.statusInfoLabel}>Weeks Postpartum</div>
                <div className={styles.statusInfoValue}>{weeksPostpartum} Weeks</div>
              </div>
            </div>
          </>
        ) : (
          <>
            <div className={styles.statusWeek}>Week {currentWeek}</div>
            <div className={styles.statusBabySize}>Your baby is about the size of {article} {babySize}!</div>
            <div className={styles.statusInfo}>
              <div className={styles.statusInfoItem}>
                <div className={styles.statusInfoLabel}>Estimated Due Date</div>
                <div className={styles.statusInfoValue}>{niceDate}</div>
              </div>
              <div className={styles.statusInfoItem}>
                <div className={styles.statusInfoLabel}>Days Remaining</div>
                <div className={styles.statusInfoValue}>~{daysRemaining} Days</div>
              </div>
            </div>
          </>
        )}
      </div>
      <div className={styles.statusIcon}>
        <svg width="50" height="50" viewBox="0 0 50 50" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path d="M20.8335 33.3333C21.8752 33.9583 23.3335 34.375 25.0002 34.375C26.6669 34.375 28.1252 33.9583 29.1669 33.3333M31.2502 25H31.271M40.3752 14.1938C41.8358 16.3175 42.8429 18.7196 43.3335 21.25C44.038 21.5912 44.6321 22.1239 45.0478 22.7871C45.4635 23.4504 45.684 24.2173 45.684 25C45.684 25.7827 45.4635 26.5496 45.0478 27.2129C44.6321 27.8761 44.038 28.4088 43.3335 28.75C42.4341 32.9448 40.1235 36.7042 36.787 39.4011C33.4506 42.098 29.2903 43.5692 25.0002 43.5692C20.7101 43.5692 16.5498 42.098 13.2134 39.4011C9.87694 36.7042 7.56626 32.9448 6.66687 28.75C5.9624 28.4088 5.36829 27.8761 4.95259 27.2129C4.53689 26.5496 4.31641 25.7827 4.31641 25C4.31641 24.2173 4.53689 23.4504 4.95259 22.7871C5.36829 22.1239 5.9624 21.5912 6.66687 21.25C7.52992 17.0219 9.82498 13.2209 13.1648 10.4883C16.5047 7.75565 20.6849 6.25871 25.0002 6.25C29.1669 6.25 32.2919 8.54167 32.2919 11.4583C32.2919 14.375 30.4169 16.6667 28.1252 16.6667C26.4585 16.6667 25.0002 15.8333 25.0002 14.5833M18.7502 25H18.771" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
    </section>
  );
}
