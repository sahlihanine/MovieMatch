import { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonPage,
  IonSegment, IonSegmentButton, IonLabel, IonSpinner, IonTitle,
  IonToolbar, useIonAlert,
} from "@ionic/react";
import { add } from "ionicons/icons";
import MovieCard from "../../components/MovieCard";
import { usePlaylists } from "../../hooks/usePlaylists";
import { useAuth } from "../../hooks/useAuth";
import { getMoviesByIds } from "../../services/movieService";
import { createPlaylist, removeMovieFromPlaylist } from "../../services/playlistService";

const Playlist = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { playlists, loading, reload } = usePlaylists();
  const [presentAlert] = useIonAlert();

  const [selectedId, setSelectedId] = useState(null);
  const [movies, setMovies] = useState([]);
  const [loadingMovies, setLoadingMovies] = useState(false);

  const selected = playlists.find((p) => p.id === selectedId) || playlists[0];
  // change quand on change de playlist OU quand son contenu change
  const contentKey = selected ? `${selected.id}:${selected.movieIds.join(",")}` : "";

  useEffect(() => {
    let cancelled = false;
    if (!selected) { setMovies([]); return; }
    setLoadingMovies(true);
    getMoviesByIds(selected.movieIds)
      .then((m) => !cancelled && setMovies(m))
      .finally(() => !cancelled && setLoadingMovies(false));
    return () => { cancelled = true; };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [contentKey]);

  const handleRemove = async (movieId) => {
    await removeMovieFromPlaylist(user.uid, selected, movieId);
    reload();
  };

  const handleCreate = () =>
    presentAlert({
      header: "New playlist",
      inputs: [{ name: "name", type: "text", placeholder: "e.g. Action Movies" }],
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Create",
          handler: async (data) => {
            if (!data.name?.trim()) return false; // garde l'alerte ouverte
            const created = await createPlaylist(user.uid, data.name);
            await reload();
            setSelectedId(created.id);
          },
        },
      ],
    });

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>My Playlist</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={handleCreate}>
              <IonIcon slot="icon-only" icon={add} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
        <IonToolbar>
          <IonSegment
            scrollable
            value={selected?.id}
            onIonChange={(e) => setSelectedId(e.detail.value)}
          >
            {playlists.map((p) => (
              <IonSegmentButton key={p.id} value={p.id}>
                <IonLabel>{p.name}</IonLabel>
              </IonSegmentButton>
            ))}
          </IonSegment>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {(loading || loadingMovies) && (
          <div style={{ textAlign: "center", padding: 32 }}><IonSpinner name="crescent" /></div>
        )}

        {!loading && !loadingMovies && movies.length === 0 && (
          <p className="caption" style={{ textAlign: "center", padding: 40 }}>
            No movies in this playlist yet.<br />Browse the catalog and add some!
          </p>
        )}

        <div className="movie-grid">
          {movies.map((m) => (
            <MovieCard
              key={m.id}
              fluid
              title={m.title}
              posterUrl={m.posterUrl}
              subtitle={m.year}
              onClick={() => history.push(`/movie/${m.id}`)}
              onRemove={() => handleRemove(m.id)}
            />
          ))}
        </div>
      </IonContent>
    </IonPage>
  );
};

export default Playlist;