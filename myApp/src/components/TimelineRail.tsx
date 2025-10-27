import React from 'react';
import styles from '../pages/timeline.module.css';

export type RailNode = {
  key: string;
  label: string;
  onClick: () => void;
  /** NEW: mark the user's current trimester node */
  isCurrent?: boolean;
};

type Props = {
  nodes: RailNode[];
  /** NEW (optional): 0..1 progress across the rail */
  progress?: number;
};

export default function TimelineRail({ nodes, progress = 0 }: Props) {
  // Smooth slide-in animation for the progress bar
  const [anim, setAnim] = React.useState(0);
  React.useEffect(() => {
    // ensure we render 0 first, then animate to target width
    requestAnimationFrame(() => setAnim(progress));
  }, [progress]);

  const pct = Math.min(1, Math.max(0, anim)) * 100;

  return (
    <div className={styles.rail}>
      <div className={styles.railLine} />
      <div className={styles.railProgress} style={{ width: `${pct}%` }} />
      {nodes.map((n) => (
        <button
          key={n.key}
          className={`${styles.node} ${n.isCurrent ? styles.nodeCurrent : ''}`}
          onClick={n.onClick}
          aria-label={`Open ${n.label}`}
          aria-pressed={n.isCurrent ? true : undefined}
        >
          <span className={`${styles.dot} ${n.isCurrent ? styles.dotCurrent : ''}`} />
          <span className={`${styles.nodeLabel} ${n.isCurrent ? styles.nodeLabelCurrent : ''}`}>
            {n.label}
          </span>
        </button>
      ))}
    </div>
  );
}
