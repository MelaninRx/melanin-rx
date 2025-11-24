import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonImg,
} from "@ionic/react";
import { useLocation } from "react-router-dom";
import "./Chatbot.css";
import "typeface-source-serif-pro";
import ReactMarkdown from 'react-markdown';
import { getFirestore, doc, collection, addDoc, getDocs, updateDoc, query, orderBy } from "firebase/firestore";
import { useCurrentUser } from "../hooks/useCurrentUser";
import SidebarNav from "../components/SidebarNav";

// Type for chat message
interface ChatMessage {
  sender: string;
  text: string;
}

const ChatbotPage: React.FC = () => {
  const location = useLocation();
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const hasProcessedInitialQuestionRef = React.useRef(false);
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

const handleSendWithText = async (text: string) => {
  // Check if this message already exists to prevent duplicates
  const isDuplicate = chatHistory.some(msg => msg.sender === 'user' && msg.text === text);
  if (isDuplicate) {
    return; // Already sent, don't send again
  }
  
  const newUserMsg = { sender: 'user', text };
  setChatHistory((prev) => [...prev, newUserMsg]);
  setLoading(true);

  try {
  console.log("Sending message to Firebase Function:", LANGFLOW_PROXY_URL);

  const res = await fetch(LANGFLOW_PROXY_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      message: text,
      user: { name: "Guest", id: "anon" }, // adjust if needed
    }),
  });

  console.log("Response status:", res.status);

  // ---- ERROR HANDLING ----
  if (!res.ok) {
    const errorData = await res.json().catch(() => ({ error: "Unknown error" }));
    console.error("Error response from Firebase Function:", errorData);
    throw new Error(errorData.error || `HTTP error! status: ${res.status}`);
  }

  // ---- SUCCESSFUL RESPONSE ----
  const data = await res.json();
  console.log("Bot response:", data);

  const botMessage = {
    sender: "bot",
    text: data.text ?? "No response received.",
  };

  setChatHistory((prev) => [...prev, botMessage]);

  // ---- SAVE TO FIRESTORE ----
  if (user?.uid) {
    const db = getFirestore();
    const convRef = collection(db, "users", user.uid, "chatHistory");

    const conversationData = {
      messages: [...chatHistory, { sender: "user", text }, botMessage],
      timestamp: Date.now(),
    };

    if (currentConversationId) {
      // Update existing conversation
      const existingRef = doc(convRef, currentConversationId);
      await setDoc(existingRef, conversationData, { merge: true });
    } else {
      // Create new conversation
      const newConvRef = doc(convRef);
      await setDoc(newConvRef, conversationData);
      setCurrentConversationId(newConvRef.id);
    }
  }
} catch (error) {
  console.error("Error sending message:", error);

  setChatHistory((prev) => [
    ...prev,
    { sender: "bot", text: "Sorry, something went wrong." },
  ]);
} finally {
  setLoading(false);
}


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

  // Start a new chat (doesn't clear history, just resets the conversation ID)
  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentConversationId(null);
  };

  // Load a saved conversation
  const handleLoadConversation = (conv: any) => {
    setChatHistory(conv.messages || []);
    setCurrentConversationId(conv.id || null);
  };

  // Handle quick question clicks
  const handleQuickQuestion = async (question: string) => {
    setMessage(question);
    await handleSendWithText(question);
  };

  // handleSend - when user clicks "Send"
  const handleSend = async () => {
    if (!message.trim()) return;
    await handleSendWithText(message);
  };

  const handleSendWithText = async (text: string) => {
    // add user message to chat history
    const newUserMsg = { sender: 'user', text };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setLoading(true);

    try {
      const res = await fetch("https://chatwithlangflow-bz35xt5xna-uc.a.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, user: { name: "Guest", id: "anon" } }),
      });

      // parse JSON response from LangFlow
      const data = await res.json();

      // extract bot's response
      const botReply =
        data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
        "No response from LangFlow.";

      // add bot's response to chat history
      const finalHistory = [...updatedHistory, { sender: 'bot', text: botReply }];
      setChatHistory(finalHistory);

      // Save to Firestore after bot responds
      await saveOrUpdateConversation(finalHistory);

    } catch (error) {
      console.error("LangFlow error:", error);
      const errorHistory = [
        ...updatedHistory,
        { sender: 'bot', text: "Error connecting to LangFlow." }
      ];
      setChatHistory(errorHistory);

      // Save error state too
      await saveOrUpdateConversation(errorHistory);
    }

    setMessage('');
    setLoading(false);
  };

  // Check for question in URL query parameter and auto-send it (only once)
  useEffect(() => {
    if (hasProcessedInitialQuestionRef.current || chatHistory.length > 0) return; // Already processed or chat started
    
    const searchParams = new URLSearchParams(location.search);
    const question = searchParams.get('question');
    
    if (question) {
      hasProcessedInitialQuestionRef.current = true; // Mark as processed immediately
      const decodedQuestion = decodeURIComponent(question);
      handleSendWithText(decodedQuestion);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [location.search]); // Run when location.search changes, but guards prevent duplicates

  const isChatStarted = chatHistory.length > 0;

  return (
    <IonPage>

      <IonContent fullscreen>
        {/* ✅ added minimal top padding so chat UI doesn't hide behind header */}
        <div className="container chatbot-wrapper">
          {/* Sidebar */}
          <SidebarNav />

          {/* left panel */}
          <div className="history-panel">
            <div className="history-top">
              <h3 className="history-title">Chat</h3>
              {/* --- "New Chat" button starts fresh conversation --- */}
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

            <h3 className="history-subtitle"></h3>
            <div className="history-items">
              {/* Show saved conversations from Firebase */}
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
                    💬 {truncatedPreview}
                    {conv.timestamp && (
                      <div className="history-item-time">
                        {new Date(conv.timestamp).toLocaleDateString()}
                      </div>
                    )}
                  </div>
                );
              })}
              {/* Placeholder when no saved conversations */}
              {savedConversations.length === 0 && (
                <>
                  <div className="history-item">💬 "Pregnancy Q&A"</div>
                  <div className="history-item">💬 "Nutrition Support"</div>
                  <div className="history-item">💬 "Postpartum Tips"</div>
                </>
              )}
            </div>
          </div>

          {/* right panel */}
          <div className="chat-panel">
            {!isChatStarted && (
              <div className="chat-top">
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

            {/* --- Chat conversation area --- */}
            <div className="chat-messages">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={
                    msg.sender === 'user'
                      ? 'chat-bubble user'
                      : 'chat-bubble bot'
                  }
                >
                  {msg.sender === 'bot' ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}

              {loading && <p>🤖 Thinking...</p>}
            </div>

            {/* --- Input box + Send button --- */}
            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)} // track input text
                onKeyDown={(e) => e.key === 'Enter' && !loading && handleSend()} // allow Enter key to send
              />

              <button
                className="send-btn"
                onClick={handleSend}
                disabled={loading} // disable while bot is responding
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
