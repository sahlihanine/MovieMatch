import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import {
  IonBackButton, IonButton, IonButtons, IonContent, IonHeader,
  IonIcon, IonPage, IonSpinner, IonToolbar,
} from "@ionic/react";
import { heart, heartOutline } from "ionicons/icons";
import PlaylistModal from "../../components/PlaylistModal";
import UserAvatar from "../../components/UserAvatar";
import { getMovieDetails } from "../../services/movieService";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useFavorites } from "../../hooks/useFavorites";

const MovieDetails = () => {
  const { id } = useParams();
  const { isFavorite, toggleFavorite } = useFavorites();
  const { playlists, reload } = usePlaylists();

  const [movie, setMovie] = useState(null);
  const [error, setError] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;
    setMovie(null);
    setError(false);
    getMovieDetails(id)
      .then((m) => !cancelled && setMovie(m))
      .catch(() => !cancelled && setError(true));
    return () => { cancelled = true; };
  }, [id]);

  const fav = isFavorite(id);

  return (
    <IonPage>
      {/* barre transparente posée sur l'image */}
      <IonHeader className="ion-no-border" style={{ position: "absolute", top: 0, left: 0, right: 0 }}>
        <IonToolbar style={{ "--background": "transparent", "--color": "#fff" }}>
          <IonButtons slot="start">
            <IonBackButton defaultHref="/app/home" />
          </IonButtons>
          <IonButtons slot="end">
            <IonButton onClick={() => toggleFavorite(id)}>
              <IonIcon slot="icon-only" icon={fav ? heart : heartOutline} style={{ color: fav ? "#f97316" : "#fff" }} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent fullscreen>
        {!movie && !error && (
          <div style={{ height: "100%", display: "grid", placeItems: "center" }}><IonSpinner name="crescent" /></div>
        )}
        {error && <p className="caption ion-padding" style={{ paddingTop: 80 }}>Movie not found.</p>}

        {movie && (
          <>
            <div
              style={{
                height: 320, color: "#fff", display: "flex", flexDirection: "column", justifyContent: "flex-end",
                padding: 16,
                backgroundImage: `linear-gradient(transparent 40%, rgba(0,0,0,.85)), url(${movie.backdropUrl || movie.posterUrl})`,
                backgroundSize: "cover", backgroundPosition: "center",
              }}
            >
              <h1 style={{ margin: 0, fontSize: 28 }}>{movie.title}</h1>
              <div style={{ fontSize: 13, margin: "4px 0" }}>
                {movie.rating && <span style={{ color: "#f59e0b" }}>★ {movie.rating}</span>}
                {movie.year && ` (${movie.year})`}
              </div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>{movie.genres.join("   ")}</div>
            </div>

            <div className="ion-padding">
              <IonButton expand="block" shape="round" color="tertiary" onClick={() => setModalOpen(true)}>
                Add to playlist
              </IonButton>

              <h3 style={{ fontWeight: 600 }}>Overview</h3>
              <p className="caption" style={{ lineHeight: 1.5 }}>
                {movie.overview || "No description available."}
              </p>

              {movie.cast.length > 0 && (
                <>
                  <h3 style={{ fontWeight: 600 }}>Cast</h3>
                  <div style={{ display: "flex", gap: 16, overflowX: "auto" }}>
                    {movie.cast.map((c) => (
                      <div key={c.id} style={{ textAlign: "center", width: 64, flex: "0 0 auto" }}>
                        <UserAvatar src={c.photoUrl} name={c.name} size={56} />
                        <div style={{ fontSize: 11, marginTop: 4 }}>{c.name}</div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </>
        )}

        <PlaylistModal
          isOpen={modalOpen}
          movieId={id}
          playlists={playlists}
          onClose={() => setModalOpen(false)}
          onDone={reload}
        />
      </IonContent>
    </IonPage>
  );
};

export default MovieDetails;