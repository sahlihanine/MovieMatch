import { Redirect, Route } from "react-router-dom";
import {
  IonApp, IonIcon, IonLabel, IonRouterOutlet,
  IonTabBar, IonTabButton, IonTabs, setupIonicReact,
} from "@ionic/react";
import { IonReactRouter } from "@ionic/react-router";
import { homeOutline, listOutline, heartOutline, personOutline } from "ionicons/icons";

/* CSS Ionic obligatoires */
import "@ionic/react/css/core.css";
import "@ionic/react/css/normalize.css";
import "@ionic/react/css/structure.css";
import "@ionic/react/css/typography.css";
import "@ionic/react/css/padding.css";
import "@ionic/react/css/flex-utils.css";
import "@ionic/react/css/display.css";
import "./theme/variables.css";
import "./theme/global.css";

import ProtectedRoute from "./components/ProtectedRoute";

import Splash from "./pages/Splash/Splash";
import Onboarding from "./pages/Onboarding/Onboarding";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import ProfilePhoto from "./pages/ProfilePhoto/ProfilePhoto";
import Home from "./pages/Home/Home";
import MovieDetails from "./pages/MovieDetails/MovieDetails";
import Playlist from "./pages/Playlist/Playlist";
import Match from "./pages/Match/Match";
import MatchResults from "./pages/MatchResults/MatchResults";
import Profile from "./pages/Profile/Profile";
import AdminUsers from "./pages/admin/AdminUsers";
import AdminAddMovie from "./pages/admin/AdminAddMovie";

setupIonicReact();

/* Layout avec barre d'onglets (Home, My List, Match, Profile) */
const TabsLayout = () => (
  <IonTabs>
    <IonRouterOutlet>
      <Route exact path="/app/home" component={Home} />
      <Route exact path="/app/playlist" component={Playlist} />
      <Route exact path="/app/match" component={MatchResults} />
      <Route exact path="/app/match/:uid" component={Match} />
      <Route exact path="/app/profile" component={Profile} />
      <Route exact path="/app" render={() => <Redirect to="/app/home" />} />
    </IonRouterOutlet>

    <IonTabBar slot="bottom">
      <IonTabButton tab="home" href="/app/home">
        <IonIcon icon={homeOutline} />
        <IonLabel>Home</IonLabel>
      </IonTabButton>
      <IonTabButton tab="playlist" href="/app/playlist">
        <IonIcon icon={listOutline} />
        <IonLabel>My List</IonLabel>
      </IonTabButton>
      <IonTabButton tab="match" href="/app/match">
        <IonIcon icon={heartOutline} />
        <IonLabel>Match</IonLabel>
      </IonTabButton>
      <IonTabButton tab="profile" href="/app/profile">
        <IonIcon icon={personOutline} />
        <IonLabel>Profile</IonLabel>
      </IonTabButton>
    </IonTabBar>
  </IonTabs>
);

const App = () => (
  <IonApp>
    <IonReactRouter>
      <IonRouterOutlet>
        {/* Publiques */}
        <Route exact path="/splash" component={Splash} />
        <Route exact path="/onboarding" component={Onboarding} />
        <Route exact path="/login" component={Login} />
        <Route exact path="/register" component={Register} />

        {/* Protégées (utilisateur connecté) */}
        <Route exact path="/profile-photo" render={() => (
          <ProtectedRoute><ProfilePhoto /></ProtectedRoute>
        )} />
        <Route exact path="/movie/:id" render={() => (
          <ProtectedRoute><MovieDetails /></ProtectedRoute>
        )} />
        <Route path="/app" render={() => (
          <ProtectedRoute><TabsLayout /></ProtectedRoute>
        )} />

        {/* Admin uniquement */}
        <Route exact path="/admin/users" render={() => (
          <ProtectedRoute adminOnly><AdminUsers /></ProtectedRoute>
        )} />
        <Route exact path="/admin/add-movie" render={() => (
          <ProtectedRoute adminOnly><AdminAddMovie /></ProtectedRoute>
        )} />

        <Route exact path="/" render={() => <Redirect to="/splash" />} />
      </IonRouterOutlet>
    </IonReactRouter>
  </IonApp>
);

export default App;