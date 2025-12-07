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
  progress = 0,
  appendBaby = true,
  isPostpartum = false,
}: {
  nodes: RailNode[];
  progress?: number;
  appendBaby?: boolean;
  isPostpartum?: boolean;
}) {
  const nodesWithBaby = React.useMemo(() => {
    if (!appendBaby) return nodes;
    return [...nodes, { key: 'baby', label: '👶', onClick: () => {} }];
  }, [nodes, appendBaby]);

  const [anim, setAnim] = React.useState(0);
  React.useEffect(() => {
    requestAnimationFrame(() => setAnim(progress));
  }, [progress]);

  // Calculate percentage - cap at 100% to stop exactly at baby icon
  const pct = Math.min(100, Math.max(0, anim)) * 100;

  return (
    <div className={styles.trimesterProgress}>
      <div className={styles.progressTrack}>
        <div 
          className={styles.progressFill} 
          style={{ 
            width: `${pct}%`
          }} 
        />
      </div>
      <div className={styles.trimesterNodes}>
        {nodesWithBaby.map((node, index) => {
          const isBaby = node.key === 'baby';
          const trimesterNumber = index + 1;
          // Baby icon is active when postpartum, otherwise use node.isCurrent
          const isActive = isBaby ? isPostpartum : node.isCurrent;

          const totalNodes = nodesWithBaby.length - 1;
          const nodePosition = index / totalNodes;
          const hasPassed = progress >= nodePosition;

          return (
            <button
              key={node.key}
              className={`${styles.trimesterNode} ${isActive ? styles.trimesterNodeActive : ''} ${isBaby ? styles.trimesterNodeBaby : ''}`}
              onClick={node.onClick}
              aria-label={isBaby ? 'Baby' : `Trimester ${trimesterNumber}`}
              data-has-passed={hasPassed}
              data-index={index}
            >
              {isBaby ? (
                <svg width="81" height="81" viewBox="0 0 81 81" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <g filter="url(#filter0_d_baby)">
                    <rect x="8" y="4" width="65" height="65" rx="32.5" fill="white"/>
                    <rect x="8.5" y="4.5" width="64" height="64" rx="32" stroke="#ADADAD"/>
                    <path d="M41.5643 55.0456L41.5428 55.0491L41.4156 55.1118L41.3798 55.119L41.3547 55.1118L41.2275 55.0473C41.2084 55.0426 41.194 55.0462 41.1845 55.0581L41.1773 55.076L41.1469 55.8428L41.1558 55.8787L41.1737 55.902L41.3601 56.0346L41.3869 56.0417L41.4084 56.0346L41.5948 55.902L41.6163 55.8733L41.6234 55.8428L41.593 55.0778C41.5882 55.0587 41.5786 55.0479 41.5643 55.0456ZM42.0373 54.8431L42.0122 54.8467L41.6826 55.0133L41.6646 55.0312L41.6593 55.0509L41.6915 55.8213L41.7005 55.8428L41.7148 55.8572L42.0749 56.022C42.0976 56.028 42.115 56.0232 42.1269 56.0077L42.1341 55.9826L42.0731 54.8825C42.0672 54.8598 42.0552 54.8467 42.0373 54.8431ZM40.7563 54.8467C40.7484 54.8419 40.7389 54.8403 40.7299 54.8423C40.7209 54.8443 40.713 54.8498 40.7079 54.8574L40.6971 54.8825L40.6362 55.9826C40.6374 56.0041 40.6476 56.0184 40.6667 56.0256L40.6936 56.022L41.0537 55.8554L41.0716 55.8411L41.077 55.8213L41.1092 55.0509L41.1039 55.0294L41.0859 55.0115L40.7563 54.8467Z" fill="#642D56"/>
                    <path d="M40.5002 16.9583C50.3955 16.9583 58.4168 24.9796 58.4168 34.875C58.4168 44.7704 50.3955 52.7916 40.5002 52.7916C30.6048 52.7916 22.5835 44.7704 22.5835 34.875C22.5835 24.9796 30.6048 16.9583 40.5002 16.9583ZM40.5002 20.5416C36.9343 20.5436 33.4972 21.8746 30.8601 24.2748C28.223 26.675 26.5752 29.972 26.2386 33.522C25.902 37.0719 26.9007 40.6199 29.0398 43.4729C31.1788 46.326 34.3045 48.2793 37.8064 48.9514C41.3084 49.6235 44.9351 48.9661 47.9783 47.1076C51.0216 45.2491 53.2628 42.323 54.2643 38.9007C55.2659 35.4783 54.9557 31.8056 53.3945 28.5996C51.8334 25.3937 49.1332 22.8848 45.8214 21.5629C45.9794 22.652 45.7993 23.7634 45.3054 24.7468C44.8114 25.7303 44.0275 26.5384 43.0596 27.0621C42.0916 27.5857 40.9863 27.7996 39.8928 27.6749C38.7994 27.5501 37.7706 27.0928 36.9455 26.3646C36.6028 26.0633 36.388 25.6427 36.3447 25.1885C36.3015 24.7343 36.4333 24.2808 36.713 23.9203C36.9927 23.5599 37.3995 23.3198 37.8502 23.2489C38.3009 23.1781 38.7617 23.2819 39.1385 23.5391L39.3159 23.6771C39.5333 23.8688 39.7941 24.005 40.0757 24.0738C40.3573 24.1426 40.6515 24.142 40.9328 24.0721C41.2142 24.0023 41.4744 23.8651 41.6911 23.6725C41.9079 23.4799 42.0746 23.2376 42.177 22.9664C42.2795 22.6952 42.3146 22.4031 42.2793 22.1154C42.244 21.8276 42.1395 21.5527 41.9746 21.3142C41.8096 21.0758 41.5893 20.8809 41.3325 20.7463C41.0757 20.6118 40.7901 20.5415 40.5002 20.5416ZM45.2302 40.6656C45.595 40.9698 45.8241 41.4065 45.8671 41.8795C45.9101 42.3526 45.7635 42.8233 45.4595 43.1883C44.2555 44.6342 42.514 45.625 40.5002 45.625C38.4863 45.625 36.7448 44.6342 35.5408 43.1883C35.2501 42.8219 35.1142 42.3563 35.1621 41.8911C35.2101 41.4258 35.438 40.9977 35.7974 40.6983C36.1567 40.3988 36.6189 40.2518 37.0851 40.2886C37.5514 40.3253 37.9849 40.5429 38.2928 40.895C38.936 41.6654 39.7226 42.0416 40.5002 42.0416C41.2777 42.0416 42.0643 41.6654 42.7075 40.895C43.0117 40.5302 43.4483 40.3011 43.9214 40.2581C44.3944 40.2151 44.8652 40.3617 45.2302 40.6656ZM34.2293 31.2916C34.9421 31.2916 35.6257 31.5748 36.1297 32.0788C36.6337 32.5828 36.9168 33.2664 36.9168 33.9791C36.9168 34.6919 36.6337 35.3755 36.1297 35.8795C35.6257 36.3835 34.9421 36.6666 34.2293 36.6666C33.5166 36.6666 32.833 36.3835 32.329 35.8795C31.825 35.3755 31.5418 34.6919 31.5418 33.9791C31.5418 33.2664 31.825 32.5828 32.329 32.0788C32.833 31.5748 33.5166 31.2916 34.2293 31.2916ZM46.771 31.2916C47.4838 31.2916 48.1673 31.5748 48.6713 32.0788C49.1754 32.5828 49.4585 33.2664 49.4585 33.9791C49.4585 34.6919 49.1754 35.3755 48.6713 35.8795C48.1673 36.3835 47.4838 36.6666 46.771 36.6666C46.0582 36.6666 45.3747 36.3835 44.8706 35.8795C44.3666 35.3755 44.0835 34.6919 44.0835 33.9791C44.0835 33.2664 44.3666 32.5828 44.8706 32.0788C45.3747 31.5748 46.0582 31.2916 46.771 31.2916Z" fill="#642D56"/>
                  </g>
                  <defs>
                    <filter id="filter0_d_baby" x="0" y="0" width="81" height="81" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                      <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                      <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                      <feOffset dy="4"/>
                      <feGaussianBlur stdDeviation="4"/>
                      <feComposite in2="hardAlpha" operator="out"/>
                      <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                      <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_baby"/>
                      <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_baby" result="shape"/>
                    </filter>
                  </defs>
                </svg>
              ) : (
                <span className={styles.trimesterLabel}>T {trimesterNumber}</span>
              )}
            </button>
          );
        })}
      </div>
    </div>
  );
}
