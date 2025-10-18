import React from 'react';
import styles from '../pages/timeline.module.css';
import type { Trimester } from '../services/timelineService';

// function for trimester as a card
export default function TrimesterCard({ data, onOpen }: { data: Trimester; onOpen: (id: string) => void }) {
  return (
    <article className={styles.card} onClick={() => onOpen(data.id)}>
      <div className={styles.cardTitle}>{data.title}</div>
      <div className={styles.cardSub}>{data.weeksRange}</div>
      <p className={styles.cardBody}>{data.summary}</p>
    </article>
  );
}