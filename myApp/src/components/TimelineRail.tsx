import React from 'react';
import styles from '../pages/timeline.module.css';

export type RailNode = { key: string; label: string; onClick: () => void; };

// function to display timeline rail
export default function TimelineRail({ nodes }: { nodes: RailNode[] }) {
  return (
    <div className={styles.rail}>
      <div className={styles.railLine} />
      {nodes.map(n => (
        <button key={n.key} className={styles.node} onClick={n.onClick} aria-label={`Open ${n.label}`}>
          <span className={styles.dot} />
          <span className={styles.nodeLabel}>{n.label}</span>
        </button>
      ))}
    </div>
  );
}
