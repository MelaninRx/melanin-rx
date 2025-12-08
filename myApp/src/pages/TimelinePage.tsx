import React from 'react';
import { IonPage, IonContent, IonButton, IonRouterLink, IonSpinner } from '@ionic/react';
import { useLocation } from 'react-router-dom';
import StatusCard from '../components/StatusCard';
import FetalDevelopment from '../components/FetalDevelopment';
import SelfCareFocus from '../components/SelfCareFocus';
import Calendar from '../components/Calendar';
import ChatWidget from '../components/ChatWidget';
import ChatButton from '../components/ChatButton';
import styles from './timeline.module.css';
import { getTrimesters, getPostpartum, Trimester } from '../services/timelineService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';
import SidebarNav from '../components/SidebarNav';
import MobileMenuButton from '../components/MobileMenuButton';

const TimelineRail = React.lazy(() => import('../components/TimelineRail'));
const TrimesterCard = React.lazy(() => import('../components/TrimesterCard'));
const TrimesterExpanded = React.lazy(() => import('../components/TrimesterExpanded'));

// Calculate current week and detect postpartum
const calculateCurrentWeek = (dueDateString: string | Date | undefined): { week: number | null; isPostpartum: boolean } => {
  if (!dueDateString) return { week: null, isPostpartum: false };
  
  try {
    const dueDate = typeof dueDateString === 'string' ? new Date(dueDateString) : dueDateString;
    if (isNaN(dueDate.getTime())) return { week: null, isPostpartum: false };
    
  const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    
    // If due date has passed, user is postpartum
    if (daysUntilDue < 0) {
      // Calculate weeks postpartum (can go beyond 40)
      const weeksPostpartum = Math.abs(Math.floor(daysUntilDue / 7));
      return { week: 40 + weeksPostpartum, isPostpartum: true };
    }
    
    const weeksUntilDue = Math.floor(daysUntilDue / 7);
    return { week: Math.max(0, Math.min(40, 40 - weeksUntilDue)), isPostpartum: false };
  } catch (e) {
    console.error('Error calculating current week:', e);
    return { week: null, isPostpartum: false };
  }
};

