import { useEffect, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  IonBackButton, IonButtons, IonContent, IonHeader, IonIcon,
  IonPage, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { heart } from "ionicons/icons";
import MovieCard from "../../components/MovieCard";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { getMatchWith } from "../../services/matchService";
import { getMoviesByIds } from "../../services/movieService";

const Match = () => {
  const { uid } = useParams();
  const history = useHistory();
  const { profile } = useAuth();

  const myFavorites = profile?.favoriteMovieIds ?? [];
  const favKey = myFavorites.join(",");

  const [result, setResult] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    if (!profile) return;
    setLoading(true);
    setError(false);

    getMatchWith(myFavorites, uid)
      .then(async (res) => {
        const common = await getMoviesByIds(res.commonIds);
        if (!cancelled) { setResult(res); setMovies(common); }
      })
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [uid, favKey, profile?.id]);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/app/match" /></IonButtons>
          <IonTitle>Your match</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {loading && <div style={{ textAlign: "center", padding: 32 }}><IonSpinner name="crescent" /></div>}
        {error && <p className="caption" style={{ textAlign: "center" }}>User not found.</p>}

        {result && !loading && (
          <>
            <p style={{ textAlign: "center", fontSize: 16 }}>
              You and <strong>{result.firstName}</strong> have{" "}
              <strong style={{ color: "var(--ion-color-tertiary)" }}>{result.percentage}%</strong> match!
            </p>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", margin: "24px 0" }}>
              <div style={{ textAlign: "center" }}>
                <UserAvatar src={profile?.photoURL} name={`${profile?.firstName} ${profile?.lastName}`} size={84} />
                <div style={{ marginTop: 6, fontWeight: 600 }}>You</div>
              </div>

              <div style={{ textAlign: "center" }}>
                <IonIcon icon={heart} color="tertiary" style={{ fontSize: 48 }} />
                <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ion-color-tertiary)" }}>
                  {result.percentage}%
                </div>
              </div>

              <div style={{ textAlign: "center" }}>
                <UserAvatar src={result.photoURL} name={`${result.firstName} ${result.lastName}`} size={84} />
                <div style={{ marginTop: 6, fontWeight: 600 }}>{result.firstName}</div>
              </div>
            </div>

            <h3 style={{ fontWeight: 600 }}>Shared favorite movies</h3>
            {movies.length === 0 ? (
              <p className="caption">No shared favorites.</p>
            ) : (
              <div style={{ display: "flex", overflowX: "auto" }}>
                {movies.map((m) => (
                  <MovieCard
                    key={m.id}
                    title={m.title}
                    posterUrl={m.posterUrl}
                    subtitle={m.year}
                    onClick={() => history.push(`/movie/${m.id}`)}
                  />
                ))}
              </div>
            )}
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Match;