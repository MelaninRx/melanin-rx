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
import Sidebar from '../components/SidebarNav';
import './CommunityChannels.css';

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
      <IonContent fullscreen>
        <Sidebar />
        <section style={{ padding: 20, marginLeft: 80 }}>
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
