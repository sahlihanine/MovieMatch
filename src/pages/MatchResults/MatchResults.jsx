import { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonContent, IonHeader, IonList, IonPage, IonRefresher, IonRefresherContent,
  IonSpinner, IonTitle, IonToolbar, useIonViewWillEnter,
} from "@ionic/react";
import MatchUserItem from "../../components/MatchUserItem";
import { useAuth } from "../../hooks/useAuth";
import { findMatches } from "../../services/matchService";
import { canMatch } from "../../utils/matchAlgorithm";
import { MATCH_THRESHOLD, MIN_FAVORITES_FOR_MATCH } from "../../utils/constants";

const MatchResults = () => {
  const history = useHistory();
  const { user, profile } = useAuth();

  const myFavorites = profile?.favoriteMovieIds ?? [];
  const favKey = myFavorites.join(",");

  const [matches, setMatches] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    if (!user || !profile) return;
    setLoading(true);
    setError(null);
    try {
      setMatches(await findMatches(user.uid, myFavorites));
    } catch {
      setError("Unable to load matches. Check your connection.");
    } finally {
      setLoading(false);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, favKey]);

  // recalcul à chaque retour sur l'onglet (cycle de vie Ionic)
  useIonViewWillEnter(() => { load(); }, [load]);

  const enough = canMatch(myFavorites);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>People with similar taste</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <p className="caption" style={{ padding: "0 16px" }}>
          Users whose favorites match yours at {MATCH_THRESHOLD}% or more.
        </p>

        {loading && <div style={{ textAlign: "center", padding: 32 }}><IonSpinner name="crescent" /></div>}
        {error && <p className="caption" style={{ textAlign: "center", padding: 16 }}>{error}</p>}

        {!loading && !error && !enough && (
          <p className="caption" style={{ textAlign: "center", padding: 32 }}>
            Add at least {MIN_FAVORITES_FOR_MATCH} movies to your favorites to find your matches.<br />
            You have {myFavorites.length} so far.
          </p>
        )}

        {!loading && !error && enough && matches.length === 0 && (
          <p className="caption" style={{ textAlign: "center", padding: 32 }}>
            No user reaches {MATCH_THRESHOLD}% yet. Add more favorites and check again.
          </p>
        )}

        <IonList>
          {matches.map((m) => (
            <MatchUserItem key={m.id} user={m} onView={() => history.push(`/app/match/${m.id}`)} />
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default MatchResults;