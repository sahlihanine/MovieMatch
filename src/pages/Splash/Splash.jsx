import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonIcon, IonPage, IonProgressBar } from "@ionic/react";
import { filmOutline } from "ionicons/icons";
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "../../hooks/useAuth";
import { ROLES, STORAGE_KEYS } from "../../utils/constants";

const Splash = () => {
  const history = useHistory();
  const { user, profile, loading } = useAuth();
  const [minTimePassed, setMinTimePassed] = useState(false);

  // durée minimale d'affichage du splash
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), 2200);
    return () => clearTimeout(t);
  }, []);

  // redirection : admin → espace admin, utilisateur → home, sinon onboarding (1re fois) ou login
  useEffect(() => {
    if (!minTimePassed || loading) return;
    (async () => {
      if (user) {
        history.replace(profile?.role === ROLES.ADMIN ? "/admin/users" : "/app/home");
        return;
      }
      const { value } = await Preferences.get({ key: STORAGE_KEYS.ONBOARDING_SEEN });
      history.replace(value === "true" ? "/login" : "/onboarding");
    })();
  }, [minTimePassed, loading, user, profile, history]);

  return (
    <IonPage>
      <IonContent
        fullscreen
        style={{ "--background": "linear-gradient(180deg,#8b5a44,#3b2a22)" }}
      >
        <div style={{
          height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", color: "#fff", textAlign: "center",
        }}>
          <IonIcon icon={filmOutline} style={{ fontSize: 72, color: "#f97316" }} />
          <h1 style={{ margin: "12px 0 4px" }}>MovieMatch</h1>
          <p style={{ margin: 0, opacity: 0.85 }}>Movies bring people together</p>
          <IonProgressBar
            type="indeterminate"
            color="tertiary"
            style={{ width: 140, marginTop: 48 }}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Splash;