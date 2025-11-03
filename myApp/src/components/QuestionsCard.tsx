import React from 'react';
import styles from '../pages/timeline.module.css';

export default function QuestionsCard({ items }: { items: string[] }) {
  return (
    <section className={styles.qaCard}>
      <div className={styles.cardTitle}>Questions to ask your doctor</div>
      <div style={{ marginTop: 8 }}>
        {items.map((q, i) => <div key={i} className={styles.qaItem}>• {q}</div>)}
      </div>
    </section>
  );
}