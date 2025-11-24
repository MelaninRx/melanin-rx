import React from 'react';
import { IonButton, IonIcon } from '@ionic/react';
import menuIcon from '../icons/menu.svg';
import homeIcon from '../icons/house.svg';
import addIcon from '../icons/Vector.svg';
import chatbotIcon from '../icons/message-square.svg';
import communityIcon from '../icons/users.svg';
import timelineIcon from '../icons/calendar-days.svg';
import AppointmentIcon from '../icons/Frame 112.svg';
import settingsIcon from '../icons/settings.svg';
import './SidebarNav.css';

const SidebarNav: React.FC = () => (
  <aside className="side-panel">
    <div className="nav-top">
      <IonButton fill="clear">
        <IonIcon icon={menuIcon} />
        <span className="menu-text">Menu</span>
      </IonButton>
      <IonButton fill="clear" routerLink="/home">
        <IonIcon icon={homeIcon} />
        <span className="menu-text">Home</span>
      </IonButton>
      <IonButton fill="clear" routerLink="/add">
        <IonIcon icon={addIcon} />
        <span className="menu-text">New Chat</span>
      </IonButton>
      <IonButton fill="clear" routerLink="/chatbot">
        <IonIcon icon={chatbotIcon} />
        <span className="menu-text">Chats</span>
      </IonButton>
      <IonButton fill="clear" routerLink="/community">
        <IonIcon icon={communityIcon} />
        <span className="menu-text">Communities</span>
      </IonButton>
      <IonButton fill="clear" routerLink="/timeline">
        <IonIcon icon={timelineIcon} />
        <span className="menu-text">Timeline</span>
      </IonButton>
      <IonButton fill="clear" routerLink="/appointments">
        <IonIcon icon={AppointmentIcon} />
        <span className="menu-text">Appointments</span>
      </IonButton>
    </div>
    <div className="nav-bottom">
      <IonButton fill="clear" routerLink="/settings">
        <IonIcon icon={settingsIcon} />
        <span className="menu-text">Settings</span>
      </IonButton>
    </div>
  </aside>
);

export default SidebarNav;