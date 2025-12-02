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
import { ChatProvider, useChat } from "../context/ChatContext";

// Type for chat message
interface ChatMessage {
  sender: string;
  text: string;
}

const ChatbotPage: React.FC = () => {
  const location = useLocation();
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const user = useCurrentUser();
  const hasProcessedInitialQuestionRef = React.useRef(false);
  const CHATBOT_API_URL = "https://chatwithlangflow-bz35xt5xna-uc.a.run.app/";

  // Use context for chat state/handlers
  const {
    chatHistory,
    setChatHistory,
    savedConversations,
    currentConversationId,
    handleNewChat,
    handleLoadConversation,
    saveOrUpdateConversation,
  } = useChat();

  // Always get the current conversation from context
  const currentConversation = savedConversations.find(c => c.id === currentConversationId);

  console.log("[ChatbotPage] currentConversationId:", currentConversationId);
  console.log("[ChatbotPage] savedConversations:", savedConversations);
  console.log("[ChatbotPage] currentConversation:", currentConversation);

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get user's first name
  const getUserName = () => {
    if (user?.displayName) {
      return user.displayName.split(' ')[0];
    }
    return "there";
  };

  // ------------------------------------------------------------
  // Suggested question handler
  // ------------------------------------------------------------
  const handleQuickQuestion = async (question: string) => {
    setMessage(""); // Clear input immediately
    await handleSendWithText(question);
  };

  // ------------------------------------------------------------
  // Main send function
  // ------------------------------------------------------------
  const handleSend = async () => {
    if (!message.trim()) return;
    setMessage(""); // Clear input immediately
    await handleSendWithText(message);
  };

  const handleSendWithText = async (text: string) => {
    console.log('[ChatbotPage] handleSendWithText called, currentConversationId:', currentConversationId);
    const newUserMsg = { sender: "user", text };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory); // Update chatHistory immediately so user bubble shows
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
  }, [location.search, chatHistory]);

  // ------------------------------------------------------------
  // Ensure correct chat loads when currentConversationId changes
  // ------------------------------------------------------------
  useEffect(() => {
    if (!currentConversationId) return;
    if (currentConversation && currentConversation.messages) {
      console.log("[ChatbotPage] useEffect: Setting chatHistory to messages of convo:", currentConversationId, currentConversation.messages);
      setChatHistory(currentConversation.messages);
    }
  }, [currentConversationId, savedConversations]);

  const isChatStarted = chatHistory.length > 0;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="chatbot-container">
          <MobileMenuButton />
          <SidebarNav />

          <div className="chat-panel">
            {!isChatStarted && (
              <div className="welcome-section">
                <h1 className="greeting-title">
                  {getGreeting()} {getUserName()}!
                </h1>
                <p className="greeting-subtitle">How can I help you today?</p>

                <div className="suggestion-cards">
                  <button
                    className="suggestion-card"
                    onClick={() =>
                      handleQuickQuestion(
                        "Help me create a script for my upcoming doctor appointment."
                      )
                    }
                  >
                    Help me create a script for my upcoming doctor appointment.
                  </button>

                  <button
                    className="suggestion-card"
                    onClick={() =>
                      handleQuickQuestion(
                        "Help me describe my pain levels and history accurately."
                      )
                    }
                  >
                    Help me describe my pain levels and history accurately.
                  </button>

                  <button
                    className="suggestion-card"
                    onClick={() =>
                      handleQuickQuestion(
                        "What should I expect during my second-trimester check-up?"
                      )
                    }
                  >
                    What should I expect during my second-trimester check-up?
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

              {loading && <p className="thinking-text">🤖 Thinking...</p>}
            </div>

            {/* Input */}
            <div className="chat-input-container">
              <input
                type="text"
                className="chat-input-field"
                placeholder="How can I help you today?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) =>
                  e.key === "Enter" && !loading && handleSend()
                }
              />

              <button
                className="submit-button"
                onClick={handleSend}
                disabled={loading}
              >
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M5 12L12 5M12 5L19 12M12 5V19"
                    stroke="white"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
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