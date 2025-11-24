import React from 'react';
import styles from '../pages/timeline.module.css';
import type { Trimester } from '../services/timelineService';

// Create a shorter preview from the summary
const getPreview = (summary: string): string => {
  // Take first sentence or first 120 characters
  const firstSentence = summary.split('.')[0];
  if (firstSentence.length <= 120) {
    return firstSentence + '.';
  }
  return summary.substring(0, 120).trim() + '...';
};

// function for trimester as a card
export default function TrimesterCard({ data, onOpen }: { data: Trimester; onOpen: (id: string) => void }) {
  const preview = getPreview(data.summary);
  const keyHighlights = data.checklist.slice(0, 3); // Show top 3 checklist items as preview
  
  return (
    <article className={styles.card} onClick={() => onOpen(data.id)}>
      <div className={styles.cardTitle}>{data.title}</div>
      <div className={styles.cardSub}>{data.weeksRange}</div>
      <p className={styles.cardBody}>{preview}</p>
      <div className={styles.cardHighlights}>
        <div className={styles.highlightsLabel}>Key focus areas:</div>
        <ul className={styles.highlightsList}>
          {keyHighlights.map((item, i) => (
            <li key={i}>{item.replace(/^[•\-\d.]+\s*/, '').substring(0, 60)}{item.length > 60 ? '...' : ''}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}