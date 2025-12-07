import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonContent,
} from '@ionic/react';
import './CommunityChannels.css';
import SidebarNav from "../components/SidebarNav";
import { useCurrentUser } from '../hooks/useCurrentUser';
import { db } from '../firebaseConfig';
import { collection, getDocs, onSnapshot, doc } from 'firebase/firestore';
import MobileMenuButton from '../components/MobileMenuButton';
import { useHistory } from 'react-router-dom';

type UserProfile = {
  name?: string;
  email?: string;
  location?: string;
  trimester?: string;
};

function useUserProfile(user: any) {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user === undefined) {
      setLoading(true);
      return;
    }
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
  trimester?: string;
  tags?: string[];
};

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
            trimester: data.trimester,
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
  const history = useHistory();
  const { profile, loading } = useUserProfile(user);
  const { channels, loading: loadingChannels } = useCommunityChannels();
  const [sidebarExpanded, setSidebarExpanded] = useState(false);

  const handleChannelClick = (channelId: string) => {
    history.push(`/community/${channelId}`);
  };

  if (loading || loadingChannels) {
    return (
      <IonPage className="community-page">
        <IonContent className="communities-content">
          <p className="loading-text">Loading your channels...</p>
        </IonContent>
      </IonPage>
    );
  }

  if (!profile) {
    return (
      <IonPage className="community-page">
        <IonContent className="communities-content">
          <div className="error-container">
            <p>We couldn't find your onboarding information. Please complete onboarding.</p>
            <button className="onboarding-button" onClick={() => history.push('/onboarding')}>
              Go to Onboarding
            </button>
          </div>
        </IonContent>
      </IonPage>
    );
  }

  const availableChannels = channels.filter((c) => {
    if (!c.trimester) return true;
    const userTrimester = profile.trimester;
    if (userTrimester === 'postpartum') {
      return c.trimester === '4';
    }
    return c.trimester === userTrimester;
  });

  return (
    <IonPage className="community-page">
      <IonContent fullscreen className="communities-content">
        <MobileMenuButton />
        <SidebarNav onToggle={setSidebarExpanded} />

        <div className={`communities-container${sidebarExpanded ? ' sidebar-expanded' : ''}`}>
          <header className="communities-header">
            <h1 className="communities-title">Communities</h1>
            <p className="communities-subtitle">
              Join conversations, ask questions, and share resources with others who understand your journey.
            </p>
          </header>

          <div className="channel-grid">
            {availableChannels.map((channel) => (
              <div 
                key={channel.id} 
                className="channel-card"
                onClick={() => handleChannelClick(channel.id)}
              >
                <h2 className="channel-title">{channel.name}</h2>
                <p className="channel-description">
                  {channel.description || 'Open discussion and peer support'}
                </p>
                <div className="channel-link-container">
                  <span className="channel-link-text">View Channel</span>
                  <svg className="channel-arrow" width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M5 12H19M19 12L12 5M19 12L12 19" stroke="#642D56" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
              </div>
            ))}
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default CommunityChannels;
