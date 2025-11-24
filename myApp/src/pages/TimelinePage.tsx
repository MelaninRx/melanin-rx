import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonRouterLink, IonSpinner } from '@ionic/react';
import StatusCard from '../components/StatusCard';
import ChecklistCard from '../components/ChecklistCard';
import QuestionsCard from '../components/QuestionsCard';
import FetalDevelopment from '../components/FetalDevelopment';
import ChatWidget from '../components/ChatWidget';
import ChatButton from '../components/ChatButton';
import styles from './timeline.module.css';
import { getTrimesters, Trimester } from '../services/timelineService';
import homeIcon from '../icons/house.svg';
import addIcon from '../icons/Vector.svg';
import menuIcon from '../icons/menu.svg';
import chatbotIcon from '../icons/message-square.svg';
import communityIcon from '../icons/users.svg';
import timelineIcon from '../icons/calendar-days.svg';
import AppointmentIcon from '../icons/Frame 112.svg';
import LogoutIcon from "../icons/log-out.svg";
import settingsIcon from '../icons/settings.svg';
import profileIcon from '../icons/circle-user-round.svg';
import { logoutUser } from '../services/authService';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';

// Lazy-load the timeline parts
const TimelineRail = React.lazy(() => import('../components/TimelineRail'));
const TrimesterCard = React.lazy(() => import('../components/TrimesterCard'));
const TrimesterExpanded = React.lazy(() => import('../components/TrimesterExpanded'));

