import React, { useState } from 'react';
import { Link, useHistory } from 'react-router-dom';
import './SidebarNav.css';
import { useChat } from "../context/ChatContext";

import MelaninRxIcon from '../icons/MelaninRX.svg';
import menuIcon from '../icons/menu.svg';
import addIcon from '../icons/Vector.svg';
import homeIcon from '../icons/house.svg';
import communityIcon from '../icons/users.svg';
import appointmentIcon from '../icons/clipboard-clock.svg';
import timelineIcon from "../icons/calendar-heart.svg";
import resourceIcon from '../icons/book-text.svg';
import chatbotIcon from '../icons/message-square.svg';
import LogoutIcon from "../icons/log-out.svg";
import settingsIcon from '../icons/settings.svg';
import dropdownIcon from "../icons/Group.svg";


interface SidebarNavProps {
  onToggle?: (expanded: boolean) => void; // 新增：父组件回调
}

const SidebarNav: React.FC<SidebarNavProps> = ({ onToggle }) => {
  const {
    savedConversations,
    handleLoadConversation,
    currentConversationId,
    handleNewChat,
  } = useChat();
  const history = useHistory();

  const [showChatsDropdown, setShowChatsDropdown] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // =====================================
  // Chat 功能逻辑（保持原样）
  // =====================================
  const handleNewChatClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChatsDropdown(false);
    handleNewChat();
    history.push('/chatbot');
  };

  const handleLoadConversationClick = (chat: any) => {
    console.log('[SidebarNav] handleLoadConversationClick chat:', chat);
    console.log('[SidebarNav] chat.id:', chat.id);
    console.log('[SidebarNav] chat.messages:', chat.messages);
    handleLoadConversation(chat);
    setShowChatsDropdown(false);
    history.push('/chatbot');
  };

  // =====================================
  // 新增：sidebar 展开/收缩控制
  // =====================================
  const handleMouseEnter = () => {
    console.log('Sidebar mouse enter');
    setIsSidebarCollapsed(false);
    onToggle?.(true); // 🔥 通知父组件展开
  };

  const handleMouseLeave = () => {
    console.log('Sidebar mouse leave');
    setIsSidebarCollapsed(true);
    onToggle?.(false); // 🔥 通知父组件收缩
  };
  

  return (
    <aside
      className={`side-panel${isSidebarCollapsed ? ' collapsed' : ''}`}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
    >
      
      {/* Make sure your CSS sets a smaller width for .side-panel.collapsed */}
      <div className="nav-top">

        <Link to="/home" className="menu-button logo-button">
          <img src={MelaninRxIcon} className="logo-icon" alt="Logo" />
          <img src={menuIcon} className="icon" alt="Menu" />
        </Link>


        <Link to="/chatbot" className="menu-button" onClick={handleNewChatClick}>
          <img src={addIcon} className="icon" alt="New chat" />
          <span className="menu-text">New chat</span>
        </Link>

        <Link to="/home" className="menu-button">
          <img src={homeIcon} className="icon" alt="Home" />
          <span className="menu-text">Home</span>
        </Link>

        <Link to="/community" className="menu-button">
          <img src={communityIcon} className="icon" alt="Communities" />
          <span className="menu-text">Communities</span>
        </Link>

        <Link to="/appointments" className="menu-button">
          <img src={appointmentIcon} className="icon" alt="Appointments" />
          <span className="menu-text">Appointments</span>
        </Link>

        <Link to="/timeline" className="menu-button">
          <img src={timelineIcon} className="icon" alt="Timeline" />
          <span className="menu-text">Timeline</span>
        </Link>

        <Link to="/resources" className="menu-button">
          <img src={resourceIcon} className="icon" alt="Resources" />
          <span className="menu-text">Resources</span>
        </Link>

        <div className="menu-button chats-row">
          <Link to="/chat" className="chats-link">
            <img src={chatbotIcon} className="icon" alt="Chats" />
            <span className="menu-text">Chats</span>
          </Link>

          <img
            src={dropdownIcon}
            className="dropdown-trigger"
            alt="Toggle history"
            onClick={(e) => {
              e.stopPropagation(); 
              setShowChatsDropdown(prev => !prev);
            }}
          />
        </div>

        {showChatsDropdown && (
          <div className="dropdown-menu" style={{ maxHeight: '220px', overflowY: 'auto' }}>
            {savedConversations.length === 0 ? (
              <div className="dropdown-item">No chat history</div>
            ) : (
              savedConversations.map(chat => (
                <button
                  key={chat.id}
                  className={`dropdown-item${currentConversationId === chat.id ? ' active' : ''}`}
                  style={{
                    display: 'block',
                    width: '100%',
                    whiteSpace: 'normal',
                    wordBreak: 'break-word',
                    textAlign: 'left',
                    padding: '8px 12px',
                    fontSize: '1rem',
                    background: currentConversationId === chat.id ? '#f3e8ff' : 'transparent',
                    border: 'none',
                    borderRadius: '6px',
                    cursor: 'pointer',
                    marginBottom: '2px',
                    transition: 'background 0.2s'
                  }}
                  onClick={() => handleLoadConversationClick(chat)}
                >
                  {chat.messages?.[0]?.text || 'Untitled Chat'}
                </button>
              ))
            )}
          </div>
        )}

      </div>

      <div className="nav-bottom">

        {/* Settings */}
        <Link to="/settings" className="menu-button">
          <img src={settingsIcon} className="icon" alt="Settings" />
          <span className="menu-text">Settings</span>
        </Link>
      </div>
    </aside>
  );
};

export default SidebarNav;
