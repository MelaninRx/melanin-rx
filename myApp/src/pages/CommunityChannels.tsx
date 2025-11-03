import React, { useEffect, useState } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonTitle,
  IonContent,
  IonList,
  IonItem,
  IonLabel,
  IonButton,
  IonButtons,
} from '@ionic/react';
import './CommunityChannels.css';
import { useCurrentUser } from '../hooks/useCurrentUser';
import { db } from '../firebaseConfig';
import { doc, getDoc, collection, getDocs, onSnapshot } from 'firebase/firestore';

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
      <IonHeader>
        <IonToolbar>
          <IonTitle>Community Channels</IonTitle>
          <IonButtons slot="end">
            <IonButton routerLink="/home" routerDirection="root" color="medium">Home</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen className="community-content">
        <section className="community-hero">
          <h2 className="community-welcome">
            {user?.email ? `Welcome, ${user.email}` : 'Welcome to MelaninRX Community'}
          </h2>
          <p className="community-sub">
            Join conversations, ask questions, and share resources with others who understand your journey.
          </p>
        </section>

        <main>
          <IonList>
            {availableChannels.map((c) => (
              <IonItem key={c.id} className="channel-item">
                <IonLabel>
                  <h3>{c.name}</h3>
                  <p className="channel-desc">{c.description || 'Open discussion and peer support'}</p>
                </IonLabel>
                <IonButton routerLink={`/community/${c.id}`} size="small" fill="outline">
                  View
                </IonButton>
              </IonItem>
            ))}
          </IonList>

          <div className="community-footer">
            <p>
              Can’t find a channel you need? Use the chatbot or resources page to get one-on-one guidance.
            </p>
            <IonButton routerLink="/chatbot" className="btn-outline">Ask the Chatbot</IonButton>
          </div>
        </main>
      </IonContent>
    </IonPage>
  );
};

export default CommunityChannels;
