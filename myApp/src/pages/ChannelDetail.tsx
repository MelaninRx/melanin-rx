import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
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
  IonIcon,
} from '@ionic/react';
import { db } from '../firebaseConfig';
import { useCurrentUser } from '../hooks/useCurrentUser';
import {
  addDoc,
  collection,
  doc,
  getDoc,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  limit,
} from 'firebase/firestore';
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

type ChannelDoc = {
  name?: string;
  description?: string;
};

const ChannelDetail: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const user = useCurrentUser();
  const [channel, setChannel] = useState<ChannelDoc | null>(null);
  const [loadingChannel, setLoadingChannel] = useState(true);
  const [messages, setMessages] = useState<Array<{ id: string; uid: string; text: string; createdAt?: any; email?: string }>>([]);
  const [input, setInput] = useState('');
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    async function loadChannel() {
      try {
        const snap = await getDoc(doc(db, 'community_channels', id));
        if (snap.exists()) {
          setChannel(snap.data() as ChannelDoc);
        } else {
          setChannel({ name: 'Channel', description: 'No description available.' });
        }
      } finally {
        setLoadingChannel(false);
      }
    }
    loadChannel();
  }, [id]);

  useEffect(() => {
    const q = query(
      collection(db, 'community_channels', id, 'messages'),
      orderBy('createdAt', 'asc'),
      limit(200)
    );
    const unsub = onSnapshot(q, (snap) => {
      const list = snap.docs.map((d) => ({ id: d.id, ...(d.data() as any) }));
      setMessages(list);
      // scroll to end on new messages
      setTimeout(() => listEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 0);
    });
    return () => unsub();
  }, [id]);

  const canSend = useMemo(() => !!user && input.trim().length > 0, [user, input]);

  const handleSend = async () => {
    if (!canSend) return;
    const payload = {
      uid: user.uid,
      email: user.email || 'anon',
      text: input.trim(),
      createdAt: serverTimestamp(),
    };
    await addDoc(collection(db, 'community_channels', id, 'messages'), payload);
    setInput('');
  };

  return (
    <IonPage className="channel-detail-page">
      <IonHeader>
        <IonToolbar>
          <IonTitle>{channel?.name || 'Channel'}</IonTitle>
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
        <section style={{ padding: 20 }}>
          <h2>{channel?.name || 'Channel'}</h2>
          <p>{channel?.description || 'No description available.'}</p>

          <IonList>
            {messages.map((m) => (
              <IonItem key={m.id} lines="none">
                <IonLabel>
                  <div style={{ fontSize: 12, color: '#666' }}>{m.email || m.uid}</div>
                  <div>{m.text}</div>
                </IonLabel>
              </IonItem>
            ))}
          </IonList>
          <div ref={listEndRef} />

          <div style={{ display: 'flex', marginTop: 12 }}>
            <input
              style={{ flex: 1, padding: 8, borderRadius: 4, border: '1px solid #ccc' }}
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={user ? 'Type a message' : 'Sign in to chat'}
              disabled={!user}
            />
            <IonButton size="small" onClick={handleSend} style={{ marginLeft: 8 }} disabled={!canSend}>
              Send
            </IonButton>
          </div>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default ChannelDetail;
