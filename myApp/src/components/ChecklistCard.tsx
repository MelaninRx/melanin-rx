import React from 'react';
import styles from '../pages/timeline.module.css';

export default function ChecklistCard({
  items, storageKey, title = 'This week’s checklist',
}: { items: string[]; storageKey: string; title?: string; }) {
  const [done, setDone] = React.useState<boolean[]>(() => {
    const raw = localStorage.getItem(storageKey);
    return raw ? JSON.parse(raw) : Array(items.length).fill(false);
  });

  React.useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(done));
  }, [done, storageKey]);

  const toggle = (i: number) => setDone(d => {
    const n = [...d]; n[i] = !n[i]; return n;
  });

  return (
    <section className={styles.checklistCard}>
      <div className={styles.cardTitle}>{title}</div>
      <div style={{ marginTop: 8 }}>
        {items.map((text, i) => {
          const checked = !!done[i];
          return (
            <div key={i} className={styles.checkItem} onClick={() => toggle(i)}>
              <div className={`${styles.checkBox} ${checked ? styles.checkBoxChecked : ''}`}>
                {checked ? '✓' : ''}
              </div>
              <div className={`${styles.checkText} ${checked ? styles.checkTextDone : ''}`}>{text}</div>
            </div>
          );
        })}
      </div>
    </section>
  );
}