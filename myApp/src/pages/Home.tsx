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
import { useCurrentUser } from '../hooks/useCurrentUser';
import { logoutUser } from '../services/authService';
import MelaninRxIcon from '../icons/MelaninRX.svg';
import ChatIcon from "../icons/Frame 110.svg";
import PeopleIcon from "../icons/Frame 111.svg";
import AppointmentIcon from "../icons/Frame 112.svg";
import DocIcon from "../icons/Frame 113.svg";
import JumpIcon from "../icons/Frame 120.svg";
import homeIcon from '../icons/house.svg';
import addIcon from '../icons/Vector.svg';
import menuIcon from '../icons/menu.svg';
import chatbotIcon from '../icons/message-square.svg';
import communityIcon from '../icons/users.svg';
import timelineIcon from '../icons/calendar-days.svg';
import LogoutIcon from "../icons/log-out.svg"
import aboutIcon from '../icons/book-text.svg';
import settingsIcon from '../icons/settings.svg';
import profileIcon from '../icons/circle-user-round.svg';
import { useEffect, useState } from 'react';
import { getFirestore, collection, query, where, getDocs, Timestamp } from 'firebase/firestore';

const Home: React.FC = () => {
  const [soonAppointments, setSoonAppointments] = useState<any[]>([]);
  const [allAppointments, setAllAppointments] = useState<any[]>([]);
  const [rawAppointments, setRawAppointments] = useState<any[]>([]);
  const user = useCurrentUser();

  useEffect(() => {
    async function fetchSoonAppointments() {
      if (!user?.uid) return;
      const db = getFirestore();
      // Fetch all appointments from subcollection under user
      const allSnapshot = await getDocs(collection(db, 'users', user.uid, 'appointments'));
      const rawAppts = allSnapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
      setRawAppointments(rawAppts);
      // Use same for filtered query
      const snapshot = allSnapshot;
      const now = new Date();
      const allAppts = snapshot.docs.map(doc => ({ id: doc.id, ...(doc.data() as any) }));
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
    fetchSoonAppointments();
  }, [user]);

  return (
    <IonPage className="home-page">
      <IonContent fullscreen className="home-content" style={{ paddingLeft: '80px' }}>
        {/* side panel */}
        <aside className="side-panel">
          <div className="nav-top">
            <IonButton fill="clear" routerLink="/menu">
              <IonIcon icon={menuIcon} />
              <span className = "menu-text">Menu</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/home">
              <IonIcon icon={homeIcon} />
              <span className = "menu-text">Home</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/add">
              <IonIcon icon={addIcon} />
              <span className = "menu-text">New Chat</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/chatbot">
              <IonIcon icon={chatbotIcon} />
              <span className = "menu-text">Chats</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/community">
              <IonIcon icon={communityIcon} />
              <span className = "menu-text">Communities</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/timeline">
              <IonIcon icon={timelineIcon} />
              <span className = "menu-text">Timeline</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/appointments">
              <IonIcon icon={AppointmentIcon} />
              <span className="menu-text">Appointments</span>
            </IonButton>
          </div>

          <div className="nav-bottom">
            <IonButton fill='clear' onClick={logoutUser}>
              <IonIcon icon={LogoutIcon} />
              <span className = "menu-text">Log out</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/settings">
              <IonIcon icon={settingsIcon} />
              <span className = "menu-text">Setting</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/profile">
              <IonIcon icon={profileIcon} />
              <span className = "menu-text">Profile</span>
            </IonButton>
          </div>
        </aside>

          <section className="hero">
            {/* hero */}
            <div className="hero-text transparent">
              <h1 className="hero-title">
                {user?.email
                  ? `Good afternoon, ${user.email}.`
                  : 'Personalized tools to navigate each trimester with confidence.'}
              </h1>
              <p className='hero-subtitle'>
                This week, you make expect more energy and a growing bump. Continue staying hydrated and nourishing your body, each small step supports both you and your baby’s health.
              </p>
            </div>
          </section>

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
      </IonContent>
    </IonPage>
  );
};

export default Home;
