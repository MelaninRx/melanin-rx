import { IonContent, IonPage, IonRouterLink } from '@ionic/react';
import { useHistory } from 'react-router-dom';
import './Home.css';
import { useCurrentUser } from '../hooks/useCurrentUser';
import ChatIcon from "../icons/Frame 110.svg";
import PeopleIcon from "../icons/Frame 111.svg";
import AppointmentIcon from "../icons/Frame 112.svg";
import DocIcon from "../icons/Frame 113.svg";
import JumpIcon from "../icons/Frame 120.svg";
import { useEffect, useState } from 'react';
import { getFirestore, collection, getDocs, Timestamp } from 'firebase/firestore';
import TimelineRail from '../components/TimelineRail';
import FetalDevelopment from '../components/FetalDevelopment';
import SelfCareFocus from '../components/SelfCareFocus';
import QuestionsCard from '../components/QuestionsCard';
import ChecklistCard from '../components/ChecklistCard';
import { getTrimesters, Trimester } from '../services/timelineService';
import SidebarNav from '../components/SidebarNav';
import MobileMenuButton from '../components/MobileMenuButton';

// Calculate current week from due date
// Calculate current week and detect postpartum (matching TimelinePage logic)
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

const calculateDaysInWeek = (dueDateString: string | Date | undefined, currentWeek: number): number => {
  if (!dueDateString || currentWeek === null) return 0;
  
  try {
    const dueDate = typeof dueDateString === 'string' ? new Date(dueDateString) : dueDateString;
    if (isNaN(dueDate.getTime())) return 0;
    
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    
    const daysUntilDue = Math.floor((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    const totalDaysPregnant = 280 - daysUntilDue;
    const daysInCurrentWeek = totalDaysPregnant % 7;
    
    return daysInCurrentWeek;
  } catch (e) {
    console.error('Error calculating days in week:', e);
    return 0;
  }
};

const formatDueDate = (dueDateString: string | Date | undefined): string => {
  if (!dueDateString) return '';
  
  try {
    const dueDate = typeof dueDateString === 'string' ? new Date(dueDateString) : dueDateString;
    if (isNaN(dueDate.getTime())) return '';
    
    const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
    return dueDate.toLocaleDateString('en-US', options);
  } catch (e) {
    console.error('Error formatting due date:', e);
    return '';
  }
};

const Home: React.FC = () => {
  const history = useHistory();
  const [soonAppointments, setSoonAppointments] = useState<any[]>([]);
  const [trimesters, setTrimesters] = useState<Trimester[]>([]);
  const [currentTrimester, setCurrentTrimester] = useState<Trimester | null>(null);
  const [currentWeek, setCurrentWeek] = useState<number>(0);
  const [isPostpartum, setIsPostpartum] = useState<boolean>(false);
  const [daysInWeek, setDaysInWeek] = useState<number>(0);
  const [sidebarExpanded, setSidebarExpanded] = useState(false);
  const [checklistTrimester, setChecklistTrimester] = useState<Trimester | null>(null);
  const user = useCurrentUser();

  useEffect(() => {
    async function fetchData() {
      if (!user?.uid) return;
      
      // Fetch trimesters
      const trimesterData = await getTrimesters();
      setTrimesters(trimesterData);
      
      // Calculate current week and trimester
      if (user.dueDate) {
        const { week, isPostpartum: postpartum } = calculateCurrentWeek(user.dueDate);
        if (week !== null) {
          setCurrentWeek(week);
          setIsPostpartum(postpartum);
          setDaysInWeek(calculateDaysInWeek(user.dueDate, week));
          
          if (postpartum) {
            setCurrentTrimester(null); // No trimester for postpartum
            // For testing: show trimester 3 checklist for postpartum users
            const trimester3 = trimesterData.find(t => t.index === 3);
            setChecklistTrimester(trimester3 || null);
          } else {
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
            setChecklistTrimester(current || null);
          }
        }
      }
      
      // Fetch appointments
      const db = getFirestore();
      const allSnapshot = await getDocs(collection(db, 'users', user.uid, 'appointments'));
      const now = new Date();
      const allAppts = allSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      
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
    }
    fetchData();
  }, [user]);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  const getUserName = () => {
    if (user?.name) {
      return user.name.split(' ')[0];
    }
    if (user?.email) {
      return user.email.split('@')[0];
    }
    return 'there';
  };

  const getSubtitle = () => {
    // Postpartum message
    if (isPostpartum) {
      return "Congratulations on your beautiful baby! Take care of yourself during this special time. Remember, self-care is essential for both you and your little one.";
    }
    
    // Week-by-week dynamic messages (prioritized)
    if (currentWeek === 0) {
      return "Welcome to your pregnancy journey! We're here to support you every step of the way.";
    }
    
    // First trimester (weeks 1-13)
    if (currentWeek >= 1 && currentWeek < 5) {
      return "Your baby is just beginning to develop! Focus on taking your prenatal vitamins and getting plenty of rest during these early weeks.";
    }
    if (currentWeek >= 5 && currentWeek < 9) {
      return "Baby's major organs are forming. Stay hydrated, eat small frequent meals to manage nausea, and prioritize your first prenatal appointment.";
    }
    if (currentWeek >= 9 && currentWeek < 14) {
      return "You're nearing the end of your first trimester! The placenta is taking over, and morning sickness may start to ease. Take care of yourself.";
    }
    
    // Second trimester (weeks 14-27)
    if (currentWeek >= 14 && currentWeek < 18) {
      return "Welcome to your second trimester! This is often when energy returns. You might start to feel those first gentle movements soon.";
    }
    if (currentWeek >= 18 && currentWeek < 22) {
      return "You're in the 'honeymoon period' of pregnancy! You may start feeling your baby move. This is a great time to schedule your anatomy scan.";
    }
    if (currentWeek >= 22 && currentWeek < 28) {
      return "Your baby is growing quickly! Movements are becoming more noticeable. Consider starting pelvic floor exercises and exploring childbirth education.";
    }
    
    // Third trimester (weeks 28-40)
    if (currentWeek >= 28 && currentWeek < 32) {
      return "You're in the final stretch! Baby is gaining weight rapidly. Start thinking about your birth plan and preparing for your baby's arrival.";
    }
    if (currentWeek >= 32 && currentWeek < 36) {
      return "Almost there! You'll have more frequent checkups now. Focus on rest, hydration, and watching for any warning signs. Your body is doing amazing work.";
    }
    if (currentWeek >= 36 && currentWeek < 40) {
      return "You're in the home stretch! Your baby could arrive any time. Make sure your hospital bag is packed and your support team is ready.";
    }
    if (currentWeek >= 40) {
      return "You've reached your due date! Your baby will arrive when they're ready. Continue to monitor movements and stay in touch with your healthcare provider.";
    }
    
    // Fallback to trimester summary if week-based messages don't cover it
    if (currentTrimester?.summary) {
      return currentTrimester.summary;
    }
    
    // Final default fallback
    return "Continue staying hydrated and nourishing your body. Each small step supports both you and your baby's health.";
  };

  return (
    <IonPage className="home-dashboard-page">
      <IonContent fullscreen className="home-dashboard-content">
        <MobileMenuButton />
        <SidebarNav onToggle={setSidebarExpanded} />

        <div className={`dashboard-container ${sidebarExpanded ? 'sidebar-expanded' : ''}`}>
          <section className="dashboard-hero">
            <h1 className="dashboard-greeting">
              {getGreeting()} {getUserName()}!
              </h1>
            <p className="dashboard-subtitle">
              {getSubtitle()}
            </p>
          </section>

          {/* Timeline Progress */}
          {trimesters.length > 0 && user?.dueDate && (
            <section className="dashboard-timeline">
              <div className="timeline-rail-container">
                <div className="timeline-track"></div>
                <div 
                  className="timeline-progress" 
                  style={{ width: `${isPostpartum ? 100 : Math.min(100, (currentWeek / 40) * 100)}%` }}
                ></div>
                
                <div 
                  className={`timeline-node ${currentWeek >= 1 && currentWeek < 14 ? 'active' : ''} ${currentWeek >= 14 ? 'completed' : ''}`}
                  style={{ left: '0%' }}
                  onClick={() => window.location.href = '/timeline'}
                >
                  <span className="node-label">T 1</span>
                </div>

                <div 
                  className={`timeline-node ${currentWeek >= 14 && currentWeek < 28 ? 'active' : ''} ${currentWeek >= 28 ? 'completed' : ''}`}
                  style={{ left: '33.33%' }}
                  onClick={() => window.location.href = '/timeline'}
                >
                  <span className="node-label">T 2</span>
                </div>
                
                <div 
                  className={`timeline-node ${currentWeek >= 28 ? 'active' : ''}`}
                  style={{ left: '66.66%' }}
                  onClick={() => window.location.href = '/timeline'}
                >
                  <span className="node-label">T 3</span>
                </div>
                
                <div 
                  className={`timeline-node baby-node ${isPostpartum ? 'active' : ''}`}
                  style={{ left: '100%', cursor: 'pointer' }}
                  onClick={() => window.location.href = '/timeline?postpartum=true'}
                >
                  <svg width="81" height="81" viewBox="0 0 81 81" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <g filter="url(#filter0_d_3368_894)">
                      <rect x="8" y="4" width="65" height="65" rx="32.5" fill="white" shapeRendering="crispEdges"/>
                      <rect x="8.5" y="4.5" width="64" height="64" rx="32" stroke="#ADADAD" shapeRendering="crispEdges"/>
                      <path d="M41.5641 55.0456L41.5426 55.0491L41.4154 55.1118L41.3795 55.119L41.3544 55.1118L41.2272 55.0473C41.2081 55.0426 41.1938 55.0462 41.1842 55.0581L41.1771 55.076L41.1466 55.8428L41.1556 55.8787L41.1735 55.902L41.3598 56.0346L41.3867 56.0417L41.4082 56.0346L41.5945 55.902L41.616 55.8733L41.6232 55.8428L41.5927 55.0778C41.588 55.0587 41.5784 55.0479 41.5641 55.0456ZM42.0371 54.8431L42.012 54.8467L41.6823 55.0133L41.6644 55.0312L41.659 55.0509L41.6913 55.8213L41.7002 55.8428L41.7146 55.8572L42.0747 56.022C42.0974 56.028 42.1147 56.0232 42.1267 56.0077L42.1338 55.9826L42.0729 54.8825C42.0669 54.8598 42.055 54.8467 42.0371 54.8431ZM40.756 54.8467C40.7481 54.8419 40.7387 54.8403 40.7297 54.8423C40.7207 54.8443 40.7128 54.8498 40.7077 54.8574L40.6969 54.8825L40.636 55.9826C40.6372 56.0041 40.6473 56.0184 40.6664 56.0256L40.6933 56.022L41.0534 55.8554L41.0714 55.8411L41.0767 55.8213L41.109 55.0509L41.1036 55.0294L41.0857 55.0115L40.756 54.8467Z" fill="#642D56"/>
                      <path d="M40.4999 16.9583C50.3953 16.9583 58.4166 24.9796 58.4166 34.875C58.4166 44.7704 50.3953 52.7916 40.4999 52.7916C30.6045 52.7916 22.5833 44.7704 22.5833 34.875C22.5833 24.9796 30.6045 16.9583 40.4999 16.9583ZM40.4999 20.5416C36.9341 20.5436 33.497 21.8746 30.8598 24.2748C28.2227 26.675 26.575 29.972 26.2384 33.522C25.9018 37.0719 26.9005 40.6199 29.0395 43.4729C31.1785 46.326 34.3042 48.2793 37.8062 48.9514C41.3081 49.6235 44.9348 48.9661 47.9781 47.1076C51.0214 45.2491 53.2626 42.323 54.2641 38.9007C55.2656 35.4783 54.9555 31.8056 53.3943 28.5996C51.8331 25.3937 49.133 22.8848 45.8212 21.5629C45.9792 22.652 45.799 23.7634 45.3051 24.7468C44.8112 25.7303 44.0273 26.5384 43.0593 27.0621C42.0914 27.5857 40.986 27.7996 39.8926 27.6749C38.7992 27.5501 37.7704 27.0928 36.9453 26.3646C36.6026 26.0633 36.3877 25.6427 36.3445 25.1885C36.3013 24.7343 36.433 24.2808 36.7128 23.9203C36.9925 23.5599 37.3992 23.3198 37.8499 23.2489C38.3007 23.1781 38.7614 23.2819 39.1383 23.5391L39.3156 23.6771C39.5331 23.8688 39.7938 24.005 40.0754 24.0738C40.3571 24.1426 40.6512 24.142 40.9326 24.0721C41.214 24.0023 41.4742 23.8651 41.6909 23.6725C41.9076 23.4799 42.0743 23.2376 42.1768 22.9664C42.2792 22.6952 42.3143 22.4031 42.2791 22.1154C42.2438 21.8276 42.1392 21.5527 41.9743 21.3142C41.8094 21.0758 41.5891 20.8809 41.3323 20.7463C41.0755 20.6118 40.7898 20.5415 40.4999 20.5416ZM45.2299 40.6656C45.5947 40.9698 45.8238 41.4065 45.8668 41.8795C45.9098 42.3526 45.7632 42.8233 45.4593 43.1883C44.2553 44.6342 42.5138 45.625 40.4999 45.625C38.4861 45.625 36.7446 44.6342 35.5406 43.1883C35.2499 42.8219 35.1139 42.3563 35.1619 41.8911C35.2098 41.4258 35.4378 40.9977 35.7971 40.6983C36.1564 40.3988 36.6186 40.2518 37.0849 40.2886C37.5512 40.3253 37.9846 40.5429 38.2926 40.895C38.9358 41.6654 39.7223 42.0416 40.4999 42.0416C41.2775 42.0416 42.064 41.6654 42.7073 40.895C43.0114 40.5302 43.4481 40.3011 43.9211 40.2581C44.3942 40.2151 44.8649 40.3617 45.2299 40.6656ZM34.2291 31.2916C34.9419 31.2916 35.6254 31.5748 36.1294 32.0788C36.6334 32.5828 36.9166 33.2664 36.9166 33.9791C36.9166 34.6919 36.6334 35.3755 36.1294 35.8795C35.6254 36.3835 34.9419 36.6666 34.2291 36.6666C33.5163 36.6666 32.8327 36.3835 32.3287 35.8795C31.8247 35.3755 31.5416 34.6919 31.5416 33.9791C31.5416 33.2664 31.8247 32.5828 32.3287 32.0788C32.8327 31.5748 33.5163 31.2916 34.2291 31.2916ZM46.7708 31.2916C47.4835 31.2916 48.1671 31.5748 48.6711 32.0788C49.1751 32.5828 49.4583 33.2664 49.4583 33.9791C49.4583 34.6919 49.1751 35.3755 48.6711 35.8795C48.1671 36.3835 47.4835 36.6666 46.7708 36.6666C46.058 36.6666 45.3744 36.3835 44.8704 35.8795C44.3664 35.3755 44.0833 34.6919 44.0833 33.9791C44.0833 33.2664 44.3664 32.5828 44.8704 32.0788C45.3744 31.5748 46.058 31.2916 46.7708 31.2916Z" fill="#642D56"/>
                    </g>
                    <defs>
                      <filter id="filter0_d_3368_894" x="0" y="0" width="81" height="81" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
                        <feFlood floodOpacity="0" result="BackgroundImageFix"/>
                        <feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha"/>
                        <feOffset dy="4"/>
                        <feGaussianBlur stdDeviation="4"/>
                        <feComposite in2="hardAlpha" operator="out"/>
                        <feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0"/>
                        <feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_3368_894"/>
                        <feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_3368_894" result="shape"/>
                      </filter>
                    </defs>
                  </svg>
                </div>
              </div>

              <div className="timeline-info">
                <div className="timeline-info-left">
                  {isPostpartum ? (
                    <>
                      <span className="trimester-label">Postpartum</span>
                      <span className="timeline-separator">: </span>
                      <span className="timeline-detail">{Math.floor((currentWeek - 40) / 7)} weeks postpartum</span>
                    </>
                  ) : (
                    <>
                      <span className="trimester-label">Trimester {currentTrimester?.index || 2}</span>
                      <span className="timeline-separator">: </span>
                      <span className="timeline-detail">{currentWeek} weeks{daysInWeek > 0 ? `, ${daysInWeek} days` : ''}</span>
                    </>
                  )}
                </div>
                <div className="timeline-info-right">
                  <span className="trimester-label">{isPostpartum ? 'Birth Date' : 'EDD'}</span>
                  <span className="timeline-separator">: </span>
                  <span className="timeline-detail">{formatDueDate(user?.dueDate)}</span>
                </div>
              </div>
            </section>
          )}

          {/* Visit Timeline Button */}
          <div className="visit-timeline-container">
            <IonRouterLink routerLink="/timeline" className="visit-timeline-button">
              Visit Your Timeline
            </IonRouterLink>
          </div>

          {/* Quick Actions */}
          <section className="quick-actions-section">
            <h2 className="section-title">Quick Actions</h2>
            <div className="quick-actions-grid">
              <IonRouterLink routerLink="/chatbot" className="action-card">
                <div className="action-card-header">
                  <img src={ChatIcon} className="action-icon" alt="Chat Bot" />
                  <img src={JumpIcon} className="action-icon-alt" alt="Go" />

                </div>
                <h3 className="action-title">Chat Bot</h3>
                <p className="action-description">Get personalized health insights and prepare for doctor visits</p>
              </IonRouterLink>

              <IonRouterLink routerLink="/community" className="action-card">
                <div className="action-card-header">
                  <img src={PeopleIcon} className="action-icon" alt="Communities" />
                  <img src={JumpIcon} className="action-icon-alt" alt="Go" />
                </div>
                <h3 className="action-title">Communities</h3>
                <p className="action-description">Connect with other expectant mothers in your area/ same trimester</p>
            </IonRouterLink>

              <IonRouterLink routerLink="/appointments" className="action-card">
                <div className="action-card-header">
                  <img src={AppointmentIcon} className="action-icon" alt="Appointment Planner" />
                  <img src={JumpIcon} className="action-icon-alt" alt="Go" />
                </div>
                <h3 className="action-title">Appointment Planner</h3>
                <p className="action-description">Be fully prepared to advocate for yourself in your next appointment</p>
              </IonRouterLink>

              <IonRouterLink routerLink="/resources" className="action-card">
                <div className="action-card-header">
                  <img src={DocIcon} className="action-icon" alt="Health Resources" />
                  <img src={JumpIcon} className="action-icon-alt" alt="Go" />
                </div>
                <h3 className="action-title">Health Resources</h3>
                <p className="action-description">Access health resources to prepare for pregnancy</p>
              </IonRouterLink>
            </div>
          </section>

          {/* Bottom Cards Section */}
          <section className="bottom-cards-section">
            {/* Baby/Fetal Development or Self-Care Focus */}
            {currentWeek > 0 && (
              <div className="bottom-card">
                {isPostpartum ? (
                  <SelfCareFocus weeksPostpartum={currentWeek - 40} compact={true} />
                ) : (
                  <FetalDevelopment currentWeek={currentWeek} isPostpartum={false} />
                )}
              </div>
            )}

            {/* Upcoming Appointments */}
            <div className="bottom-card">
              <div className="appointments-card">
                <h3 className="appointments-title">Upcoming Appointments</h3>
                
                <IonRouterLink routerLink="/appointments" className="add-appointment-btn">
                  Add Appointment
            </IonRouterLink>

                <div className="appointments-list">
                  {soonAppointments.length === 0 ? (
                    <div className="no-appointments">No upcoming appointments</div>
                  ) : (
                    soonAppointments.map((appt, index) => (
                      <div key={appt.id}>
                        <IonRouterLink routerLink={`/appointments/${user?.uid}/${appt.id}`} className="appointment-item">
                          <div className="appointment-accent"></div>
                          <div className="appointment-details">
                            <div className="appointment-title">{appt.provider}</div>
                            <div className="appointment-sub">
                              {appt.dateTime instanceof Timestamp
                                ? appt.dateTime.toDate().toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                                : typeof appt.dateTime === 'string'
                                  ? new Date(appt.dateTime).toLocaleString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' })
                                  : ''
                              } • {appt.location || '(in-clinic)'}
                            </div>
                            <div className="appointment-type">{appt.type || 'Prenatal Check-In — OB/GYN'}</div>
                          </div>
                        </IonRouterLink>
                        {index < soonAppointments.length - 1}
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>

            {/* Questions to Ask */}
            {currentTrimester && currentTrimester.doctorTips && currentTrimester.doctorTips.length > 0 && (
              <div className="bottom-card">
                <div className="questions-card">
                  <h3 className="questions-title">Questions To Ask</h3>
                  <p className="questions-subtitle">To help advocate for yourself during your visit.</p>
                  <div className="questions-list">
                    {currentTrimester.doctorTips.slice(0, 4).map((question, index) => (
                      <p
                        key={index}
                        className="question-item question-item-clickable"
                        onClick={() => window.location.href = `/chatbot?question=${encodeURIComponent(question)}`}
                      >
                        {question}
                      </p>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Checklist Card */}
            {checklistTrimester && checklistTrimester.checklist && checklistTrimester.checklist.length > 0 && (
              <div className="bottom-card">
                <ChecklistCard
                  items={checklistTrimester.checklist}
                  storageKey={`home-trimester-${checklistTrimester.id}-checklist`}
                  title={`Trimester ${checklistTrimester.index} Checklist`}
                  compact={true}
                />
              </div>
            )}
          </section>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Home;
