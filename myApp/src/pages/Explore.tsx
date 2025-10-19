import React from "react";
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonImg,
} from "@ionic/react";
import "./Explore.css";

const Explore: React.FC = () => {
  const features = [
    {
      id: "resources",
      title: "Resources",
      desc: "Explore curated directories and trusted health information for doulas, providers, and more.",
      icon: "/assets/resources-icon.png",
      link: "/resources",
    },
    {
      id: "timeline",
      title: "Timeline",
      desc: "Track your care journey and milestones with a personalized health timeline.",
      icon: "/assets/timeline-icon.png",
      link: "/timeline",
    },
    {
      id: "community",
      title: "Community Channels",
      desc: "Connect with others through supportive community channels and shared experiences.",
      icon: "/assets/community-icon.png",
      link: "/community",
    },
  ];

  return (
    <IonPage>
      <IonHeader className="explore-header">
        <IonToolbar className="explore-toolbar">
          <div className="logo-section">
            <IonImg src="/assets/logo.png" alt="App Logo" className="logo" />
          </div>

          <IonButtons slot="end" className="nav-links">
            <IonButton routerLink="/home">Home</IonButton>
            <IonButton routerLink="/explore">Explore</IonButton>
            <IonButton routerLink="/login">Log in</IonButton>
            <IonButton routerLink="/signup" fill="solid" className="signup-btn">
              Signup
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent className="explore-content">
        <h1 className="explore-title">Explore</h1>

        <div className="explore-grid">
          {features.map((feature) => (
            <div
              key={feature.id}
              className="explore-card"
              onClick={() => (window.location.href = feature.link)}
            >
              <img src={feature.icon} alt={feature.title} className="card-icon" />
              <h2>{feature.title}</h2>
              <p>{feature.desc}</p>
              <IonButton
                fill="clear"
                className="learn-more-btn"
                routerLink={feature.link}
              >
                Learn More →
              </IonButton>
            </div>
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Explore;
