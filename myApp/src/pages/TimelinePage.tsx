import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react';

import styles from './timeline.module.css';
import { getTrimesters, Trimester } from '../services/timelineService';

// Lazy-load the timeline parts
const TimelineRail = React.lazy(() => import('../components/TimelineRail'));
const TrimesterCard = React.lazy(() => import('../components/TrimesterCard'));
const TrimesterExpanded = React.lazy(() => import('../components/TrimesterExpanded'));

const TimelinePage: React.FC = () => {
  const [data, setData] = React.useState<Trimester[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [currentTrimesterId, setCurrentTrimesterId] = React.useState<string | null>(null);
  const [currentTrimesterIndex, setCurrentTrimesterIndex] = React.useState<number | null>(null);

  React.useEffect(() => {
    document.title = 'Pregnancy Timeline — MelaninRX';
    getTrimesters().then(setData);

    // TEMP for testing: simulate user in Trimester 2
    setCurrentTrimesterIndex(2);
    setCurrentTrimesterId('trimester-2');
  }, []);

  const active = data.find(t => t.id === activeId) ?? null;

  // Progress to the CENTER of the current node (T1=0, T2=0.5, T3=1 for 3 nodes)
  // If you prefer "fill to end of trimester", use: idx / n instead.
  const n = data.length || 1;
  const idx = currentTrimesterIndex ?? null;
  const progressToNodeCenter =
    idx != null && n > 1 ? (idx - 1) / (n - 1) : 0;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/home" />
          </IonButtons>
          <IonTitle>Pregnancy Timeline</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        <main className={styles.timelinePage}>
          <div className={styles.timelineHeader}>
            <h1 className={styles.h1}>Your Pregnancy Timeline</h1>
            {active && (
              <button className={styles.backBtn} onClick={() => setActiveId(null)}>
                Back
              </button>
            )}
          </div>

          <React.Suspense fallback={<div>Loading timeline…</div>}>
            <TimelineRail
              progress={progressToNodeCenter}
              nodes={data.map(t => ({
                key: t.id,
                label: `Trimester ${t.index}`,
                onClick: () => setActiveId(t.id),
                isCurrent: currentTrimesterId === t.id || currentTrimesterIndex === t.index
              }))}
            />

            {!active ? (
              <section className={styles.grid}>
                {data.map(t => (
                  <TrimesterCard key={t.id} data={t} onOpen={setActiveId} />
                ))}
              </section>
            ) : (
              <section className={styles.expandedWrap}>
                <TrimesterExpanded data={active} onBack={() => setActiveId(null)} />
              </section>
            )}
          </React.Suspense>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default TimelinePage;
