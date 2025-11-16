import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton } from '@ionic/react';
import StatusCard from '../components/StatusCard';
import ChecklistCard from '../components/ChecklistCard';
import QuestionsCard from '../components/QuestionsCard';
import ChatWidget from '../components/ChatWidget';
import ChatButton from '../components/ChatButton';
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

  // Chat Widget state
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [selectedQuestion, setSelectedQuestion] = React.useState<string>('');

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

  const handleQuestionClick = (question: string) => {
    setSelectedQuestion(question);
    setIsChatOpen(true);
  };

  const handleChatButtonClick = () => {
    setSelectedQuestion('');
    setIsChatOpen(true);
  };

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
            {/* Status card — TODO: wire real values */}
            <StatusCard currentWeek={22} dueDate={new Date('2026-03-01')} />

            <TimelineRail
              appendBaby
              progress={
                // Map to 4 nodes (T1,T2,T3,Baby). Node centers at 0, 1/3, 2/3, 1.
                (currentTrimesterIndex && n > 1) ? (currentTrimesterIndex - 1) / ( (n + 1) - 1 ) : 0
                // ^ n = data.length, +1 because of the Baby node
              }
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
              <>
                <section className={styles.expandedWrap}>
                  <div className={styles.infoCard}>
                    <div className={styles.cardTitle}>{active.title}</div>
                    <div className={styles.cardSub}>{active.weeksRange}</div>
                    <p className={styles.cardBody} style={{ marginTop: 10 }}>{active.summary}</p>
                  </div>
                </section>

                <section className={styles.expandedWrap}>
                  <ChecklistCard
                    items={active.checklist}
                    storageKey={`chk_${active.id}_demoUser`}  /* swap demoUser for real user id later */
                  />
                </section>

                <section className={styles.expandedWrap}>
                  <QuestionsCard
                  items={active.doctorTips}
                  onQuestionClick={handleQuestionClick}
                  />
                </section>
              </>
            )}
          </React.Suspense>
        </main>

        {/* Chat Button - Always visible */}
        {!isChatOpen && (
          <ChatButton onClick={handleChatButtonClick} />
        )}
        
        {/* Chat Widget */}
        <ChatWidget
          isOpen={isChatOpen}
          onClose={() => setIsChatOpen(false)}
          initialQuestion={selectedQuestion}
        />
      </IonContent>
    </IonPage>
  );
};

export default TimelinePage;
