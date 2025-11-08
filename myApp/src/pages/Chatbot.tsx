import React, { useState } from "react";
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
import aboutIcon from '../icons/book-text.svg';
import settingsIcon from '../icons/settings.svg';
import profileIcon from '../icons/circle-user-round.svg';

const ChatbotPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

const handleSend = async () => {
  if (!message.trim()) return;
  await handleSendWithText(message);
};

const handleSendWithText = async (text: string) => {
  const newUserMsg = { sender: 'user', text };
  setChatHistory((prev) => [...prev, newUserMsg]);
  setLoading(true);

  try {
    const res = await fetch("https://chatwithlangflow-bz35xt5xna-uc.a.run.app/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message: text, user: { name: "Guest", id: "anon" } }),
    });

    const data = await res.json();
    const botReply =
      data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
      "No response from LangFlow.";

    setChatHistory((prev) => [...prev, { sender: 'bot', text: botReply }]);
  } catch (error) {
    console.error("LangFlow error:", error);
    setChatHistory((prev) => [
      ...prev,
      { sender: 'bot', text: "Error connecting to LangFlow." },
    ]);
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
      {/* Header */}
      <IonHeader className="explore-header chatbot-header">
        <IonButtons slot="start">
          <IonBackButton defaultHref="/home" />
        </IonButtons>
      </IonHeader>

      {/* Content */}
      <IonContent fullscreen className="chatbot-content">
        {/* Side Panel */}
        <aside className="side-panel">
          <div className="nav-top">
            <IonButton fill="clear" routerLink="/menu">
              <IonIcon icon={menuIcon} />
              <span className = "menu-text">Menu</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/home">
              <IonIcon icon={homeIcon} />
              <span className = "menu-text">Home</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/add">
              <IonIcon icon={addIcon} />
              <span className = "menu-text">New Chat</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/chatbot">
              <IonIcon icon={chatbotIcon} />
              <span className = "menu-text">Chats</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/community">
              <IonIcon icon={communityIcon} />
              <span className = "menu-text">Communities</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/timeline">
              <IonIcon icon={timelineIcon} />
              <span className = "menu-text">Timeline</span>
            </IonButton>
          </div>

          <div className="nav-bottom">
            <IonButton fill="clear" routerLink="/settings">
              <IonIcon icon={settingsIcon} />
              <span className = "menu-text">Setting</span>
            </IonButton>
            <IonButton fill="clear" routerLink="/profile">
              <IonIcon icon={profileIcon} />
              <span className = "menu-text">Profile</span>
            </IonButton>
          </div>
        </aside>

        {/* Main container: History + Chat */}
        <div className="chatbot-wrapper main-content">
          {/* History Panel */}
          <div className="history-panel">
            <div className="history-top">
              <h3 className="history-title">Chat</h3>
              <button
                className="new-chat-btn"
                onClick={() => setChatHistory([])}
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
              {chatHistory.map((msg, i) => (
                <div key={i} className="history-item">
                  {msg.sender === 'user' ? '💬 ' : '🤖 '}
                  {msg.text}
                </div>
              ))}
              {chatHistory.length === 0 && (
                <>
                  <div className="history-item">“Pregnancy Q&A”</div>
                  <div className="history-item">“Nutrition Support”</div>
                  <div className="history-item">“Postpartum Tips”</div>
                </>
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
                    Help me describe my pain level and history accurately.
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
              {loading && <p> Thinking...</p>}
            </div>

            <div className="chat-input-area">
              <input
                type="text"
                className="chat-input"
                placeholder="What's on your mind?"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSend()}
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

