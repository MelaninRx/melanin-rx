import React, { useState, useEffect, useRef } from 'react';
import { sendMessageToChatbot, ChatMessage } from '../services/chatbotService';
import './ChatWidget.css';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose, initialQuestion }) => {
  const [message, setMessage] = useState('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-send initial question when widget opens
  useEffect(() => {
    if (isOpen && initialQuestion && chatHistory.length === 0) {
      handleSendWithText(initialQuestion);
    }
  }, [isOpen, initialQuestion]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Reset when closed
  useEffect(() => {
    if (!isOpen) {
      setChatHistory([]);
      setMessage('');
      setIsMinimized(false);
    }
  }, [isOpen]);

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

  if (!isOpen) return null;

  return (
    <div className={`chat-widget ${isMinimized ? 'minimized' : ''}`}>
      {/* Header */}
      <div className="chat-widget-header">
        <div className="chat-widget-header-content">
          <div className="chat-widget-avatar">🤖</div>
          <div className="chat-widget-title">
            <div className="chat-widget-name">MelaninRx Assistant</div>
            <div className="chat-widget-status">Online</div>
          </div>
        </div>
        <div className="chat-widget-actions">
          <button 
            className="chat-widget-btn"
            onClick={() => setIsMinimized(!isMinimized)}
            title={isMinimized ? "Expand" : "Minimize"}
          >
            {isMinimized ? '▲' : '▼'}
          </button>
          <button 
            className="chat-widget-btn"
            onClick={onClose}
            title="Close"
          >
            ✕
          </button>
        </div>
      </div>

      {/* Messages Area */}
      {!isMinimized && (
        <>
          <div className="chat-widget-messages">
            {chatHistory.length === 0 && !loading && (
              <div className="chat-widget-welcome">
                <p>👋 Hi! I'm here to help answer your pregnancy questions.</p>
              </div>
            )}
            
            {chatHistory.map((msg, i) => (
              <div
                key={i}
                className={`chat-widget-bubble ${msg.sender === 'user' ? 'user' : 'bot'}`}
              >
                {msg.sender === 'bot' && <div className="bubble-avatar">🤖</div>}
                <div className="bubble-content">{msg.text}</div>
              </div>
            ))}
            
            {loading && (
              <div className="chat-widget-bubble bot">
                <div className="bubble-avatar">🤖</div>
                <div className="bubble-content typing">
                  <span></span>
                  <span></span>
                  <span></span>
                </div>
              </div>
            )}
            
            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          <div className="chat-widget-input-area">
            <input
              type="text"
              className="chat-widget-input"
              placeholder="Type your question..."
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={handleKeyDown}
              disabled={loading}
            />
            <button
              className="chat-widget-send-btn"
              onClick={handleSend}
              disabled={loading || !message.trim()}
            >
              <svg
                width="18"
                height="18"
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
        </>
      )}
    </div>
  );
};

export default ChatWidget;