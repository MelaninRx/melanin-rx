import React from 'react';
import styles from '../pages/timeline.module.css';
import type { Trimester } from '../services/timelineService';

const getPreview = (summary: string): string => {
  const firstSentence = summary.split('.')[0];
  if (firstSentence.length <= 120) {
    return firstSentence + '.';
  }
  return summary.substring(0, 120).trim() + '...';
};

export default function TrimesterCard({ data, onOpen, fullWidth }: { data: Trimester; onOpen: (id: string) => void; fullWidth?: boolean }) {
  const preview = getPreview(data.summary);
  const keyHighlights = data.checklist.slice(0, fullWidth ? 6 : 3);
  
  if (fullWidth) {
    return (
      <article className={`${styles.card} ${styles.cardFullWidth}`} onClick={() => onOpen(data.id)}>
        <div className={styles.cardTitle}>{data.title}</div>
        <div className={styles.cardSub}>{data.weeksRange}</div>
        <div className={styles.cardDivider} />
        <p className={styles.cardBodyFullWidth}>{data.summary}</p>
        <div className={styles.cardHighlights}>
          <div className={styles.highlightsLabel}>Key Focus Areas:</div>
          <ul className={styles.highlightsListFullWidth}>
            {keyHighlights.map((item, i) => (
              <li key={i}>{item.replace(/^[•\-\d.]+\s*/, '')}</li>
            ))}
          </ul>
        </div>
      </article>
    );
  }
  
  return (
    <article className={styles.card} onClick={() => onOpen(data.id)}>
      <div className={styles.cardTitle}>{data.title}</div>
      <div className={styles.cardSub}>{data.weeksRange}</div>
      <div className={styles.cardDivider} />
      <p className={styles.cardBody}>{preview}</p>
      <div className={styles.cardHighlights}>
        <div className={styles.highlightsLabel}>Key Focus Areas:</div>
        <ul className={styles.highlightsList}>
          {keyHighlights.map((item, i) => (
            <li key={i}>{item.replace(/^[•\-\d.]+\s*/, '').substring(0, 65)}{item.length > 65 ? '...' : ''}</li>
          ))}
        </ul>
      </div>
    </article>
  );
}
