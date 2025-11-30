import {
  IonContent,
  IonHeader,
  IonPage,
  IonTitle,
  IonToolbar,
  IonButton,
  IonButtons,
  IonImg,
  IonIcon,
  IonRouterLink,
} from '@ionic/react';
import './Home.css';
//import SidePanel from '../components/SidePanel';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { logoutUser } from '../services/authService';
import MelaninRxIcon from '../icons/MelaninRX.svg';
import ChatIcon from "../icons/Frame 110.svg";
import PeopleIcon from "../icons/Frame 111.svg";
import AppointmentIcon from "../icons/Frame 112.svg";
import DocIcon from "../icons/Frame 113.svg";
import JumpIcon from "../icons/Frame 120.svg";
import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';
import TimelineRail from '../components/TimelineRail';
import FetalDevelopment from '../components/FetalDevelopment';
import QuestionsCard from '../components/QuestionsCard';
import { getTrimesters, Trimester } from '../services/timelineService';
import SidebarNav from '../components/SidebarNav';
import MobileMenuButton from '../components/MobileMenuButton';

// Calculate current week from due date
const calculateCurrentWeek = (dueDateString: string | Date | undefined): number | null => {
  if (!dueDateString) return null;
  
  try {
    const dueDate = typeof dueDateString === 'string' ? new Date(dueDateString) : dueDateString;
    if (isNaN(dueDate.getTime())) return null;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return Math.max(0, Math.min(40, 40 - Math.floor(daysUntilDue / 7)));
  } catch (e) {
    console.error('Error calculating current week:', e);
    return null;
  }
};

