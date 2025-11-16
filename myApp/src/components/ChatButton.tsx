import React from 'react';
import './ChatButton.css';

interface ChatButtonProps {
  onClick: () => void;
  hasUnread?: boolean;
}

const ChatButton: React.FC<ChatButtonProps> = ({ onClick, hasUnread = false }) => {
  return (
    <button className="chat-button" onClick={onClick} aria-label="Open chat">
      <div className="chat-button-icon">💬</div>
      {hasUnread && <span className="chat-button-badge"></span>}
    </button>
  );
};

export default ChatButton;