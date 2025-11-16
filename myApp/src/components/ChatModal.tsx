import React, { useState, useEffect, useRef } from 'react';
import { IonModal, IonHeader, IonToolbar, IonTitle, IonButtons, IonButton, IonContent, IonSpinner } from '@ionic/react';
import { sendMessageToChatbot, ChatMessage } from '../services/chatbotService';
import './ChatModal.css';

interface ChatModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

const ChatModal: React.FC<ChatModalProps> = ({ isOpen, onClose, initialQuestion }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-send initial question when modal opens
  useEffect(() => {
    if (isOpen && initialQuestion && chatHistory.length === 0) {
      handleSendWithText(initialQuestion);
    }
  }, [isOpen, initialQuestion]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  const handleSendWithText = async (text: string) => {
    if (!text.trim()) return;

    const newUserMsg: ChatMessage = { 
      sender: 'user', 
      text,
      timestamp: new Date()
    };
    setChatHistory((prev) => [...prev, newUserMsg]);
    setLoading(true);

    try {
      const botReply = await sendMessageToChatbot({ message: text });
      const botMsg: ChatMessage = { 
        sender: 'bot', 
        text: botReply,
        timestamp: new Date()
      };
      setChatHistory((prev) => [...prev, botMsg]);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error connecting to chatbot.";
      const errorMsg: ChatMessage = { 
        sender: 'bot', 
        text: `Error: ${errorMessage}`,
        timestamp: new Date()
      };
      setChatHistory((prev) => [...prev, errorMsg]);
    }

    setMessage('');
    setLoading(false);
  };

  const handleSend = () => {
    handleSendWithText(message);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleClose = () => {
    setChatHistory([]);
    setMessage('');
    onClose();
  };

  return (
    <IonModal isOpen={isOpen} onDidDismiss={handleClose}>
      <IonHeader>
        <IonToolbar>
          <IonTitle>Chat Assistant</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleClose}>Close</IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="chat-modal-content">
        <div className="chat-modal-messages">
          {chatHistory.map((msg, i) => (
            <div
              key={i}
              className={`chat-modal-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}
            >
              <div className="bubble-content">{msg.text}</div>
            </div>
          ))}
          {loading && (
            <div className="chat-modal-loading">
              <IonSpinner name="dots" />
              <span>Thinking...</span>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="chat-modal-input-area">
          <input
            type="text"
            className="chat-modal-input"
            placeholder="Ask a follow-up question..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading}
          />
          <button
            className="chat-modal-send-btn"
            onClick={handleSend}
            disabled={loading || !message.trim()}
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <line x1="22" y1="2" x2="11" y2="13"></line>
              <polygon points="22 2 15 22 11 13 2 9 22 2"></polygon>
            </svg>
          </button>
        </div>
      </IonContent>
    </IonModal>
  );
};

export default ChatModal;