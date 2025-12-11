import React, { useRef } from 'react';
import {
  IonPage,
  IonHeader,
  IonToolbar,
  IonButtons,
  IonButton,
  IonContent,
} from '@ionic/react';
import logoIcon from '../icons/MelaninRX.svg';

import './Landing.css';

const Landing: React.FC = () => {
  const contentRef = useRef<HTMLIonContentElement>(null);

  const scrollToTop = () => {
    contentRef.current?.scrollToTop(500);
  };

  const scrollToFeatures = () => {
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth' });
  };

  const scrollToAbout = () => {
    document.getElementById('about')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <IonPage>
      <IonHeader className="landing-header">
        <IonToolbar className="landing-toolbar">
          <div className="header-container">
            <img src={logoIcon} alt="MelaninRX" className="header-logo" />
            
            <div className="header-content">
              <div className="menu">
                <button className="menu-item" onClick={scrollToFeatures}>
                  Features
                </button>
              </div>

              <div className="buttons-group">
                <button className="login-btn" onClick={() => window.location.href = '/auth'}>
                  Log In
                </button>
                <button className="signup-btn" onClick={() => window.location.href = '/onboarding'}>
                  Sign Up Free
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M15.586 10.6569L11.636 6.70692C11.4538 6.51832 11.353 6.26571 11.3553 6.00352C11.3576 5.74132 11.4628 5.49051 11.6482 5.3051C11.8336 5.11969 12.0844 5.01452 12.3466 5.01224C12.6088 5.00997 12.8614 5.11076 13.05 5.29292L18.707 10.9499C18.8002 11.0426 18.8741 11.1527 18.9246 11.2741C18.9751 11.3954 19.001 11.5255 19.001 11.6569C19.001 11.7883 18.9751 11.9184 18.9246 12.0398C18.8741 12.1611 18.8002 12.2713 18.707 12.3639L13.05 18.0209C12.9578 18.1164 12.8474 18.1926 12.7254 18.245C12.6034 18.2974 12.4722 18.325 12.3394 18.3262C12.2066 18.3273 12.0749 18.302 11.952 18.2517C11.8291 18.2015 11.7175 18.1272 11.6236 18.0333C11.5297 17.9394 11.4555 17.8278 11.4052 17.7049C11.3549 17.582 11.3296 17.4503 11.3307 17.3175C11.3319 17.1847 11.3595 17.0535 11.4119 16.9315C11.4643 16.8095 11.5405 16.6992 11.636 16.6069L15.586 12.6569H6C5.73478 12.6569 5.48043 12.5516 5.29289 12.364C5.10536 12.1765 5 11.9221 5 11.6569C5 11.3917 5.10536 11.1373 5.29289 10.9498C5.48043 10.7623 5.73478 10.6569 6 10.6569H15.586Z" fill="white"/>
                  </svg>
                </button>
              </div>
            </div>
          </div>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen ref={contentRef}>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title">
              So You Don't Have to Translate Your Pregnancy Experience
            </h1>
            <p className="hero-subtitle">
              MelaninRx, helping Black women communicate clearly with providers, grounded in trusted research.
            </p>
            <div className="hero-buttons">
              <button className="btn-get-started" onClick={() => window.location.href = '/auth'}>
                Get Started
              </button>
              <button className="btn-explore-features" onClick={scrollToFeatures}>
                Explore Features
              </button>
            </div>
          </div>

          <div className="hero-laptop">
            <div className="laptop-container">
              <div className="laptop-screen">
                <img src="https://api.builder.io/api/v1/image/assets/TEMP/e573a646d0a45bdda778a124c0a0720e4f7761a7?width=1108" alt="MelaninRX Chatbot" className="laptop-image" />
              </div>
              <div className="laptop-base"></div>
              <img src="/image.png" alt="App Preview" className="side-image" />
            </div>
          </div>
        </section>

        {/* Statistics Section */}
        <section id="about" className="stats-section">
          <h2 className="stats-title">
            The Reality Black Women<br />
            Face in Healthcare
          </h2>

          <div className="stats-cards">
            <div className="stat-card">
              <div className="stat-number gradient-text">3x</div>
              <p className="stat-description">
                "Black women are <strong>3x more likely to die</strong> from pregnancy-related causes."
              </p>
            </div>

            <div className="stat-card">
              <div className="stat-chart">
                <svg width="248" height="248" viewBox="0 0 248 248" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M247.084 124C247.084 192.483 191.772 248 123.542 248C55.3116 248 0 192.483 0 124C0 55.5167 55.3116 0 123.542 0C191.772 0 247.084 55.5167 247.084 124ZM37.0626 124C37.0626 171.938 75.7807 210.8 123.542 210.8C171.303 210.8 210.021 171.938 210.021 124C210.021 76.0617 171.303 37.2 123.542 37.2C75.7807 37.2 37.0626 76.0617 37.0626 124Z" fill="#F0CDE7"/>
                  <path d="M62.4734 16.2089C85.7294 2.93546 112.65 -2.4022 139.187 0.998349C165.725 4.3989 190.446 16.3539 209.633 35.0661C228.821 53.7782 241.438 78.2363 245.588 104.763C249.739 131.291 245.198 158.453 232.648 182.168C220.098 205.882 200.218 224.867 175.996 236.268C151.775 247.669 124.52 250.87 98.3299 245.39C72.14 239.91 48.4299 226.046 30.7643 205.88C13.0986 185.715 2.43207 160.338 0.36818 133.566L37.3203 130.696C38.765 149.437 46.2316 167.2 58.5976 181.316C70.9635 195.432 87.5606 205.137 105.894 208.973C124.227 212.809 143.305 210.568 160.26 202.588C177.215 194.607 191.131 181.317 199.916 164.717C208.701 148.117 211.88 129.103 208.974 110.534C206.069 91.9654 197.237 74.8448 183.806 61.7462C170.375 48.6477 153.07 40.2792 134.494 37.8988C115.917 35.5185 97.0731 39.2548 80.794 48.5462L62.4734 16.2089Z" fill="white"/>
                  <path d="M62.4734 16.2089C85.7294 2.93546 112.65 -2.4022 139.187 0.998349C165.725 4.3989 190.446 16.3539 209.633 35.0661C228.821 53.7782 241.438 78.2363 245.588 104.763C249.739 131.291 245.198 158.453 232.648 182.168C220.098 205.882 200.218 224.867 175.996 236.268C151.775 247.669 124.52 250.87 98.3299 245.39C72.14 239.91 48.4299 226.046 30.7643 205.88C13.0986 185.715 2.43207 160.338 0.36818 133.566L37.3203 130.696C38.765 149.437 46.2316 167.2 58.5976 181.316C70.9635 195.432 87.5606 205.137 105.894 208.973C124.227 212.809 143.305 210.568 160.26 202.588C177.215 194.607 191.131 181.317 199.916 164.717C208.701 148.117 211.88 129.103 208.974 110.534C206.069 91.9654 197.237 74.8448 183.806 61.7462C170.375 48.6477 153.07 40.2792 134.494 37.8988C115.917 35.5185 97.0731 39.2548 80.794 48.5462L62.4734 16.2089Z" fill="#4B0F3C"/>
                  <text fill="url(#paint0_linear)" xmlSpace="preserve" style={{ whiteSpace: 'pre' }} fontFamily="Plus Jakarta Sans" fontSize="42" fontWeight="bold" letterSpacing="-0.01em">
                    <tspan x="73.2214" y="133.584">80%</tspan>
                  </text>
                  <defs>
                    <linearGradient id="paint0_linear" x1="122.902" y1="89.9482" x2="122.902" y2="158.052" gradientUnits="userSpaceOnUse">
                      <stop stopColor="#642D56"/>
                      <stop offset="1" stopColor="#CA5BAE"/>
                    </linearGradient>
                  </defs>
                </svg>
              </div>
              <p className="stat-description">
                "More than <strong>80%</strong> of pregnancy-related deaths are preventable."
              </p>
            </div>
          </div>

          <p className="mission-text">
            MelaninRX was created to close these gaps through clarity, knowledge, and consistent support rooted in research.
          </p>
        </section>

        {/* Features Section */}
        <section id="features" className="features-section">
          <h2 className="section-title">Everything You Need, All in One Place</h2>
        </section>

        {/* Features with Continuous Gradient Bar */}
        <div className="features-with-bar">
          <div className="vertical-gradient-bar"></div>

          <div className="feature-grid">
            {/* AI Chatbot */}
            <div className="feature-item">
              <div className="feature-badge">AI Chatbot</div>
              <h3 className="feature-title">Your Voice, Amplified.</h3>
              <p className="feature-description">
                A trained AI assistant grounded in Black maternal health research helping you prepare for doctor visits and communicate your symptoms clearly.
              </p>
            </div>

            <div className="feature-image">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/e573a646d0a45bdda778a124c0a0720e4f7761a7?width=1108" alt="AI Chatbot Feature" />
            </div>

            {/* Pregnancy Timeline */}
            <div className="feature-image">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/05c80ae9c5165bb70429924ac635f05a12ba0375?width=1134" alt="Pregnancy Timeline Feature" />
            </div>

            <div className="feature-item">
              <div className="feature-badge">Pregnancy Timeline</div>
              <h3 className="feature-title">Guidance for Every Stage.</h3>
              <p className="feature-description">
                clear trimester-by-trimester timeline with progress tracking, personalized to-do lists, and guided questions you can bring to your providers.
              </p>
            </div>
          </div>

          {/* Secondary Features Grid */}
          <div className="secondary-feature-grid">
            {/* Appointment Planner */}
            <div className="secondary-feature-item">
              <div className="feature-badge">Appointment Planner</div>
              <h3 className="feature-title">Walk In Prepared.</h3>
              <p className="feature-description">
                Track every appointment in one place. Add questions, notes, and concerns ahead of time so you walk in prepared and walk out feeling heard.
              </p>
            </div>

            <div className="secondary-feature-image">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/bdb989cf4eaea9c165dc41b276a47dc6d42d2a30?width=1152" alt="Appointment Planner" />
            </div>

            {/* Culturally Relevant Resources */}
            <div className="secondary-feature-image">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/0dbf3ca72f6560e8d9d3db711e5ad7af706f86a4?width=1042" alt="Culturally Relevant Resources" />
            </div>

            <div className="secondary-feature-item">
              <div className="feature-badge">Culturally Relevant Resources</div>
              <h3 className="feature-title">Information You Can Trust.</h3>
              <p className="feature-description">
                A curated library of evidence-based articles, doula directories, mental health resources, and tools created specifically for Black women's maternal health.
              </p>
            </div>

            {/* Community Spaces */}
            <div className="secondary-feature-item">
              <div className="feature-badge">Community Spaces</div>
              <h3 className="feature-title">Support, Rooted in Sisterhood.</h3>
              <p className="feature-description">
                Connect with other Black women through welcoming groups based on interests, trimester, or location—built for sharing stories, advice, and solidarity.
              </p>
            </div>

            <div className="secondary-feature-image">
              <img src="https://api.builder.io/api/v1/image/assets/TEMP/e2af74569256532fe5bbbb3259ebaf63f87441dd?width=1120" alt="Community Spaces" />
            </div>
          </div>
        </div>

        {/* Back to Top */}
        <section className="back-to-top-section">
          <button className="btn-back-to-top" onClick={scrollToTop}>
            Back to the Top
          </button>
        </section>
      </IonContent>
    </IonPage>
  );
};

export default Landing;
