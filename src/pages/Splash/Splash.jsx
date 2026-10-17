import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import { IonContent, IonPage, IonProgressBar } from "@ionic/react";
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
      <IonContent fullscreen style={{ "--background": "#060b13" }}>
        <div style={{
          height: "100%", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", textAlign: "center",
        }}>
          <img
            src="/logo.png"
            alt="MovieMatch"
            style={{ width: 168, height: 168, borderRadius: 38, boxShadow: "0 16px 48px rgba(0,0,0,0.5)" }}
          />
          <p style={{ margin: "20px 0 0", color: "rgba(255,255,255,0.75)", fontSize: 14 }}>
            Movies bring people together
          </p>
          <IonProgressBar
            type="indeterminate"
            color="tertiary"
            style={{ width: 140, marginTop: 40 }}
          />
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Splash;