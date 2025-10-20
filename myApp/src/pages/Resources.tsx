import React from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
  IonImg,
} from '@ionic/react';
import './Resources.css';

const Resources: React.FC = () => {
  return (
    <IonPage>
      {/* Header to match your Landing style */}
      <IonHeader className="resources-header">
            <IonToolbar className="resources-toolbar">
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

      <IonContent fullscreen className="resources-content">
        <div className="resources-header-section">
            <h1 className="resources-title">Resources</h1>
        </div>

        <div className="resources-container">
            {/* --- Doulas Section --- */}
            <div className="resource-section">
            <h2 className="section-heading">Doulas</h2>
            <div className="card-grid">
                <div className="resource-card">
                <h3>Roots Midwifery</h3>
                <p>Find a certified doula in the Boston area.</p>
                <a
                    href="https://rootsmidwiferyma.com/find-a-doula/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit Site →
                </a>
                </div>

                <div className="resource-card">
                <h3>The Black Doula Directory</h3>
                <p>Discover Black doulas and birth workers across the U.S.</p>
                <a
                    href="https://www.blackdoulas.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit Site →
                </a>
                </div>
            </div>
            </div>

            {/* --- Providers Section --- */}
            <div className="resource-section">
            <h2 className="section-heading">Finding Providers</h2>
            <div className="card-grid">
                <div className="resource-card">
                <h3>Diva Docs</h3>
                <p>An organization composed of over 250 Black women physicians and trainees (medical students, residents, and fellows) working, studying or living in Greater Boston.</p>
                <a
                    href="https://www.divadocsboston.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit Site →
                </a>
                </div>

                <div className="resource-card">
                <h3>Irth</h3>
                <p>Find prenatal, birthing, postpartum and pediatric reviews of care from other Black and brown women.</p>
                <a
                    href="https://irthapp.com/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit Site →
                </a>
                </div>
            </div>
            </div>


            <div className="resource-section">
            <h2 className="section-heading">Know Your Rights</h2>
            <div className="card-grid">
                <div className="resource-card">
                <h3>In Our Own Voice: National Black Women’s Reproductive Justice Agenda</h3>
                <p>A national-state partnership that amplifies and lifts the voices of Black women leaders to secure sexual and reproductive justice for Black women, girls, and gender-expansive people.</p>
                <a
                    href="https://blackrj.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit Site →
                </a>
                </div>

                <div className="resource-card">
                <h3>Black Women's Health Imperative</h3>
                <p>A nonprofit organization created by Black women to help protect and advance the health and wellness of Black women and girls.</p>
                <a
                    href="https://bwhi.org/"
                    target="_blank"
                    rel="noopener noreferrer"
                >
                    Visit Site →
                </a>
                </div>
            </div>
            </div>
        </div>
        </IonContent>
    </IonPage>
  );
};

export default Resources;
