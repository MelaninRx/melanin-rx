import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
} from "@ionic/react";
import { useLocation } from "react-router-dom";
import "./Chatbot.css";
import "typeface-source-serif-pro";
import ReactMarkdown from "react-markdown";
import {
  getFirestore,
  doc,
  collection,
  addDoc,
  getDocs,
  updateDoc,
  query,
  orderBy,
} from "firebase/firestore";
import { useCurrentUser } from "../hooks/useCurrentUser";
import SidebarNav from "../components/SidebarNav";
import MobileMenuButton from '../components/MobileMenuButton';

// Type for chat message
interface ChatMessage {
  sender: string;
  text: string;
}

const ChatbotPage: React.FC = () => {
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [savedConversations, setSavedConversations] = useState<any[]>([]);
  const [currentConversationId, setCurrentConversationId] =
    useState<string | null>(null);

  const user = useCurrentUser();
  const hasProcessedInitialQuestionRef = React.useRef(false);

  const CHATBOT_API_URL =
    "https://chatwithlangflow-bz35xt5xna-uc.a.run.app/";

  // ------------------------------------------------------------
  // Fetch saved conversations on mount or user change
  // ------------------------------------------------------------
  useEffect(() => {
    const fetchConversations = async () => {
      if (!user?.uid) return;

      const db = getFirestore();
      const convRef = collection(db, "users", user.uid, "chatHistory");
      const q = query(convRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);

      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSavedConversations(convs);
    };

    fetchConversations();
  }, [user]);

  // ------------------------------------------------------------
  // Save or update conversation in Firestore
  // ------------------------------------------------------------
  const saveOrUpdateConversation = async (messages: ChatMessage[]) => {
    if (!user?.uid || messages.length === 0) return;

    const db = getFirestore();
    const convRef = collection(db, "users", user.uid, "chatHistory");

    try {
      if (currentConversationId) {
        const docRef = doc(
          db,
          "users",
          user.uid,
          "chatHistory",
          currentConversationId
        );

        await updateDoc(docRef, {
          messages,
          timestamp: new Date().toISOString(),
        });
      } else {
        const docRef = await addDoc(convRef, {
          messages,
          timestamp: new Date().toISOString(),
        });

        setCurrentConversationId(docRef.id);
      }

      // refresh conversation list
      const q = query(convRef, orderBy("timestamp", "desc"));
      const snapshot = await getDocs(q);
      const convs = snapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      }));

      setSavedConversations(convs);
    } catch (error) {
      console.error("Error saving conversation:", error);
    }
  };

  // ------------------------------------------------------------
  // Start a new chat
  // ------------------------------------------------------------
  const handleNewChat = () => {
    setChatHistory([]);
    setCurrentConversationId(null);
  };

  // ------------------------------------------------------------
  // Load a saved conversation
  // ------------------------------------------------------------
  const handleLoadConversation = (conv: any) => {
    setChatHistory(conv.messages || []);
    setCurrentConversationId(conv.id || null);
  };

  // ------------------------------------------------------------
  // Suggested question handler
  // ------------------------------------------------------------
  const handleQuickQuestion = async (question: string) => {
    setMessage(question);
    await handleSendWithText(question);
  };

  // ------------------------------------------------------------
  // Main send function
  // ------------------------------------------------------------
  const handleSend = async () => {
    if (!message.trim()) return;
    await handleSendWithText(message);
  };

  const handleSendWithText = async (text: string) => {
    const newUserMsg = { sender: "user", text };
    const updatedHistory = [...chatHistory, newUserMsg];

    setChatHistory(updatedHistory);
    setLoading(true);

    try {
      const res = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: text,
          user: { name: "Guest", id: "anon" },
        }),
      });

      const data = await res.json();

      const botReply =
        data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ??
        "No response from LangFlow.";

      const finalHistory = [
        ...updatedHistory,
        { sender: "bot", text: botReply },
      ];

      setChatHistory(finalHistory);
      await saveOrUpdateConversation(finalHistory);
    } catch (error) {
      console.error("LangFlow error:", error);

      const errorHistory = [
        ...updatedHistory,
        { sender: "bot", text: "Error connecting to LangFlow." },
      ];

      setChatHistory(errorHistory);
      await saveOrUpdateConversation(errorHistory);
    }

    setMessage("");
    setLoading(false);
  };

  // ------------------------------------------------------------
  // Read ?question= from URL ONCE and auto-send it
  // ------------------------------------------------------------
  useEffect(() => {
    if (hasProcessedInitialQuestionRef.current) return;
    if (chatHistory.length > 0) return;

    const searchParams = new URLSearchParams(location.search);
    const question = searchParams.get("question");

    if (question) {
      hasProcessedInitialQuestionRef.current = true;
      handleSendWithText(decodeURIComponent(question));
    }
  }, [location.search]);

  const isChatStarted = chatHistory.length > 0;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="container chatbot-wrapper">
          <MobileMenuButton />
          <SidebarNav />

          {/* LEFT: Conversation history */}
          <div className="history-panel">
            <div className="history-top">
              <h3 className="history-title">Chat</h3>
              <button className="new-chat-btn" onClick={handleNewChat}>
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
                const firstUserMsg = Array.isArray(conv.messages)
                  ? conv.messages.find((msg: any) => msg.sender === "user")
                  : null;

                const previewText =
                  firstUserMsg?.text || `Conversation ${i + 1}`;

                const truncatedPreview =
                  previewText.length > 50
                    ? previewText.substring(0, 50) + "..."
                    : previewText;

                const isActive = conv.id === currentConversationId;

                return (
                  <div
                    key={conv.id || i}
                    className={`history-item ${isActive ? "active" : ""}`}
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

              {savedConversations.length === 0 && (
                <>
                  <div className="history-item">💬 "Pregnancy Q&A"</div>
                  <div className="history-item">💬 "Nutrition Support"</div>
                  <div className="history-item">💬 "Postpartum Tips"</div>
                </>
              )}
            </div>
          </div>

          {/* RIGHT: Chat panel */}
          <div className="chat-panel">
            {!isChatStarted && (
              <div className="chat-top">
                <p className="chat-greeting">Hello</p>
                <p className="chat-subtitle">How can we help you today?</p>

                <div className="suggested-questions-row">
                  <button
                    className="question-box"
                    onClick={() =>
                      handleQuickQuestion(
                        "Help me create a script for my upcoming appointments"
                      )
                    }
                  >
                    Help me create a script for my upcoming appointments
                  </button>

                  <button
                    className="question-box"
                    onClick={() =>
                      handleQuickQuestion(
                        "What are common postpartum symptoms?"
                      )
                    }
                  >
                    What are common postpartum symptoms?
                  </button>

                  <button
                    className="question-box"
                    onClick={() =>
                      handleQuickQuestion(
                        "What should I expect in my second trimester check-up?"
                      )
                    }
                  >
                    What should I expect in my second trimester check-up?
                  </button>
                </div>
              </div>
            )}

            {/* Messages */}
            <div className="chat-messages">
              {chatHistory.map((msg, i) => (
                <div
                  key={i}
                  className={`chat-bubble ${
                    msg.sender === "user" ? "user" : "bot"
                  }`}
                >
                  {msg.sender === "bot" ? (
                    <ReactMarkdown>{msg.text}</ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}

              {loading && <p>🤖 Thinking...</p>}
            </div>

            {/* Input */}
            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && handleSend()
                }
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
