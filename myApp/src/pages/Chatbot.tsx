import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonBackButton,
  IonContent,
  IonImg,
  IonIcon,
  IonButton,
} from "@ionic/react";
import "./Chatbot.css";
import "typeface-source-serif-pro";
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
import SidebarNav from "../components/SidebarNav";
import { getFirestore, doc, collection, addDoc, getDocs, updateDoc, query, orderBy } from "firebase/firestore";
import { useCurrentUser } from "../hooks/useCurrentUser";

// Use your Firebase project ID here
const FIREBASE_PROJECT_ID = "melaninrx-4842c";
const FIREBASE_REGION = "us-central1";

// Construct the Firebase Function URL
const LANGFLOW_PROXY_URL = `https://${FIREBASE_REGION}-${FIREBASE_PROJECT_ID}.cloudfunctions.net/chatWithLangFlow`;

// Type for chat message
interface ChatMessage {
  sender: string;
  text: string;
}

const ChatbotPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] = useState<string | null>(null);
  const user = useCurrentUser();

  // Fetch previous conversations on mount or when user changes
  useEffect(() => {
    const fetchConversations = async () => {
      if (user?.uid) {
        const db = getFirestore();
        const convRef = collection(db, "users", user.uid, "chatHistory");
        const q = query(convRef, orderBy("timestamp", "desc"));
        const snapshot = await getDocs(q);
        const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setSavedConversations(convs);
      }
    };
    fetchConversations();
  }, [user]);

  // Save or update conversation in Firestore
  const saveOrUpdateConversation = async (messages: ChatMessage[]) => {
    if (!user?.uid || messages.length === 0) return;

    const db = getFirestore();
    const convRef = collection(db, "users", user.uid, "chatHistory");

    try {
      if (currentConversationId) {
        // Update existing conversation
        const docRef = doc(db, "users", user.uid, "chatHistory", currentConversationId);
        await updateDoc(docRef, {
          messages: messages,
          timestamp: new Date().toISOString(),
        });
      } else {
        // Create new conversation
        const docRef = await addDoc(convRef, {
          messages: messages,
          timestamp: new Date().toISOString(),
        });
        setCurrentConversationId(docRef.id);
      }

      // Refresh conversations list
      const q = query(convRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const convs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setSavedConversations(convs);
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  // Start a new chat
  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentConversationId(null);
  };

  // Load a saved conversation
  const handleLoadConversation = (conv: any) => {
    setChatHistory(conv.messages || []);
    setCurrentConversationId(conv.id || null);
  };

  const handleSend = async () => {
    if (!message.trim()) return;
    await handleSendWithText(message);
  };

  const handleSendWithText = async (text: string) => {
    const newUserMsg = { sender: 'user', text };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setLoading(true);

    try {
      console.log("Sending message to Firebase Function:", LANGFLOW_PROXY_URL);
      const res = await fetch(LANGFLOW_PROXY_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, user: { name: "Guest", id: "anon" } }),
      });

      console.log("Response status:", res.status);
      
      if (!res.ok) {
        const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
        console.error("Error response from Firebase Function:", errorData);
        throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
      }

      const data = await res.json();
      console.log("LangFlow response:", data);

      const botReply =
        data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
        "No response from LangFlow.";

      const finalHistory = [...updatedHistory, { sender: 'bot', text: botReply }];
      setChatHistory(finalHistory);
      
      // Save to Firestore after bot responds
      await saveOrUpdateConversation(finalHistory);

    } catch (error) {
      console.error("LangFlow error:", error);
      const errorMessage = error instanceof Error ? error.message : "Error connecting to LangFlow.";
      const errorHistory = [
        ...updatedHistory,
        { sender: 'bot', text: `Error: ${errorMessage}` },
      ];
      setChatHistory(errorHistory);
      
      // Save error state too
      await saveOrUpdateConversation(errorHistory);
    }

    setMessage('');
    setLoading(false);
  };

  const handleQuickQuestion = async (question: string) => {
    setMessage(question);
    await handleSendWithText(question);
  };

  const isChatStarted = chatHistory.length > 0;

  return (
    <IonPage className="chatbot-page">
      <IonContent fullscreen>
        <SidebarNav/>

        {/* Main container: History + Chat */}
        <div className="chatbot-wrapper main-content">
          {/* History Panel */}
          <div className="history-panel">
            <div className="history-top">
              <h3 className="history-title">Chat</h3>
              <button
                className="new-chat-btn"
                onClick={handleNewChat}
              >
                New Chat
              </button>
            </div>

            <div className="history-search">
              <input
                type="text"
                placeholder="Search"
                className="search-input"
              />
            </div>

            <div className="history-items">
              {savedConversations.map((conv, i) => {
                // Find the first user message in the conversation
                const firstUserMsg = Array.isArray(conv.messages)
                  ? conv.messages.find((msg: any) => msg.sender === 'user')
                  : null;
                const previewText = firstUserMsg?.text || `Conversation ${i + 1}`;
                // Truncate preview text if too long
                const truncatedPreview = previewText.length > 50 
                  ? previewText.substring(0, 50) + "..." 
                  : previewText;
                
                const isActive = conv.id === currentConversationId;
                
                return (
                  <div 
                    key={conv.id || i} 
                    className={`history-item ${isActive ? 'active' : ''}`}
                    onClick={() => handleLoadConversation(conv)}
                  >
                    <div className="history-item-text">{truncatedPreview}</div>
                    {conv.timestamp && (
                      <div className="history-item-time">
                        {new Date(conv.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
              {savedConversations.length === 0 && (
                <div className="history-empty">
                  <p>No previous conversations</p>
                  <p className="history-empty-subtitle">Start a new chat to begin</p>
                </div>
              )}
            </div>
          </div>

          {/* Chat Panel */}
          <div className={`chat-panel ${isChatStarted ? "has-messages" : "empty"}`}>
            {!isChatStarted && (
              <div className="chat-top fade-in">
                <p className="chat-greeting">Hello</p>
                <p className="chat-subtitle">How can we help you today?</p>
                
                <div className="suggested-questions-row">
                  <button
                    className="question-box"
                    onClick={() =>
                      handleQuickQuestion("Help me create a script for my upcoming appointments")
                    }
                  >
                    Help me create a script for my upcoming appointments
                  </button>
                    
                  <button
                    className="question-box"
                    onClick={() =>
                      handleQuickQuestion("What are common postpartum symptoms?")
                    }
                  >
                    What are common postpartum symptoms?
                  </button>
                  
                  <button
                    className="question-box"
                    onClick={() =>
                      handleQuickQuestion("What should I expect in my second trimester check-up?")
                    }
                  >
                    What should I expect in my second trimester check-up?
                  </button>
                </div>
              </div>
            )}

            <div className="chat-messages">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}
                >
                  {msg.text}
                </div>
              ))}
              {loading && <p className="thinking-indicator">Thinking...</p>}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()}
              />
              <button
                className="send-btn"
                onClick={handleSend}
                disabled={loading}
              >
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <line x1="22" y1="2" x2="11" y2="13"></line>
                  <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </IonContent>
    </IonPage>
  );
};

export default ChatbotPage;