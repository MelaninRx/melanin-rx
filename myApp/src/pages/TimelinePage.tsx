// src/pages/TimelinePage.tsx
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

  React.useEffect(() => {
    document.title = 'Pregnancy Timeline — MelaninRX';
    getTrimesters().then(setData);
  }, []);

  const active = data.find(t => t.id === activeId) ?? null;

  return (
    <IonPage>
      <IonHeader>
        <IonToolbar>
          <IonButtons slot="start">
            {/* Back to previous page (Home) */}
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
              nodes={data.map(t => ({
                key: t.id,
                label: `Trimester ${t.index}`,
                onClick: () => setActiveId(t.id),
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