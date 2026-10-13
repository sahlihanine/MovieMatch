import { useEffect, useMemo, useState } from "react";
import { useHistory, useParams } from "react-router-dom";
import {
  IonBackButton, IonButtons, IonContent, IonHeader, IonIcon,
  IonPage, IonSpinner, IonTitle, IonToolbar,
} from "@ionic/react";
import { heart } from "ionicons/icons";
import MovieCard from "../../components/MovieCard";
import PagedMovieGrid from "../../components/PagedMovieGrid";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { useFavorites } from "../../hooks/useFavorites";
import { useGridColumns } from "../../hooks/useGridColumns";
import { getMatchWith } from "../../services/matchService";
import { computeMatch } from "../../utils/matchAlgorithm";

const ROWS = 2; // lignes par page

const Match = () => {
  const { uid } = useParams();
  const history = useHistory();
  const { profile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();
  const columns = useGridColumns(); // films par ligne (3 sur mobile, jusqu'à 8 sur grand écran)

  const [other, setOther] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const myFavorites = profile?.favoriteMovieIds;
  const ready = Boolean(profile);

  // l'autre utilisateur est chargé une seule fois ; le pourcentage et les listes
  // sont recalculés en direct plus bas, quand mes favoris changent
  useEffect(() => {
    let cancelled = false;
    if (!ready) return;
    setLoading(true);
    setError(false);

    getMatchWith([], uid)
      .then((res) => !cancelled && setOther(res))
      .catch(() => !cancelled && setError(true))
      .finally(() => !cancelled && setLoading(false));

    return () => { cancelled = true; };
  }, [uid, ready]);

  // films en commun et taux, en direct
  const { percentage, common } = useMemo(
    () => computeMatch(myFavorites ?? [], other?.favoriteMovieIds ?? []),
    [myFavorites, other]
  );

  // recommandations : favoris de l'autre que je n'ai pas, les plus récents d'abord
  const recommended = useMemo(() => {
    const mine = new Set((myFavorites ?? []).map(String));
    return [...(other?.favoriteMovieIds ?? [])]
      .reverse()
      .map(String)
      .filter((id) => !mine.has(id));
  }, [myFavorites, other]);

  const open = (id) => history.push(`/movie/${id}`);

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonButtons slot="start"><IonBackButton defaultHref="/app/match" /></IonButtons>
          <IonTitle>Your match</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent className="ion-padding">
        {/* contenu centré et limité en largeur */}
        <div style={{ maxWidth: 960, margin: "0 auto" }}>
          {loading && <div style={{ textAlign: "center", padding: 32 }}><IonSpinner name="crescent" /></div>}
          {error && <p className="caption" style={{ textAlign: "center" }}>User not found.</p>}

          {other && !loading && (
            <>
              <p style={{ textAlign: "center", fontSize: 16 }}>
                You and <strong>{other.firstName}</strong> have{" "}
                <strong style={{ color: "var(--ion-color-tertiary)" }}>{percentage}%</strong> match!
              </p>

              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-around", margin: "24px 0" }}>
                <div style={{ textAlign: "center" }}>
                  <UserAvatar src={profile?.photoURL} name={`${profile?.firstName} ${profile?.lastName}`} size={84} />
                  <div style={{ marginTop: 6, fontWeight: 600 }}>You</div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <IonIcon icon={heart} color="tertiary" style={{ fontSize: 48 }} />
                  <div style={{ fontSize: 24, fontWeight: 700, color: "var(--ion-color-tertiary)" }}>
                    {percentage}%
                  </div>
                </div>

                <div style={{ textAlign: "center" }}>
                  <UserAvatar src={other.photoURL} name={`${other.firstName} ${other.lastName}`} size={84} />
                  <div style={{ marginTop: 6, fontWeight: 600 }}>{other.firstName}</div>
                </div>
              </div>

              {/* films en commun */}
              <h3 style={{ fontWeight: 600 }}>Shared favorite movies ({common.length})</h3>
              {common.length === 0 ? (
                <p className="caption">No shared favorites.</p>
              ) : (
                <PagedMovieGrid
                  ids={common}
                  columns={columns}
                  rows={ROWS}
                  renderCard={(m) => (
                    <MovieCard
                      fluid
                      title={m.title}
                      posterUrl={m.posterUrl}
                      subtitle={m.year}
                      onClick={() => open(m.id)}
                    />
                  )}
                />
              )}

              {/* recommandations */}
              <h3 style={{ fontWeight: 600, marginTop: 28, marginBottom: 2 }}>
                Recommended for you ({recommended.length})
              </h3>
              <p className="caption" style={{ marginTop: 0 }}>
                {`Favorites of ${other.firstName} that are not in your list yet.`}
              </p>

              {other.favoriteMovieIds.length === 0 && (
                <p className="caption">{`${other.firstName} has no favorites to recommend yet.`}</p>
              )}
              {other.favoriteMovieIds.length > 0 && recommended.length === 0 && (
                <p className="caption">{`You already have all of ${other.firstName}'s favorites.`}</p>
              )}

              {recommended.length > 0 && (
                <PagedMovieGrid
                  ids={recommended}
                  columns={columns}
                  rows={ROWS}
                  renderCard={(m) => (
                    <MovieCard
                      fluid
                      title={m.title}
                      posterUrl={m.posterUrl}
                      subtitle={m.year}
                      onClick={() => open(m.id)}
                      isFavorite={isFavorite(m.id)}
                      onToggleFavorite={() => toggleFavorite(m.id)}
                    />
                  )}
                />
              )}
            </>
          )}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Match;