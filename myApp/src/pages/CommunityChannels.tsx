import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonButton,
  IonButtons,
  IonIcon,
  IonRouterLink,
} from '@ionic/react';
import './CommunityChannels.css';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';
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

type UserProfile = {
  name?: string;
  email?: string;
  location?: string;
  trimester?: string; // '1' | '2' | '3'
};

function useUserProfile(user: any) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // While auth is initializing, keep loading true
    if (user === undefined) {
      setLoading(true);
      return;
    }
    // Explicitly signed out (let App routes handle redirect). Keep loading so we don't flash prompts.
    if (user === null) {
      setLoading(true);
      return;
    }
    setLoading(true);
    const ref = doc(db, 'users', user.uid);
    const unsub = onSnapshot(ref, (snap) => {
      if (snap.exists()) {
        setProfile(snap.data() as UserProfile);
      } else {
        setProfile(null);
      }
      setLoading(false);
    }, (e) => {
      console.error('Failed to subscribe to user profile:', e);
      setProfile(null);
      setLoading(false);
    });
    return () => unsub();
  }, [user]);

  return { profile, loading };
}

type Channel = {
  id: string;
  name: string;
  description?: string;
  category?: string;
  location?: string;
  trimester?: string; // '1' | '2' | '3' | undefined => all
  tags?: string[];
};

function getTrimesterLabelFromProfile(p: UserProfile): 'first' | 'second' | 'third' | null {
  if (!p?.trimester) return null;
  if (p.trimester === '1') return 'first';
  if (p.trimester === '2') return 'second';
  if (p.trimester === '3') return 'third';
  return null;
}

function useCommunityChannels() {
  const [channels, setChannels] = useState<Channel[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchChannels() {
      setLoading(true);
      try {
        const snapshot = await getDocs(collection(db, 'community_channels'));
        const list: Channel[] = snapshot.docs.map((d) => {
          const data = d.data() as any;
          return {
            id: d.id,
            name: data.name ?? 'Untitled',
            description: data.description,
            category: data.category,
            location: data.location,
            trimester: data.trimester, // expected to be '1' | '2' | '3' or undefined
            tags: Array.isArray(data.tags) ? data.tags : undefined,
          };
        });
        setChannels(list);
      } finally {
        setLoading(false);
      }
    }
    fetchChannels();
  }, []);

  return { channels, loading };
}

const CommunityChannels: React.FC = () => {
  const user = useCurrentUser();
  const { profile, loading } = useUserProfile(user);
  const { channels, loading: loadingChannels } = useCommunityChannels();

  if (loading || loadingChannels) {
    return (
      <IonPage className="community-page">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Community Channels</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>Loading your channels...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!profile) {
    return (
      <IonPage className="community-page">
        <IonHeader>
          <IonToolbar>
            <IonTitle>Community Channels</IonTitle>
          </IonToolbar>
        </IonHeader>
        <IonContent className="ion-padding">
          <p>We couldn't find your onboarding information. Please complete onboarding.</p>
          <IonButton routerLink="/onboarding">Go to Onboarding</IonButton>
        </IonContent>
      </IonPage>
    );
  }

  const availableChannels = channels.filter((c) => {
    // If a channel document has no trimester field, show it to everyone
    if (!c.trimester) return true;
    return c.trimester === profile.trimester;
  });

  return (
    <IonPage className="community-page">

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

        <section className="community-hero">
          <h2 className="community-welcome">
            {user?.name 
              ? `Welcome, ${user.name.split(' ')[0]}` 
              : user?.email
                ? `Welcome, ${user.email.split('@')[0]}`
                : 'Welcome to MelaninRX Community'}
          </h2>
          <p className="community-sub">
            Join conversations, ask questions, and share resources with others who understand your journey.
          </p>
        </section>

        <main style={{ 
          padding: '24px',
          paddingLeft: `calc(var(--side-panel-width) + 24px)`,
          paddingRight: '24px',
          maxWidth: '1400px'
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
            gap: '20px',
            marginBottom: '32px'
          }}>
            {availableChannels.map((c) => (
              <IonRouterLink 
                key={c.id} 
                routerLink={`/community/${c.id}`}
                style={{ textDecoration: 'none', color: 'inherit' }}
              >
                <div className="channel-card">
                  <h3 className="channel-card-title">{c.name}</h3>
                  <p className="channel-card-desc">
                    {c.description || 'Open discussion and peer support'}
                  </p>
                  <div className="channel-card-footer">
                    <span className="channel-card-link">View Channel →</span>
                  </div>
                </div>
              </IonRouterLink>
            ))}
          </div>

          <div className="community-footer" style={{ 
            paddingLeft: `calc(var(--side-panel-width) + 24px)`,
            paddingRight: '24px'
          }}>
            <p>
              Can't find a channel you need? Use the chatbot or resources page to get one-on-one guidance.
            </p>
            <IonButton routerLink="/chatbot" className="btn-outline">Ask the Chatbot</IonButton>
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default CommunityChannels;
