import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonIcon, IonPage, IonProgressBar } from "@ionic/react";
import { filmOutline } from "ionicons/icons";
import { Preferences } from "@capacitor/preferences";
import { useAuth } from "../../hooks/useAuth";
import { STORAGE_KEYS } from "../../utils/constants";

const Splash = () => {
  const history = useHistory();
  const { user, loading } = useAuth();
  const [minTimePassed, setMinTimePassed] = useState(false);

  // durée minimale d'affichage du splash
  useEffect(() => {
    const t = setTimeout(() => setMinTimePassed(true), 2200);
    return () => clearTimeout(t);
  }, []);

  // redirection : connecté → home, sinon onboarding (1re fois) ou login
  useEffect(() => {
    if (!minTimePassed || loading) return;
    (async () => {
      const { value } = await Preferences.get({ key: STORAGE_KEYS.ONBOARDING_SEEN });
      if (user) history.replace("/app/home");
      else if (value === "true") history.replace("/login");
      else history.replace("/onboarding");
    })();
  }, [minTimePassed, loading, user, history]);

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