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
  const displayedHistory = currentConversation?.messages || [];

  console.log("[ChatbotPage] currentConversationId:", currentConversationId);
  console.log("[ChatbotPage] savedConversations:", savedConversations);
  console.log("[ChatbotPage] currentConversation:", currentConversation);

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
    console.log('[ChatbotPage] handleSendWithText called, currentConversationId:', currentConversationId);
    const newUserMsg = { sender: "user", text };
    const updatedHistory = [...displayedHistory, newUserMsg];
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

  const isChatStarted = displayedHistory.length > 0;

  // ------------------------------------------------------------
  // UI
  // ------------------------------------------------------------
  return (
    <IonPage>
      <IonContent fullscreen>
        <div className="container chatbot-wrapper">
          <MobileMenuButton />
          <SidebarNav />

          
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
              {displayedHistory.map((msg, i) => (
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
