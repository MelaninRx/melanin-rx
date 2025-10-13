import React from 'react';
import { IonPage, IonHeader, IonToolbar, IonTitle, IonContent } from '@ionic/react';
import './Chatbot.css';
import 'typeface-source-serif-pro';

const ChatbotPage: React.FC = () => {
  return (
    <IonPage>

      <IonContent>
        <div className="container">
          {/* side panel*/}
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
                <button className="new-chat-btn"> New Chat</button>
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
                <div className="history-item">Chatbot Placeholder 1</div>
                <div className="history-item">Chatbot Placeholder 2</div>
                <div className="history-item">Chatbot Placeholder 3</div>
            </div>
          </div>

          {/* right panel */}
          <div className="chat-panel">
            <div className="chat-top">
                <p className="chat-greeting">Hello</p>
                <p className="chat-subtitle">How can we help you today?</p>
            </div>

            <div className="chat-input-area">
              <input
              type="text"
              className="chat-input"
              placeholder="What's on your mind？"
              />
              <button className="send-btn">
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
