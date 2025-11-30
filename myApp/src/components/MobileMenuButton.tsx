import React, { useState, useEffect } from 'react';

// Import your icons here
import homeIcon from '../icons/house.svg';
import communityIcon from '../icons/users.svg';
import appointmentIcon from '../icons/clipboard-clock.svg';
import timelineIcon from "../icons/calendar-heart.svg";
import resourceIcon from '../icons/book-text.svg';
import chatbotIcon from '../icons/message-square.svg';
import settingsIcon from '../icons/settings.svg';

const MobileMenuButton: React.FC = () => {
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth <= 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!isMobile) return null;

  return (
    <nav className="bottom-nav" style={{
      position: 'fixed',
      left: 0,
      right: 0,
      bottom: 0,
      height: '60px',
      background: '#fff',
      boxShadow: '0 -2px 12px rgba(0,0,0,0.10)',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      zIndex: 1002
    }}>
      
      <a href="/timeline" className="nav-btn" aria-label="Timeline">
        <img src={timelineIcon} alt="Timeline" style={{ width: 28, height: 28 }} />
      </a>
      <a href="/appointments" className="nav-btn" aria-label="Appointments">
        <img src={appointmentIcon} alt="Appointments" style={{ width: 28, height: 28 }} />
      </a>
      <a href="/chatbot" className="nav-btn" aria-label="Chatbot">
        <img src={chatbotIcon} alt="Chatbot" style={{ width: 28, height: 28 }} />
      </a>
      <a href="/home" className="nav-btn" aria-label="Home">
        <img src={homeIcon} alt="Home" style={{ width: 28, height: 28 }} />
      </a>
      <a href="/resources" className="nav-btn" aria-label="Resources">
        <img src={resourceIcon} alt="Resources" style={{ width: 28, height: 28 }} />
      </a>
      <a href="/community" className="nav-btn" aria-label="Community">
        <img src={communityIcon} alt="Community" style={{ width: 28, height: 28 }} />
      </a>
      <a href="/profile" className="nav-btn" aria-label="Profile">
        <img src={settingsIcon} alt="Profile" style={{ width: 28, height: 28 }} />
      </a>
    </nav>
  );
};

export default MobileMenuButton;