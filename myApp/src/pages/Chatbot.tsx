import React, { useState } from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonImg,
} from "@ionic/react";
import "./Chatbot.css";
import "typeface-source-serif-pro"
import ReactMarkdown from 'react-markdown';

const ChatbotPage: React.FC = () => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<{ sender: string; text: string }[]>([]);
  const [loading, setLoading] = useState(false);

  // handleSend - when user clicks "Send"
  const handleSend = async () => {
    if (!message.trim()) return;

    // add user message to chat history
    const newUserMsg = { sender: 'user', text: message };
    setChatHistory((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const res = await fetch("https://chatwithlangflow-bz35xt5xna-uc.a.run.app/", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message, user : {name: "Guest", id: "anon"} }),
      });

      // parse JSON response from LangFlow
      const data = await res.json();

      // exctract bot's response
      const botReply =
        data.outputs?.[0]?.outputs?.[0]?.results?.message?.text ||
        "No response from LangFlow.";

      // add bot's response to chat history
      setChatHistory((prev) => [...prev, { sender: 'bot', text: botReply }]);
    } catch (error) {
      console.error("LangFlow error:", error);
      setChatHistory((prev) => [...prev, { sender: 'bot', text: "Error connecting to LangFlow." }]);
    }

    setMessage('');
    setLoading(false);
  };

  return (
    <IonPage>
      {/* ✅ Explore-style header (clean + minimal) */}
      <IonHeader className="explore-header chatbot-header">
        <IonButtons slot="start">
          <IonButton routerLink="/home" routerDirection="root" color="medium">Home</IonButton>
        </IonButtons>
      </IonHeader>

      <IonContent fullscreen>
        {/* ✅ added minimal top padding so chat UI doesn’t hide behind header */}
        <div className="container chatbot-wrapper">
          {/* Sidebar */}
          <div className="sidebar">
            <div className="sidebar-top">
              <div className="logo" title = 'Logo'></div>
            </div>
            <div className="divider"></div>

            <div className = "sidebar-middle">
                <div className="icon" title="Home"></div>
                <div className="icon" title="Settings"></div>
                <div className="icon" title="Profile"></div>
                <div className="icon" title="Analytics"></div>
            </div>

            <div className = "sidebar-bottom">
                <div className ="user-pic"> </div>
            </div>
          </div>

          {/* left panel */}
          <div className="history-panel">
            <div className = "history-top">
                <h3 className = "history-title">Chat</h3>
                {/* --- "New Chat" button clears chatHistory --- */}
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

            <h3 className = "history-subtitle"></h3>
            <div className="history-items">
              {/* Placeholder old chat list — not connected to active chat yet */}
              <div className="history-item">💬 Chat 1 – “Pregnancy Q&A”</div>
              <div className="history-item">💬 Chat 2 – “Nutrition Support”</div>
              <div className="history-item">💬 Chat 3 – “Postpartum Tips”</div>
            </div>
          </div>

          {/* right panel */}
          <div className="chat-panel">
            <div className="chat-top">
                <p className="chat-greeting">Hello</p>
                <p className="chat-subtitle">How can we help you today?</p>
            </div>

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
              onKeyDown={(e) => e.key === 'Enter' && handleSend()} // allow Enter key to send
            />

            <button
              className="send-btn"
              onClick={handleSend}
              disabled={loading} // disable while bot is responding
            ><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
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
