import React from 'react';
import styles from '../pages/timeline.module.css';

export default function StatusCard({
  currentWeek,
  dueDate,
}: { currentWeek: number; dueDate: Date; }) {
  const weeksLeft = Math.max(0, 40 - currentWeek);
  const niceDate = dueDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' });
  const trimester = currentWeek < 14 ? 'Trimester 1' : currentWeek < 28 ? 'Trimester 2' : 'Trimester 3';

  return (
    <section className={styles.statusCard}>
      <div>
        <h3 className={styles.statusTitle}>You’re on week {currentWeek}</h3>
        <p className={styles.statusSub}>Estimated due date • {niceDate}</p>
        <div className={styles.pills}>
          <span className={styles.pill}>{trimester}</span>
          <span className={styles.pill}>{weeksLeft} weeks to go</span>
        </div>
      </div>
      <div className={styles.miniStat}>
        <strong>EDD</strong>
        <span>{niceDate}</span>
      </div>
    </section>
  );
}