const TimelinePage: React.FC = () => {
  const location = useLocation();
  const [data, setData] = React.useState<Trimester[]>([]);
  const [postpartumData, setPostpartumData] = React.useState<Trimester | null>(null);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [isShowingPostpartum, setIsShowingPostpartum] = React.useState<boolean>(false);
  const [currentTrimesterId, setCurrentTrimesterId] = React.useState<string | null>(null);
  const [currentTrimesterIndex, setCurrentTrimesterIndex] = React.useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = React.useState<number>(15);
  const [dueDate, setDueDate] = React.useState<Date>(new Date());
  const [isPostpartum, setIsPostpartum] = React.useState<boolean>(false);
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [selectedQuestion, setSelectedQuestion] = React.useState<string>('');
  const [soonAppointments, setSoonAppointments] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = React.useState(false);
  const user = useCurrentUser();

  React.useEffect(() => {
    document.title = 'Pregnancy Timeline — MelaninRX';
    getTrimesters().then(setData);
    getPostpartum().then(setPostpartumData);
  }, []);

  // Check for postpartum query parameter when location changes
  React.useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    if (searchParams.get('postpartum') === 'true' && isPostpartum && postpartumData) {
      setIsShowingPostpartum(true);
      setActiveId(null);
    }
  }, [location.search, isPostpartum, postpartumData]);

  React.useEffect(() => {
    if (user?.dueDate) {
      try {
        const { week, isPostpartum: postpartum } = calculateCurrentWeek(user.dueDate);
        const parsedDueDate = typeof user.dueDate === 'string' 
          ? new Date(user.dueDate) 
          : (user.dueDate instanceof Date ? user.dueDate : new Date(user.dueDate));
        
        if (week !== null && !isNaN(parsedDueDate.getTime())) {
          setCurrentWeek(week);
          setDueDate(parsedDueDate);
          setIsPostpartum(postpartum);
          
          if (postpartum) {
            // Postpartum - don't set trimester index/id
            setCurrentTrimesterIndex(null);
            setCurrentTrimesterId(null);
          } else {
            let trimesterNum: number;
            if (week < 14) {
              trimesterNum = 1;
            } else if (week < 28) {
              trimesterNum = 2;
            } else {
              trimesterNum = 3;
            }
            
            setCurrentTrimesterIndex(trimesterNum);
            setCurrentTrimesterId(`trimester-${trimesterNum}`);
          }
        }
      } catch (e) {
        console.error('Error processing due date:', e);
      }
    } else if (user?.trimester && user.trimester !== 'postpartum') {
      const trimesterNum = parseInt(user.trimester, 10);
      if (trimesterNum >= 1 && trimesterNum <= 3) {
        setCurrentTrimesterIndex(trimesterNum);
        setCurrentTrimesterId(`trimester-${trimesterNum}`);
      }
    } else if (user?.trimester === 'postpartum') {
      setIsPostpartum(true);
      setCurrentTrimesterIndex(null);
      setCurrentTrimesterId(null);
    }
  }, [user]);

  React.useEffect(() => {
    async function fetchSoonAppointments() {
      if (user === undefined) return;
      if (!user?.uid) return;
      try {
        const db = getFirestore();
        const allSnapshot = await getDocs(collection(db, 'users', user.uid, 'appointments'));
        const allAppts = allSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
        const now = new Date();
        const appts = allAppts
          .filter(appt => {
            let apptDate;
            if (appt.dateTime instanceof Timestamp) {
              apptDate = appt.dateTime.toDate();
            } else if (typeof appt.dateTime === 'string') {
              apptDate = new Date(appt.dateTime);
            } else if (appt.dateTime?.toDate) {
              apptDate = appt.dateTime.toDate();
            } else {
              return false;
            }
            return apptDate >= now;
          })
          .sort((a, b) => {
            let aDate = a.dateTime instanceof Timestamp ? a.dateTime.toDate() : new Date(a.dateTime);
            let bDate = b.dateTime instanceof Timestamp ? b.dateTime.toDate() : new Date(b.dateTime);
            return aDate.getTime() - bDate.getTime();
          })
          .slice(0, 2);
        setSoonAppointments(appts);
      } catch (err: any) {
        setError(err.message || 'Failed to load appointments.');
      }
    }
    fetchSoonAppointments();
  }, [user]);

  if (error) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ textAlign: 'center', marginTop: '50%' }}>
            <h2>An error occurred in the TimelinePage component.</h2>
            <p>{error}</p>
            <p>Please try refreshing the page or contact support.</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  if (user === undefined) {
    return (
      <IonPage>
        <IonContent>
          <div style={{ textAlign: 'center', marginTop: '50%' }}>
            <IonSpinner />
            <p>Loading your profile data...</p>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const active = isShowingPostpartum ? postpartumData : (data.find(t => t.id === activeId) ?? null);
  const totalWeeks = 40;
  // For postpartum, set progress to exactly 1.0 (100%) to reach the baby icon
  // For pregnancy, calculate based on current week
  const progressToNodeCenter = currentWeek > 0 
    ? isPostpartum 
      ? 1.0 // Exactly 100% to stop at baby icon
      : Math.min(1, Math.max(0, currentWeek / totalWeeks))
    : 0;
  
  const handleBabyClick = () => {
    if (isPostpartum && postpartumData) {
      setIsShowingPostpartum(true);
      setActiveId(null); // Clear any trimester selection
    }
  };
  
  const handleBack = () => {
    setIsShowingPostpartum(false);
    setActiveId(null);
  };

  return (
    <IonPage>
      <IonContent fullscreen>
        <MobileMenuButton />
        <SidebarNav onToggle={setSidebarExpanded} />

        <main className={`${styles.timelinePage} ${sidebarExpanded ? styles['sidebar-expanded'] : ''}`}>
          <div className={styles.timelineHeader} style={{ position: 'relative' }}>

            <h1 className={styles.h1}>Your Pregnancy Timeline</h1>
            <p className={styles.timelineSubtitle}>Track your journey and prepare for each milestone.</p>
            {(active || isShowingPostpartum) && <button className={styles.backBtn} onClick={handleBack}>Back</button>}
          </div>

          <React.Suspense fallback={<div>Loading timeline…</div>}>
            <StatusCard currentWeek={currentWeek} dueDate={dueDate} isPostpartum={isPostpartum} />
            
            <TimelineRail
              appendBaby
              progress={progressToNodeCenter}
              nodes={data.map(t => ({
                key: t.id,
                label: `T ${t.index}`,
                onClick: () => {
                  setActiveId(t.id);
                  setIsShowingPostpartum(false);
                },
                isCurrent: !isPostpartum && (currentTrimesterId === t.id || currentTrimesterIndex === t.index)
              }))}
              isPostpartum={isPostpartum}
              onBabyClick={handleBabyClick}
            />

              {!active && !isShowingPostpartum ? (
              <section className={styles.grid}>
                  {data.map(t => (
                    <TrimesterCard key={t.id} data={t} onOpen={(id) => {
                      setActiveId(id);
                      setIsShowingPostpartum(false);
                    }} />
                  ))}
                  {isPostpartum && postpartumData && (
                    <TrimesterCard 
                      key={postpartumData.id} 
                      data={postpartumData} 
                      fullWidth={true}
                      onOpen={() => {
                        setIsShowingPostpartum(true);
                        setActiveId(null);
                      }} 
                    />
                  )}
                </section>
              ) : (active || (isShowingPostpartum && postpartumData)) ? (
                  <section className={styles.expandedWrap}>
                <TrimesterExpanded 
                  data={isShowingPostpartum && postpartumData ? postpartumData : active!} 
                  onBack={handleBack}
                  onQuestionClick={(question) => {
                    setSelectedQuestion(question);
                    setIsChatOpen(true);
                  }}
                />
                  </section>
            ) : null}

            <div className={styles.bottomGrid}>
              <div className={styles.appointmentsCard}>
                <div className={styles.appointmentsTitle}>Upcoming Appointments</div>
                <div className={styles.appointmentsBtnGroup}>
                  <IonButton 
                    routerLink="/appointments" 
                    className={styles.addAppointmentBtn}
                    expand="block"
                  >
                    Add Appointment
                  </IonButton>
            </div>
                  {soonAppointments.length === 0 ? (
                  <div style={{ textAlign: 'center', color: 'var(--color-text-gray)', fontSize: '14px', margin: '16px 0' }}>
                      No upcoming appointments.
                    </div>
                  ) : (
                  soonAppointments.map((appt, index) => (
                    <React.Fragment key={appt.id}>
                      <div style={{ position: 'relative' }}>
                        <svg style={{ position: 'absolute', right: '0', top: '8px', width: '23px', height: '23px' }} width="23" height="23" viewBox="0 0 23 23" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M11.5002 12.4583C12.0294 12.4583 12.4585 12.0292 12.4585 11.5C12.4585 10.9707 12.0294 10.5416 11.5002 10.5416C10.9709 10.5416 10.5418 10.9707 10.5418 11.5C10.5418 12.0292 10.9709 12.4583 11.5002 12.4583Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M18.2085 12.4583C18.7378 12.4583 19.1668 12.0292 19.1668 11.5C19.1668 10.9707 18.7378 10.5416 18.2085 10.5416C17.6792 10.5416 17.2502 10.9707 17.2502 11.5C17.2502 12.0292 17.6792 12.4583 18.2085 12.4583Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                          <path d="M4.79183 12.4583C5.3211 12.4583 5.75016 12.0292 5.75016 11.5C5.75016 10.9707 5.3211 10.5416 4.79183 10.5416C4.26256 10.5416 3.8335 10.9707 3.8335 11.5C3.8335 12.0292 4.26256 12.4583 4.79183 12.4583Z" stroke="black" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                        </svg>
                        <div className={styles.appointmentItem}>
                          <div className={styles.appointmentAccent}></div>
                          <div className={styles.appointmentDetails}>
                            <IonRouterLink routerLink={`/appointments/${user?.uid}/${appt.id}`} style={{ textDecoration: 'none', display: 'block' }}>
                              <div className={styles.appointmentTitle}>{appt.provider || appt.title}</div>
                              <div className={styles.appointmentSub}>
                                {appt.dateTime instanceof Timestamp
                                  ? appt.dateTime.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                              : appt.dateTime?.toDate?.()
                                    ? appt.dateTime.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                                : typeof appt.dateTime === 'string'
                                      ? new Date(appt.dateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                                      : ''}
                                {appt.location ? ` (${appt.location})` : ''}
                              </div>
                              <div className={styles.appointmentType}>{appt.type || appt.reason}</div>
                            </IonRouterLink>
                          {appt.notes && appt.notes.length > 0 && (
                              <>
                                <div className={styles.appointmentNotes}>
                                  <div className={styles.notesLabel}>Notes/ Questions:</div>
                                  <div className={styles.notesList}>
                                    {appt.notes.slice(0, 2).map((note: string, idx: number) => (
                                      <div key={idx}>Notes {idx + 1}</div>
                                    ))}
                                  </div>
                            </div>
                              </>
                          )}
                          </div>
                        </div>
                      </div>
                      {index < soonAppointments.length - 1 && (
                        <div className={styles.appointmentDivider} />
                      )}
                    </React.Fragment>
                  ))
                )}
              </div>

              <Calendar appointments={soonAppointments} />
              
              {(isPostpartum || isShowingPostpartum) ? (
                <SelfCareFocus weeksPostpartum={currentWeek - 40} />
              ) : (
                <FetalDevelopment currentWeek={currentWeek} isPostpartum={false} />
              )}
            </div>
          </React.Suspense>
        </main>

        {!isChatOpen && (
          <div style={{ width: '18px', height: '18px', minWidth: '48px', minHeight: '48px', fontSize: '22px' }}>
            <ChatButton onClick={() => setIsChatOpen(true)} />
          </div>
        )}
        
        <ChatWidget
          isOpen={isChatOpen}
          onClose={() => {
            setIsChatOpen(false);
            setSelectedQuestion(''); // Clear the selected question when widget closes
          }}
          initialQuestion={selectedQuestion}
        />
      </IonContent>
    </IonPage>
  );
};

export default TimelinePage;
