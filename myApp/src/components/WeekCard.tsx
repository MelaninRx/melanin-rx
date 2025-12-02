import React from 'react';
import styles from '../pages/timeline.module.css';

interface WeekCardProps {
  weekNumber: number;
  title: string;
  description: string;
  isActive?: boolean;
  onClick?: () => void;
}

export default function WeekCard({ weekNumber, title, description, isActive, onClick }: WeekCardProps) {
  return (
    <button className={`${styles.weekCard} ${isActive ? styles.weekCardActive : ''}`} onClick={onClick}>
      <div className={styles.weekCardNumber}>{weekNumber}</div>
      <div className={styles.weekCardContent}>
        <div className={styles.weekCardTitle}>{title}</div>
        <div className={styles.weekCardDescription}>{description}</div>
      </div>
      <svg className={styles.weekCardChevron} width="30" height="25" viewBox="0 0 30 25" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M11.25 18.75L18.75 12.5L11.25 6.25" stroke={isActive ? "white" : "#222222"} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </button>
  );
}
