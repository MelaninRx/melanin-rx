import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import {
  IonPage,
  IonContent,
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
import './ChannelDetail.css';

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
  const [messages, setMessages] = useState<Array<{ id: string; uid: string; text: string; createdAt?: any; email?: string; username?: string; avatar?: string }>>([]);
  const [input, setInput] = useState('');
  const listEndRef = useRef<HTMLDivElement | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);

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

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    
    if (hours < 1) return 'Just now';
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    return `${days} day${days > 1 ? 's' : ''} ago`;
  };

  const getUserInitials = (email: string) => {
    if (!email) return '?';
    return email.charAt(0).toUpperCase();
  };

  return (
    <IonPage className="channel-detail-page">
      <IonContent fullscreen>
        <Sidebar onToggle={setSidebarExpanded} />
        <div className={`channel-detail-container${sidebarExpanded ? ' sidebar-expanded' : ''}`}>
          <button className="back-button" onClick={() => history.goBack()}>
            <svg width="46" height="41" viewBox="0 0 46 41" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M22.9997 32.4583L9.58301 20.5M9.58301 20.5L22.9997 8.54163M9.58301 20.5H36.4163" stroke="#222222" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </button>

          <div className="channel-header">
            <h1 className="channel-page-title">{channel?.name || 'Channel'}</h1>
            <p className="channel-page-subtitle">{channel?.description || 'No description available.'}</p>
          </div>

          <div className="post-creation-card">
            <div className="post-input-wrapper">
              <div className="user-avatar-placeholder">
                <svg width="42" height="44" viewBox="0 0 42 44" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="42" height="44" rx="21" fill="#642D56"/>
                  <path fillRule="evenodd" clipRule="evenodd" d="M27.2998 17.6C27.2998 21.2451 24.4792 24.2 20.9998 24.2C17.5204 24.2 14.6998 21.2451 14.6998 17.6C14.6998 13.9549 17.5204 11 20.9998 11C24.4792 11 27.2998 13.9549 27.2998 17.6ZM25.1998 17.6C25.1998 20.0301 23.3194 22 20.9998 22C18.6802 22 16.7998 20.0301 16.7998 17.6C16.7998 15.1699 18.6802 13.2 20.9998 13.2C23.3194 13.2 25.1998 15.1699 25.1998 17.6Z" fill="white"/>
                  <path d="M20.9998 27.5C14.2017 27.5 8.40951 31.7113 6.20312 37.6112C6.74061 38.1704 7.30682 38.6993 7.89922 39.1953C9.5422 33.7785 14.6963 29.7 20.9998 29.7C27.3032 29.7 32.4573 33.7785 34.1003 39.1953C34.6927 38.6993 35.2589 38.1704 35.7964 37.6113C33.59 31.7113 27.7979 27.5 20.9998 27.5Z" fill="white"/>
                </svg>
              </div>
              <input
                type="text"
                className="post-input"
                placeholder="Share your experience or ask a question..."
                value={input}
                onChange={e => setInput(e.target.value)}
                disabled={!user}
                onKeyPress={(e) => {
                  if (e.key === 'Enter' && canSend) {
                    handleSend();
                  }
                }}
              />
            </div>
            <div className="post-actions">
              <button className="post-button" onClick={handleSend} disabled={!canSend}>
                Post
              </button>
            </div>
          </div>

          <div className="messages-list">
            {messages.map((m, index) => {
              const isAnonymous = !m.email || m.email === 'anon';
              const displayName = isAnonymous ? 'Anonymous' : (m.username || m.email?.split('@')[0] || 'User');
              const displayHandle = isAnonymous ? '@*********' : `@${m.email?.split('@')[0] || 'user'}`;
              
              return (
                <div key={m.id} className="message-card">
                  <div className="message-header">
                    {isAnonymous ? (
                      <div className="avatar-anonymous">
                        <svg width="65" height="65" viewBox="0 0 65 65" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <circle cx="32.5" cy="32.5" r="32.5" fill="#686868"/>
                        </svg>
                      </div>
                    ) : (
                      <div className="avatar-circle">
                        {getUserInitials(m.email || '')}
                      </div>
                    )}
                    <div className="message-user-info">
                      <div className="user-name-time">
                        <span className="user-name">{displayName}</span>
                        <span className="message-time">{formatTimestamp(m.createdAt)}</span>
                      </div>
                      <div className="user-handle">{displayHandle}</div>
                    </div>
                  </div>
                  <div className="message-content">
                    <div className="message-text">{m.text}</div>
                  </div>
                </div>
              );
            })}
          </div>
          <div ref={listEndRef} />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChannelDetail;
