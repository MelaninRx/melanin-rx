import React from 'react';
import styles from '../pages/timeline.module.css';
import type { Trimester } from '../services/timelineService';

// function to display trimester expanded
export default function TrimesterExpanded({ data, onBack }: { data: Trimester; onBack: () => void }) {
  return (
    <section className={styles.expanded}>
      <div className={styles.expandedHeader}>
        <div>
          <h2 className={styles.expandedTitle}>{data.title}</h2>
          <div className={styles.badge}>{data.weeksRange}</div>
        </div>
        <button className={styles.backBtn} onClick={onBack}>Back</button>
      </div>

      <p className={styles.cardBody}>{data.summary}</p>

      <h3 className={styles.sectionTitle}>Checklist</h3>
      <ul className={styles.list}>
        {data.checklist.map((item, i) => <li key={i}>{item}</li>)}
      </ul>

      <h3 className={styles.sectionTitle}>Doctor Discussion Prompts</h3>
      <ul className={styles.list}>
        {data.doctorTips.map((tip, i) => <li key={i}>{tip}</li>)}
      </ul>
    </section>
  );
}