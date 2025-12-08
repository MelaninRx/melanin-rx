import React, { useState, useEffect, useRef, useCallback } from 'react';
import { sendMessageToChatbot } from '../services/chatbotService';
import { useChat } from '../context/ChatContext';
import { useCurrentUser } from '../hooks/useCurrentUser';
import './ChatWidget.css';

interface ChatWidgetProps {
  isOpen: boolean;
  onClose: () => void;
  initialQuestion?: string;
}

const ChatWidget: React.FC<ChatWidgetProps> = ({ isOpen, onClose, initialQuestion }) => {
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const processedInitialQuestionRef = useRef<string | null>(null);
  
  // Use ChatContext for persistent conversations
  const {
    chatHistory,
    setChatHistory,
    currentConversationId,
    saveOrUpdateConversation,
    handleNewChat,
  } = useChat();
  
  const user = useCurrentUser();
  
  // Local ref to track if we're starting a fresh conversation
  const isNewConversationRef = useRef(false);

  const handleSendWithText = useCallback(async (text: string) => {
    if (!text.trim()) return;

    // Prevent duplicate messages (unless it's a new conversation)
    if (!isNewConversationRef.current) {
      const lastMessage = chatHistory[chatHistory.length - 1];
      if (lastMessage?.sender === 'user' && lastMessage?.text === text) {
        return;
      }
    }

    const newUserMsg = { 
      sender: 'user', 
      text,
    };
    // If starting a new conversation, start fresh; otherwise append
    const updatedHistory = isNewConversationRef.current ? [newUserMsg] : [...chatHistory, newUserMsg];
    isNewConversationRef.current = false; // Reset flag after using it
    setChatHistory(updatedHistory);
    setLoading(true);

    try {
      // Get user info for chatbot service
      const userName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'Guest';
      const userId = user?.uid || 'anon';
      
      const botReply = await sendMessageToChatbot({ 
        message: text,
        userName,
        userId,
        includeHistory: true,
      });
      
      const botMsg = { 
        sender: 'bot', 
        text: botReply,
      };
      
      const finalHistory = [...updatedHistory, botMsg];
      setChatHistory(finalHistory);
      
      // Save conversation to Firestore
      await saveOrUpdateConversation(finalHistory);
    } catch (error) {
      const errorMessage = error instanceof Error 
        ? error.message 
        : "Error connecting to chatbot.";
      const errorMsg = { 
        sender: 'bot', 
        text: `Error: ${errorMessage}`,
      };
      const errorHistory = [...updatedHistory, errorMsg];
      setChatHistory(errorHistory);
      
      // Save error state too (so user can see the error later)
      await saveOrUpdateConversation(errorHistory);
    }

    setMessage('');
    setLoading(false);
  }, [chatHistory, setChatHistory, saveOrUpdateConversation, user]);

  // Auto-send initial question when widget opens with a new question
  useEffect(() => {
    if (!isOpen) {
      processedInitialQuestionRef.current = null;
      return;
    }
    
    // Start a new conversation when initialQuestion is provided and it's different from what we've processed
    if (initialQuestion && processedInitialQuestionRef.current !== initialQuestion) {
      processedInitialQuestionRef.current = initialQuestion;
      isNewConversationRef.current = true;
      
      // Reset conversation first (clears history and resets ID)
      handleNewChat();
      
      // Then immediately set the user message so it's visible
      const userMsg = { sender: 'user', text: initialQuestion };
      setChatHistory([userMsg]);
      setLoading(true);
      
      // Get bot response
      (async () => {
        try {
          const userName = user?.displayName || user?.name || user?.email?.split('@')[0] || 'Guest';
          const userId = user?.uid || 'anon';
          
          const botReply = await sendMessageToChatbot({ 
            message: initialQuestion,
            userName,
            userId,
            includeHistory: false, // New conversation, no history
          });
          
          const botMsg = { sender: 'bot', text: botReply };
          const finalHistory = [userMsg, botMsg];
          setChatHistory(finalHistory);
          await saveOrUpdateConversation(finalHistory);
        } catch (error) {
          const errorMsg = { 
            sender: 'bot', 
            text: error instanceof Error ? error.message : "Error connecting to chatbot.",
          };
          const errorHistory = [userMsg, errorMsg];
          setChatHistory(errorHistory);
          await saveOrUpdateConversation(errorHistory);
        } finally {
          setLoading(false);
        }
      })();
    }
  }, [isOpen, initialQuestion, handleNewChat, setChatHistory, saveOrUpdateConversation, user]);

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // Reset UI state when closed (but keep conversation saved)
  useEffect(() => {
    if (!isOpen) {
      setMessage('');
      setIsMinimized(false);
      processedInitialQuestionRef.current = null;
    }
  }, [isOpen]);

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