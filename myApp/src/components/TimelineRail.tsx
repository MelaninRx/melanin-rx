import React from 'react';
import styles from '../pages/timeline.module.css';

export type RailNode = {
  key: string;
  label: string;
  onClick: () => void;
  isCurrent?: boolean;
};

export default function TimelineRail({
  nodes,
  progress = 0, // 0..1
}: {
  nodes: RailNode[];
  progress?: number;
}) {
  const [anim, setAnim] = React.useState(0);
  React.useEffect(() => {
    // animate from 0 -> progress on mount/update
    requestAnimationFrame(() => setAnim(progress));
  }, [progress]);

  const pct = Math.min(1, Math.max(0, anim)) * 100;
  const last = Math.max(1, nodes.length - 1);

  return (
    <div className={styles.rail}>
      {/* Track layers (don’t affect layout) */}
      <div className={styles.railTrack} />
      <div className={styles.railProgress} style={{ width: `${pct}%` }} />

      {/* Stage: same left/right/top as the track, so positions match exactly */}
      <div className={styles.railStage}>
        {nodes.map((n, i) => {
          const leftPct = (i / last) * 100; // e.g., 0%, 50%, 100% for 3 nodes
          return (
            <button
              key={n.key}
              type="button"
              className={`${styles.nodeAbs} ${n.isCurrent ? styles.nodeCurrent : ''}`}
              style={{ left: `${leftPct}%` }}
              onClick={n.onClick}
              aria-label={`Open ${n.label}`}
              aria-pressed={n.isCurrent ? true : undefined}
            >
              <span className={`${styles.dot} ${n.isCurrent ? styles.dotCurrent : ''}`} />
              <span className={`${styles.nodeLabel} ${n.isCurrent ? styles.nodeLabelCurrent : ''}`}>
                {n.label}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