// Calendar component for TimelinePage
function CalendarView({ appointments = [] }: { appointments?: any[] }) {
  const today = new Date();
  const [month, setMonth] = React.useState(today.getMonth());
  const [year, setYear] = React.useState(today.getFullYear());

  // Collect appointment dates for this month/year
  const apptDates = appointments
    .map(appt => {
      let apptDate;
      if (appt.dateTime instanceof Timestamp) {
        apptDate = appt.dateTime.toDate();
      } else if (typeof appt.dateTime === 'string') {
        apptDate = new Date(appt.dateTime);
      } else if (appt.dateTime?.toDate) {
        apptDate = appt.dateTime.toDate();
      } else {
        return null;
      }
      return apptDate.getFullYear() === year && apptDate.getMonth() === month ? apptDate.getDate() : null;
    })
    .filter(Boolean);

  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const weeks = [];
  let day = 1 - firstDay;
  for (let w = 0; w < 6; w++) {
    const week = [];
    for (let d = 0; d < 7; d++, day++) {
      if (day > 0 && day <= daysInMonth) {
        week.push(day);
      } else {
        week.push('');
      }
    }
    weeks.push(week);
    if (day > daysInMonth) break;
  }

  // Navigation handlers for month/year
  const handlePrevMonth = () => {
    if (month === 0) {
      setMonth(11);
      setYear(year - 1);
    } else {
      setMonth(month - 1);
    }
  };
  const handleNextMonth = () => {
    if (month === 11) {
      setMonth(0);
      setYear(year + 1);
    } else {
      setMonth(month + 1);
    }
  };

  return (
    <div style={{ background: '#FFF', borderRadius: '24px', boxShadow: '0 2px 8px rgba(108,74,182,0.10)', border: '1px solid var(--color-border-purple)', padding: '24px', minWidth: '280px', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '20px', cursor: 'pointer' }}>{'<'}</button>
        <h2 style={{ color: 'var(--color-primary)', fontFamily: 'Source Serif Pro, serif', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>{monthNames[month]} {year}</h2>
        <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: 'var(--color-primary)', fontSize: '20px', cursor: 'pointer' }}>{'>'}</button>
      </div>
      <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', fontSize: '15px', color: 'var(--color-dark-purple)', marginTop: '8px', marginBottom: '8px' }}>
        <thead>
          <tr>
            <th style={{ paddingBottom: '10px' }}>Sun</th><th style={{ paddingBottom: '10px' }}>Mon</th><th style={{ paddingBottom: '10px' }}>Tue</th><th style={{ paddingBottom: '10px' }}>Wed</th><th style={{ paddingBottom: '10px' }}>Thu</th><th style={{ paddingBottom: '10px' }}>Fri</th><th style={{ paddingBottom: '10px' }}>Sat</th>
          </tr>
        </thead>
        <tbody>
          {weeks.map((week, i) => (
            <tr key={i}>
              {week.map((d, j) => {
                const isToday = d === today.getDate() && month === today.getMonth() && year === today.getFullYear();
                const hasAppt = apptDates.includes(d);
                return (
                  <td key={j} style={{
                    background: isToday ? 'var(--color-light-purple)' : 'none',
                    borderRadius: isToday ? '50%' : '0',
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? 'var(--color-primary)' : undefined,
                    padding: '10px 0 16px 0',
                    position: 'relative',
                    minWidth: '36px',
                    height: '38px',
                    verticalAlign: 'middle',
                  }}>
                    {d || ''}
                    {hasAppt && d && (
                      <span style={{
                        display: 'block',
                        width: '6px',
                        height: '6px',
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        position: 'absolute',
                        left: '50%',
                        bottom: '6px',
                        transform: 'translateX(-50%)',
                      }} />
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// Calculate current week and trimester from user's due date
const calculateCurrentWeek = (dueDateString: string | Date | undefined): number | null => {
  if (!dueDateString) return null;
  
  try {
    const dueDate = typeof dueDateString === 'string' ? new Date(dueDateString) : dueDateString;
    if (isNaN(dueDate.getTime())) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    // Calculate weeks until due date
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const weeksUntilDue = Math.floor(daysUntilDue / 7);
    
    // Current week of pregnancy (assuming 40 week pregnancy)
    return Math.max(0, Math.min(40, 40 - weeksUntilDue));
  } catch (e) {
    console.error('Error calculating current week:', e);
    return null;
  }
};

const TimelinePage: React.FC = () => {
  // All hooks must be called before any return!
  const [data, setData] = React.useState<Trimester[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [currentTrimesterId, setCurrentTrimesterId] = React.useState<string | null>(null);
  const [currentTrimesterIndex, setCurrentTrimesterIndex] = React.useState<number | null>(null);
  const [currentWeek, setCurrentWeek] = React.useState<number>(0);
  const [dueDate, setDueDate] = React.useState<Date>(new Date());

  // Chat Widget state
  const [isChatOpen, setIsChatOpen] = React.useState(false);
  const [selectedQuestion, setSelectedQuestion] = React.useState<string>('');
  const [soonAppointments, setSoonAppointments] = React.useState<any[]>([]);
  const [error, setError] = React.useState<string | null>(null);
  const user = useCurrentUser();

  // Debug: log user object and onboardingComplete
  console.log('[TimelinePage] user:', user);
  console.log('[TimelinePage] onboardingComplete:', user?.onboardingComplete);

  React.useEffect(() => {
    document.title = 'Pregnancy Timeline — MelaninRX';
    getTrimesters().then(setData);
  }, []);

  // Set current trimester and week from user's database info
  React.useEffect(() => {
    if (user?.dueDate) {
      try {
        const calculatedWeek = calculateCurrentWeek(user.dueDate);
        const parsedDueDate = typeof user.dueDate === 'string' 
          ? new Date(user.dueDate) 
          : (user.dueDate instanceof Date ? user.dueDate : new Date(user.dueDate));
        
        if (calculatedWeek !== null && !isNaN(parsedDueDate.getTime())) {
          setCurrentWeek(calculatedWeek);
          setDueDate(parsedDueDate);
          
          // Calculate trimester from current week
          let trimesterNum: number;
          if (calculatedWeek < 14) {
            trimesterNum = 1;
          } else if (calculatedWeek < 28) {
            trimesterNum = 2;
          } else {
            trimesterNum = 3;
          }
          
          setCurrentTrimesterIndex(trimesterNum);
          setCurrentTrimesterId(`trimester-${trimesterNum}`);
        }
      } catch (e) {
        console.error('Error processing due date:', e);
      }
    } else if (user?.trimester) {
      // Fallback to trimester if dueDate not available
      const trimesterNum = parseInt(user.trimester, 10);
      if (trimesterNum >= 1 && trimesterNum <= 3) {
        setCurrentTrimesterIndex(trimesterNum);
        setCurrentTrimesterId(`trimester-${trimesterNum}`);
      }
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

  // All hooks above! Now do conditional rendering:
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

  const active = data.find(t => t.id === activeId) ?? null;

  // Calculate progress based on current week of pregnancy (0-40 weeks)
  // Progress should reflect actual pregnancy progress, not just trimester
  const totalWeeks = 40;
  const progressToNodeCenter = currentWeek > 0 
    ? Math.min(1, Math.max(0, currentWeek / totalWeeks))
    : 0;

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
          <IonTitle>Pregnancy Timeline</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        <aside className="side-panel">
          <div className="nav-top">
            <IonButton fill="clear" routerLink="/menu">
              <IonIcon icon={menuIcon} />
              <span className="menu-text">Menu</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/home">
              <IonIcon icon={homeIcon} />
              <span className="menu-text">Home</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/add">
              <IonIcon icon={addIcon} />
              <span className="menu-text">New Chat</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/chatbot">
              <IonIcon icon={chatbotIcon} />
              <span className="menu-text">Chats</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/community">
              <IonIcon icon={communityIcon} />
              <span className="menu-text">Communities</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/timeline">
              <IonIcon icon={timelineIcon} />
              <span className="menu-text">Timeline</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/appointments">
              <IonIcon icon={AppointmentIcon} />
              <span className="menu-text">Appointments</span>
            </IonButton>
          </div>
          <div className="nav-bottom">
            <IonButton fill='clear' onClick={logoutUser}>
              <IonIcon icon={LogoutIcon} />
              <span className="menu-text">Log out</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/settings">
              <IonIcon icon={settingsIcon} />
              <span className="menu-text">Setting</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/profile">
              <IonIcon icon={profileIcon} />
              <span className="menu-text">Profile</span>
            </IonButton>
          </div>
        </aside>

        <main className={styles.timelinePage}>
          <div className={styles.timelineHeader} style={{ paddingTop: '32px', paddingLeft: '32px', paddingRight: '32px' }}>
            <h1 className={styles.h1}>Your Pregnancy Timeline</h1>
            {active && (
              <button className={styles.backBtn} onClick={() => setActiveId(null)}>
                Back
              </button>
            )}
          </div>

          <React.Suspense fallback={<div>Loading timeline…</div>}>
            {/* Status card */}
            <div style={{ paddingLeft: '32px', paddingRight: '32px' }}>
              <StatusCard currentWeek={currentWeek} dueDate={dueDate} />
              <TimelineRail
                appendBaby
                progress={progressToNodeCenter}
                nodes={data.map(t => ({
                  key: t.id,
                  label: `Trimester ${t.index}`,
                  onClick: () => setActiveId(t.id),
                  isCurrent: currentTrimesterId === t.id || currentTrimesterIndex === t.index
                }))}
              />
              {!active ? (
                <section className={styles.grid} style={{ marginTop: '24px', marginBottom: '24px' }}>
                  {data.map(t => (
                    <TrimesterCard key={t.id} data={t} onOpen={setActiveId} />
                  ))}
                </section>
              ) : (
                <div style={{ paddingLeft: '32px', paddingRight: '32px' }}>
                  {/* Overview Section */}
                  <section className={styles.expandedWrap}>
                    <div className={styles.infoCard}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '12px' }}>
                        <div className={styles.cardTitle}>{active.title}</div>
                        <div className={styles.badge}>{active.weeksRange}</div>
                      </div>
                      <p className={styles.cardBody} style={{ marginTop: 0, fontSize: '16px', lineHeight: '1.6' }}>{active.summary}</p>
                    </div>
                  </section>

                  {/* Two Column Layout for Checklist and Questions */}
                  <div style={{ 
                    display: 'grid', 
                    gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', 
                    gap: '24px',
                    marginTop: '24px'
                  }}>
                    <section>
                      <ChecklistCard
                        items={active.checklist}
                        storageKey={`chk_${active.id}_${user?.uid || 'demoUser'}`}
                        title={`${active.title} Checklist`}
                      />
                    </section>

                    <section>
                      <QuestionsCard
                        items={active.doctorTips}
                        onQuestionClick={handleQuestionClick}
                      />
                    </section>
                  </div>
                </div>
              )}
            </div>

            {/* Move the 3 cards below timeline and trimester cards */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '32px', paddingLeft: '32px', paddingRight: '32px', paddingBottom: '32px' }}>
              {/* Upcoming Appointments - first slot */}
              <div style={{ flex: '0 0 420px', maxWidth: '420px', minWidth: '320px', width: '100%' }}>
                <section className={styles.infoCard}>
                  <div className={styles.cardTitle} style={{ marginBottom: '16px' }}>Upcoming Appointments</div>
                  {soonAppointments.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '15px', margin: '16px 0' }}>
                      No upcoming appointments.
                    </div>
                  ) : (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                      {soonAppointments.map(appt => (
                        <IonRouterLink key={appt.id} routerLink={`/appointments/${user?.uid}/${appt.id}`} style={{ textDecoration: 'none' }}>
                          <div style={{ 
                            background: 'var(--color-light)', 
                            borderRadius: '16px', 
                            padding: '16px', 
                            border: '1px solid var(--color-mid)',
                            cursor: 'pointer', 
                            transition: 'all 0.2s ease',
                            display: 'flex',
                            flexDirection: 'column',
                            gap: '8px'
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-accent)';
                            e.currentTarget.style.boxShadow = '0 4px 12px rgba(127, 93, 140, 0.15)';
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = 'var(--color-mid)';
                            e.currentTarget.style.boxShadow = 'none';
                          }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                              <IonIcon icon={AppointmentIcon} style={{ color: 'var(--color-primary)', fontSize: '20px' }} />
                              <span style={{ fontWeight: 700, color: 'var(--color-primary)', fontSize: '16px' }}>{appt.provider} @ {appt.location}</span>
                            </div>
                            <div style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>{
                              appt.dateTime instanceof Timestamp
                                ? appt.dateTime.toDate().toLocaleString()
                                : appt.dateTime?.toDate?.()
                                  ? appt.dateTime.toDate().toLocaleString()
                                  : typeof appt.dateTime === 'string'
                                    ? new Date(appt.dateTime).toLocaleString()
                                    : ''
                            }</div>
                            {appt.notes && appt.notes.length > 0 && (
                              <div style={{ marginTop: '4px' }}>
                                <span style={{ color: 'var(--color-primary)', fontWeight: 600, fontSize: '13px' }}>Notes/Questions:</span>
                                <ul className={styles.list} style={{ marginTop: '4px' }}>
                                  {appt.notes.map((note: string, idx: number) => (
                                    <li key={idx} className={styles.listItem} style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{note}</li>
                                  ))}
                                </ul>
                              </div>
                            )}
                          </div>
                        </IonRouterLink>
                      ))}
                    </div>
                  )}
                </section>
              </div>
              {/* Calendar - middle slot */}
              <div style={{ flex: '0 0 420px', maxWidth: '420px', minWidth: '320px', width: '100%' }}>
                <CalendarView appointments={soonAppointments} />
              </div>
              {/* Fetal Development - third slot */}
              <div style={{ flex: '0 0 420px', maxWidth: '420px', minWidth: '320px', width: '100%' }}>
                <FetalDevelopment currentWeek={currentWeek} />
              </div>
            </div>
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
