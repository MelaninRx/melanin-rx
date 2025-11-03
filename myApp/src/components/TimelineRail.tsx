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
  progress = 0, // 0..1 across the whole rail
  appendBaby = true,
}: {
  nodes: RailNode[];
  progress?: number;
  appendBaby?: boolean;
}) {
  const nodesWithBaby = React.useMemo(() => {
    if (!appendBaby) return nodes;
    return [...nodes, { key: 'baby', label: '👶', onClick: () => {} }];
  }, [nodes, appendBaby]);

  const [anim, setAnim] = React.useState(0);
  React.useEffect(() => {
    requestAnimationFrame(() => setAnim(progress));
  }, [progress]);

  const pct = Math.min(1, Math.max(0, anim)) * 100;
  const last = Math.max(1, nodesWithBaby.length - 1);

  return (
    <div className={styles.rail}>
      <div className={styles.railTrack} />
      <div className={styles.railProgress} style={{ width: `${pct}%` }} />

      <div className={styles.railStage}>
        {nodesWithBaby.map((n, i) => {
          const leftPct = (i / last) * 100;
          const isBaby = n.key === 'baby';
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
              <span className={`${styles.dot} ${isBaby ? styles.dotBaby : ''} ${n.isCurrent ? styles.dotCurrent : ''}`} />
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
