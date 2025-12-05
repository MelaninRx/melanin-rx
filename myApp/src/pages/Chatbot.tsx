import React, { useState, useEffect } from "react";
import {
  IonPage,
  IonContent,
} from "@ionic/react";
import { useLocation } from "react-router-dom";
import "./Chatbot.css";
import "typeface-source-serif-pro";
import ReactMarkdown from "react-markdown";
import remarkGfm from 'remark-gfm';
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
import { sendMessageToChatbot } from '../services/chatbotService';

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
  const [stylePreference, setStylePreference] = useState<'standard' | 'visual' | 'wordy'>('standard');

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
    console.log('[ChatbotPage] handleSendWithText called');
    const newUserMsg = { sender: "user", text };
    const updatedHistory = [...chatHistory, newUserMsg];
    setChatHistory(updatedHistory);
    setLoading(true);
    
    try {
      // Format conversation history for LangFlow
      let fullMessage = text;
      
      if (chatHistory.length > 0) {
        const historyText = chatHistory
          .slice(-10) // Last 10 messages
          .map(msg => `${msg.sender === "user" ? "User" : "Assistant"}: ${msg.text}`)
          .join('\n');
        
        fullMessage = `Previous conversation:\n${historyText}\n\nCurrent question:\nUser: ${text}`;
        console.log('Including conversation history');
      }
      
      const res = await fetch(CHATBOT_API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: fullMessage,  // Include history here
          user: { name: user?.displayName || "Guest", id: user?.uid || "anon" },
          stylePreference: stylePreference,
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
  // Fun facts about Black maternal health
    const maternalHealthFacts = [
      // Disparity awareness (with sources)
      "💜 Black women are 3-4 times more likely to die from pregnancy-related causes than white women (CDC).",
      "📊 In 2023, the maternal mortality rate for Black women was 50.3 per 100,000 live births—compared to 14.5 for white women (American Hospital Association).",
      "🎓 Black women face higher maternal mortality risks across ALL income and education levels (Johns Hopkins Bloomberg School of Public Health).",
      "🩺 Hypertensive disorders like preeclampsia account for over 60% of maternal deaths among Black women between 2018-2022 (JAMA Network).",
      "🏥 U.S.-born Black women are more likely to develop preeclampsia than foreign-born Black women (Johns Hopkins Medicine).",
      
      // Supportive & empowering facts
      "🌟 Your body is doing amazing work growing a new life—honor it with rest, nutrition, and self-care.",
      "💪 Having a birth support person (like a doula) can improve your birth experience and outcomes.",
      "🗣️ Speaking up about your symptoms and concerns is not being difficult—it's protecting your health and your baby's.",
      "❤️ Community and connection matter: reaching out to other expectant mothers can provide valuable support.",
      "✨ Every pregnancy journey is unique—trust yourself and your instincts about what your body needs.",
    ];

    const getRandomFact = () => {
      return maternalHealthFacts[Math.floor(Math.random() * maternalHealthFacts.length)];
    };

    // Component to rotate facts with animation
    const LoadingFact: React.FC = () => {
      const [currentFact, setCurrentFact] = React.useState(getRandomFact());
      const [key, setKey] = React.useState(0);

      React.useEffect(() => {
        const interval = setInterval(() => {
          setCurrentFact(getRandomFact());
          setKey(prev => prev + 1); // Force re-render to trigger animation
        }, 4000); // Change fact every 4 seconds

        return () => clearInterval(interval);
      }, []);

      return (
        <p key={key} className="loading-fact">
          {currentFact}
        </p>
      );
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

                <div className="disclaimer-box">
                  <p className="disclaimer-text">
                    <strong>Medical Disclaimer:</strong> This chatbot provides general health information and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your healthcare provider with any questions you may have regarding a medical condition.
                  </p>
                </div>

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
                    // @ts-ignore
                    <ReactMarkdown
                      remarkPlugins={[remarkGfm]}
                      components={{
                        a: ({ node, ...props }) => (
                          <a {...props} target="_blank" rel="noopener noreferrer" className="source-link" />
                        ),
                        p: ({ node, children, ...props }) => {
                          // Check if paragraph contains cultural health keywords
                          const text = String(children);
                          const culturalKeywords = [
                            'Black women',
                            'African American women',
                            'Black mothers',
                            'disparity',
                            'times more likely',
                            'higher risk',
                            'three times',
                            '3x more',
                            '3 times more'
                          ];
                          
                          const hasCulturalContent = culturalKeywords.some(keyword => 
                            text.toLowerCase().includes(keyword.toLowerCase())
                          );
                          
                          if (hasCulturalContent) {
                            return (
                              <div className="cultural-info">
                                <p {...props}>{children}</p>
                              </div>
                            );
                          }
                          
                          return <p {...props}>{children}</p>;
                        }
                      }}
                    >
                      {msg.text}
                    </ReactMarkdown>
                  ) : (
                    msg.text
                  )}
                </div>
              ))}

              {loading && (
                <div className="loading-container">
                  <video 
                    className="loading-animation"
                    autoPlay 
                    loop 
                    muted 
                    playsInline
                  >
                    <source src="/loading-animation.webm" type="video/webm" />
                    <div className="pulse-circle"></div>
                  </video>
                  <p className="loading-text">Searching trusted sources...</p>
                  <LoadingFact />
                </div>
              )}
            </div>

            {/* Style Selector */}
            <div className="style-selector">
              <label htmlFor="style-select">Response Style:</label>
              <select
                id="style-select"
                value={stylePreference}
                onChange={(e) => setStylePreference(e.target.value as 'standard' | 'visual' | 'wordy')}
                className="style-dropdown"
              >
                <option value="standard">Standard</option>
                <option value="visual">Visual (with images)</option>
                <option value="wordy">Detailed</option>
              </select>
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