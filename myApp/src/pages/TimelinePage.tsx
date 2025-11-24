import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent, IonButtons, IonBackButton, IonButton, IonIcon, IonRouterLink, IonSpinner } from '@ionic/react';
import StatusCard from '../components/StatusCard';
import ChecklistCard from '../components/ChecklistCard';
import QuestionsCard from '../components/QuestionsCard';
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
import SidebarNav from '../components/SidebarNav';

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
    <div style={{ background: '#FFF', borderRadius: '24px', boxShadow: '0 2px 8px rgba(108,74,182,0.10)', border: '1px solid #E0D7F7', padding: '24px', minWidth: '280px', maxWidth: '400px', width: '100%', display: 'flex', flexDirection: 'column', marginBottom: '24px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '12px' }}>
        <button onClick={handlePrevMonth} style={{ background: 'none', border: 'none', color: '#6C4AB6', fontSize: '20px', cursor: 'pointer' }}>{'<'}</button>
        <h2 style={{ color: '#6C4AB6', fontFamily: 'Source Serif Pro, serif', fontWeight: 700, fontSize: '1.25rem', margin: 0 }}>{monthNames[month]} {year}</h2>
        <button onClick={handleNextMonth} style={{ background: 'none', border: 'none', color: '#6C4AB6', fontSize: '20px', cursor: 'pointer' }}>{'>'}</button>
      </div>
      <table style={{ width: '100%', textAlign: 'center', borderCollapse: 'collapse', fontSize: '15px', color: '#3D246C', marginTop: '8px', marginBottom: '8px' }}>
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
                    background: isToday ? '#F3E8FF' : 'none',
                    borderRadius: isToday ? '50%' : '0',
                    fontWeight: isToday ? 700 : 400,
                    color: isToday ? '#6C4AB6' : undefined,
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
                        background: '#6C4AB6',
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

const TimelinePage: React.FC = () => {
  // All hooks must be called before any return!
  const [data, setData] = React.useState<Trimester[]>([]);
  const [activeId, setActiveId] = React.useState<string | null>(null);
  const [currentTrimesterId, setCurrentTrimesterId] = React.useState<string | null>(null);
  const [currentTrimesterIndex, setCurrentTrimesterIndex] = React.useState<number | null>(null);

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
    setCurrentTrimesterIndex(2); // TEMP for testing
    setCurrentTrimesterId('trimester-2');
  }, []);

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

      <IonContent fullscreen className="timeline-content" style={{ paddingLeft: '80px' }}>
        <SidebarNav/>

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
            {/* Status card — TODO: wire real values */}
            <div style={{ paddingLeft: '32px', paddingRight: '32px' }}>
              <StatusCard currentWeek={22} dueDate={new Date('2026-03-01')} />
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
                      storageKey={`chk_${active.id}_demoUser`}
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
            </div>

            {/* Move the 3 cards below timeline and trimester cards */}
            <div style={{ display: 'flex', gap: '24px', marginTop: '32px', paddingLeft: '32px', paddingRight: '32px', paddingBottom: '32px' }}>
              {/* Upcoming Appointments - first slot */}
              <div style={{ flex: '0 0 420px', maxWidth: '420px', minWidth: '320px', width: '100%' }}>
                <div style={{ background: '#FFF', borderRadius: '18px', boxShadow: '0 2px 8px rgba(108,74,182,0.10)', border: '1px solid #E0D7F7', padding: '24px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'stretch', marginBottom: '24px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '18px' }}>
                    <h2 style={{ color: '#1A1A1A', fontFamily: 'Source Serif Pro, serif', fontWeight: 700, fontSize: '1.5rem', margin: 0 }}>Upcoming Appointments</h2>
                  </div>
                  <div style={{ display: 'flex', gap: '12px', marginBottom: '18px' }}>
                    <button style={{ background: '#6C4AB6', color: '#FFF', fontWeight: 200, fontSize: '0.90rem', borderRadius: '12px', border: 'none', padding: '10px 24px', cursor: 'pointer', fontFamily: 'Source Serif Pro, serif', boxShadow: '0 2px 8px rgba(108,74,182,0.10)' }}>Add Appointment</button>
                    <button style={{ background: '#F3E8FF', color: '#3D246C', fontWeight: 200, fontSize: '0.90rem', borderRadius: '12px', border: '1px solid #E0D7F7', padding: '10px 24px', cursor: 'not-allowed', fontFamily: 'Source Serif Pro, serif', boxShadow: '0 2px 8px rgba(108,74,182,0.10)' }} disabled>Edit Appointments</button>
                  </div>
                  <div>
                    {soonAppointments.length === 0 ? (
                      <div style={{ textAlign: 'center', color: '#3D246C', fontFamily: 'Source Serif Pro, serif', fontSize: '18px', margin: '16px 0' }}>
                        No upcoming appointments.
                      </div>
                    ) : (
                      soonAppointments.map((appt, idx) => {
                        // Format date/time
                        let apptDate;
                        if (appt.dateTime instanceof Timestamp) {
                          apptDate = appt.dateTime.toDate();
                        } else if (typeof appt.dateTime === 'string') {
                          apptDate = new Date(appt.dateTime);
                        } else if (appt.dateTime?.toDate) {
                          apptDate = appt.dateTime.toDate();
                        }
                        const dateStr = apptDate ? apptDate.toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' }) : '';
                        const timeStr = apptDate ? apptDate.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' }) : '';
                        // Type/subtext
                        const typeStr = appt.type || (appt.location?.toLowerCase().includes('video') ? 'Telehealth' : '');
                        const subStr = appt.reason || appt.type || '';
                        return (
                          <IonRouterLink key={appt.id} routerLink={`/appointments/${user?.uid}/${appt.id}`} style={{ width: '100%', textDecoration: 'none' }}>
                            <div style={{ display: 'flex', flexDirection: 'column', borderLeft: '8px solid #6C4AB6', paddingLeft: '16px', marginBottom: '18px', background: 'none' }}>
                              <div style={{ fontWeight: 700, color: '#1A1A1A', fontSize: '1.15rem', marginBottom: '2px', fontFamily: 'Source Serif Pro, serif' }}>{appt.provider || appt.title || 'Appointment'}</div>
                              <div style={{ color: '#3D246C', fontSize: '1rem', marginBottom: '2px', fontFamily: 'Source Serif Pro, serif' }}>{dateStr} • {timeStr}{appt.location ? ` (${appt.location})` : ''}</div>
                              {subStr && <div style={{ color: '#6C4AB6', fontSize: '1rem', fontWeight: 500, marginBottom: '2px', fontFamily: 'Source Serif Pro, serif' }}>{subStr}</div>}
                              {typeStr && !subStr && <div style={{ color: '#6C4AB6', fontSize: '1rem', fontWeight: 500, marginBottom: '2px', fontFamily: 'Source Serif Pro, serif' }}>{typeStr}</div>}
                            </div>
                          </IonRouterLink>
                        );
                      })
                    )}
                  </div>
                </div>
              </div>
              {/* Calendar - middle slot */}
              <div style={{ flex: '0 0 420px', maxWidth: '420px', minWidth: '320px', width: '100%' }}>
                <CalendarView appointments={soonAppointments} />
              </div>
              {/* Fetal Development Image and Credit - third slot */}
              <div style={{ flex: '0 0 420px', maxWidth: '420px', minWidth: '320px', width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: '24px' }}>
                <img
                  src={'/fetal_development.jpg'}
                  alt="Fetal Development"
                  style={{ maxWidth: '100%', borderRadius: '24px', boxShadow: '0 2px 8px rgba(108,74,182,0.10)', marginBottom: '8px' }}
                />
                <div style={{ fontSize: '0.95rem', color: '#6C4AB6', textAlign: 'center' }}>
                  Image credit: <a href="https://www.omumsie.com/cdn/shop/articles/321724216128_520x500_667689fa-025d-47c6-96bf-c648f6c59565_1080x.jpg?v=1740480111" target="_blank" rel="noopener noreferrer" style={{ color: '#6C4AB6', textDecoration: 'underline' }}>Omumsie</a>
                </div>
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
