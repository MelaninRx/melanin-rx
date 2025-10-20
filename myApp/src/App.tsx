import { Redirect, Route } from 'react-router-dom';
import { IonApp, IonRouterOutlet, setupIonicReact } from '@ionic/react';
import { IonReactRouter } from '@ionic/react-router';
import {useCurrentUser} from './hooks/useCurrentUser';
import Home from './pages/Home';
import Auth from './pages/Auth';
import Map from './pages/Map';
import Chatbot from './pages/Chatbot';
<<<<<<< HEAD
import Resources from './pages/Resources';
import Explore from './pages/Explore';
import TimelinePage from './pages/TimelinePage';
import Auth from './pages/Auth';

=======
import TimelinePage from './pages/TimelinePage';
import { useCurrentUser } from "./hooks/useCurrentUser";
>>>>>>> origin/dev

/* Core CSS required for Ionic components to work properly */
import '@ionic/react/css/core.css';

/* Basic CSS for apps built with Ionic */
import '@ionic/react/css/normalize.css';
import '@ionic/react/css/structure.css';
import '@ionic/react/css/typography.css';

/* Optional CSS utils that can be commented out */
import '@ionic/react/css/padding.css';
import '@ionic/react/css/float-elements.css';
import '@ionic/react/css/text-alignment.css';
import '@ionic/react/css/text-transformation.css';
import '@ionic/react/css/flex-utils.css';
import '@ionic/react/css/display.css';

/**
 * Ionic Dark Mode
 * -----------------------------------------------------
 * For more info, please see:
 * https://ionicframework.com/docs/theming/dark-mode
 */

/* import '@ionic/react/css/palettes/dark.always.css'; */
/* import '@ionic/react/css/palettes/dark.class.css'; */
import '@ionic/react/css/palettes/dark.system.css';

/* Theme variables */
import './theme/variables.css';

setupIonicReact();

<<<<<<< HEAD
const App: React.FC = () => {
  const user = useCurrentUser();
  return (

    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          {/* Public routes */}
          <Route path="/landing" component={Landing} exact />
          <Route path="/auth" component={Auth} exact />

          {/* Protected routes (require login) */}
=======

const App: React.FC = () => {
  const user = useCurrentUser();
    return (
    <IonApp>
      <IonReactRouter>
        <IonRouterOutlet>
          <Route path="/auth" component={Auth} exact />
          <Route path="/map" component={Map} exact />
          <Route path="/chatbot" component={Chatbot} exact />
          <Route path="/landing" component={Map} exact />
           <Route path="/timeline" component={TimelinePage} exact />
>>>>>>> origin/dev
          <Route
            path="/home"
            render={() => (user ? <Home /> : <Redirect to="/auth" />)}
            exact
          />
<<<<<<< HEAD
          <Route
            path="/chatbot"
            render={() => (user ? <Chatbot /> : <Redirect to="/auth" />)}
            exact
          />
          <Route
            path="/timeline"
            render={() => (user ? <TimelinePage /> : <Redirect to="/auth" />)}
            exact
          />
          <Route
            path="/resources"
            render={() => (user ? <Resources /> : <Redirect to="/auth" />)}
            exact
          />
          <Route
            path="/explore"
            render={() => (user ? <Explore /> : <Redirect to="/auth" />)}
            exact
          />

          {/* Default redirect */}
          <Redirect exact from="/" to={user ? "/home" : "/landing"} />
=======
          <Redirect exact from="/" to={user ? "/home" : "/auth"} />
>>>>>>> origin/dev
        </IonRouterOutlet>
      </IonReactRouter>
    </IonApp>
  );
<<<<<<< HEAD
};
=======
}
>>>>>>> origin/dev

export default App;
