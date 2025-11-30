import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import './SidebarNav.css';

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

const Sidebar: React.FC = () => {
  const [showChatsDropdown, setShowChatsDropdown] = useState(false);

  const chatHistory = [
    { id: 1, title: "placeholder 1" },
    { id: 2, title: "placeholder 2" },
    { id: 3, title: "placeholder 3" }
  ];
  return (
    <aside className="side-panel">
      <div className="nav-top">

        <div className="menu-button logo-button">
          <img src={MelaninRxIcon} className="logo-icon" alt="Logo" />
          <img src={menuIcon} className="icon" alt="Menu" />
        </div>


        <Link to="/chatbot" className="menu-button">
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
          <div className="dropdown-menu">
            {chatHistory.map(chat => (
              <Link
                key={chat.id}
                to={`/chat/${chat.id}`}
                className="dropdown-item"
              >
                {chat.title}
              </Link>
            ))}
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

export default Sidebar;