const Home: React.FC = () => {
  const [soonAppointments, setSoonAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [rawAppointments, setRawAppointments] = useState<any[]>([]);
  const [trimesters, setTrimesters] = useState<Trimester[]>([]);
  const [currentTrimester, setCurrentTrimester] = useState<Trimester | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const handleLoadConversation = (conv: any) => {
    setCurrentConversationId(conv.id || null);
  };
  const user = useCurrentUser();

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      
      // Fetch trimesters
      const trimesterData = await getTrimesters();
      setTrimesters(trimesterData);
      
      // Calculate current week and trimester
      if (user.dueDate) {
        const week = calculateCurrentWeek(user.dueDate);
        if (week !== null) {
          setCurrentWeek(week);
          
          let trimesterNum: number;
          if (week < 14) {
            trimesterNum = 1;
          } else if (week < 28) {
            trimesterNum = 2;
          } else {
            trimesterNum = 3;
          }
          
          const current = trimesterData.find(t => t.index === trimesterNum);
          setCurrentTrimester(current || null);
        }
      }
      
      // Fetch appointments
      const db = getFirestore();
      const allSnapshot = await getDocs(collection(db, 'users', user.uid, 'appointments'));
      const rawAppts = allSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setRawAppointments(rawAppts);
      
      const now = new Date();
      const allAppts = allSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setAllAppointments(allAppts);
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
        .slice(0, 3);
      setSoonAppointments(appts);
    }
    fetchData();
  }, [user]);

  return (
    <IonPage className="home-page">
      <IonContent fullscreen className="home-content" style={{ paddingLeft: '80px' }}>
        <MobileMenuButton />
        {/* side panel */}
        <SidebarNav />

          <section className="hero">
            {/* hero */}
            <div className="hero-text transparent">
              <h1 className="hero-title">
                {user?.name
                  ? `Good afternoon, ${user.name.split(' ')[0]}.`
                  : user?.email
                    ? `Good afternoon, ${user.email.split('@')[0]}.`
                    : 'Personalized tools to navigate each trimester with confidence.'}
              </h1>
              <p className='hero-subtitle'>
                This week, you make expect more energy and a growing bump. Continue staying hydrated and nourishing your body, each small step supports both you and your baby’s health.
              </p>
            </div>
          </section>

          {/* Timeline Rail */}
          {trimesters.length > 0 && user?.dueDate && (
            <section style={{ 
              paddingLeft: `calc(var(--side-panel-width) + 24px)`, 
              paddingRight: '24px',
              paddingTop: '24px',
              paddingBottom: '16px'
            }}>
              <TimelineRail
                appendBaby
                progress={currentWeek > 0 ? Math.min(1, Math.max(0, currentWeek / 40)) : 0}
                nodes={trimesters.map(t => ({
                  key: t.id,
                  label: `Trimester ${t.index}`,
                  onClick: () => window.location.href = '/timeline',
                  isCurrent: currentTrimester?.id === t.id
                }))}
              />
            </section>
          )}

          <section className="panels">
            <IonRouterLink routerLink="/timeline" className="panel-card-link">
              <article className="panel-card">
                <div className="panel-icon-bar">
                  <img src={AppointmentIcon} className="panel-icon" />
                  <img src={JumpIcon} className="panel-icon right" />
                </div>

                <div className="panel-content">
                  <h3 className="panel-title">Timeline</h3>
                  <p className="panel-body">Know where you are and what to expect.</p>
                </div>
              </article>
            </IonRouterLink>

            <IonRouterLink routerLink="/resources" className="panel-card-link">
              <article className="panel-card">
                <div className="panel-icon-bar">
                  <img src={DocIcon} className="panel-icon" />
                  <img src={JumpIcon} className="panel-icon right" />
                </div>
                
                <div className="panel-content">
                  <h3 className="panel-title">Health Resources</h3>
                  <p className="panel-body">
                    Access health resources to prepare for pregnancy.
                  </p>
                </div>
              </article>
            </IonRouterLink>

            <IonRouterLink routerLink="/chatbot" className="panel-card-link">
              <article className="panel-card">
                <div className="panel-icon-bar">
                  <img src={ChatIcon} className="panel-icon" />
                  <img src={JumpIcon} className="panel-icon right" />
                </div>

                <div className="panel-content">
                  <h3 className="panel-title">Chatbot</h3>
                  <p className="panel-body">
                    Get personalized health insight and prepare for doctor visits.
                  </p>
                </div>
              </article>
            </IonRouterLink>

            <IonRouterLink routerLink="/community" className="panel-card-link">
              <article className="panel-card">
                <div className="panel-icon-bar">
                  <img src={PeopleIcon} className="panel-icon" />
                  <img src={JumpIcon} className="panel-icon right" />
                </div>

                <div className="panel-content">
                  <h3 className="panel-title">Communities</h3>
                  <p className="panel-body">
                    Connect with other expectant mothers in your area.
                  </p>
                </div>
              </article>
            </IonRouterLink>

            <IonRouterLink routerLink="/appointments" className="panel-card-link">
              <article className="panel-card">
                <div className="panel-icon-bar">
                  <img src={AppointmentIcon} className="panel-icon" />
                  <img src={JumpIcon} className="panel-icon right" />
                </div>
                <div className="panel-content">
                  <h3 className="panel-title">Appointments</h3>
                  <p className="panel-body">Track upcoming appointments and add notes/questions.</p>
                </div>
              </article>
            </IonRouterLink>
          </section>

          {/* Info Cards Section */}
          <section style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '24px',
            paddingLeft: `calc(var(--side-panel-width) + 24px)`,
            paddingRight: '24px',
            paddingTop: '32px',
            paddingBottom: '32px',
            maxWidth: '1400px'
          }}>
            {/* Fetal Development */}
            {currentWeek > 0 && (
              <FetalDevelopment currentWeek={currentWeek} />
            )}

            {/* Upcoming Appointments */}
            <div style={{
              border: '1px solid var(--color-mid)',
              background: 'var(--gradient-panel)',
              borderRadius: '20px',
              padding: '24px'
            }}>
              <div style={{ fontSize: '18px', fontWeight: 800, color: 'var(--text-primary)', margin: '0 0 16px 0' }}>
                Upcoming Appointments
              </div>
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
                      </div>
                    </IonRouterLink>
                  ))}
                </div>
              )}
            </div>

            {/* Questions to Ask Your Doctor */}
            {currentTrimester && currentTrimester.doctorTips && currentTrimester.doctorTips.length > 0 && (
              <QuestionsCard 
                items={currentTrimester.doctorTips.slice(0, 5)} 
                onQuestionClick={(question) => {
                  window.location.href = `/chatbot?question=${encodeURIComponent(question)}`;
                }}
              />
            )}
          </section>
      </IonContent>
    </IonPage>
  );
};

export default Home;
