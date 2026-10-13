import { useCallback, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonButton, IonContent, IonItem, IonLabel, IonList, IonPage, IonRefresher,
  IonRefresherContent, IonSearchbar, IonSpinner, useIonViewWillEnter,
} from "@ionic/react";
import AdminHeader from "../../components/AdminHeader";
import { getAddedMovies } from "../../services/adminService";

const formatDate = (timestamp) =>
  timestamp?.seconds ? new Date(timestamp.seconds * 1000).toLocaleDateString() : "";

const AdminMovies = () => {
  const history = useHistory();
  const [movies, setMovies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setMovies(await getAddedMovies());
    } catch {
      setError("Unable to load movies.");
    } finally {
      setLoading(false);
    }
  }, []);

  // rechargé à chaque arrivée sur l'onglet : un film tout juste ajouté apparaît tout de suite
  useIonViewWillEnter(() => { load(); }, [load]);

  const needle = search.trim().toLowerCase();
  const filtered = movies.filter((m) =>
    `${m.title} ${m.genre}`.toLowerCase().includes(needle)
  );

  return (
    <IonPage>
      <AdminHeader active="movies" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <IonSearchbar
          debounce={300}
          placeholder="Search by title or genre..."
          onIonInput={(e) => setSearch(e.detail.value ?? "")}
        />

        <h3 style={{ margin: "0 16px 4px", fontWeight: 600 }}>Added movies ({movies.length})</h3>

        {loading && <div style={{ textAlign: "center", padding: 32 }}><IonSpinner name="crescent" /></div>}
        {error && <p className="caption" style={{ textAlign: "center", padding: 16 }}>{error}</p>}

        {!loading && !error && movies.length === 0 && (
          <div style={{ textAlign: "center", padding: 32 }}>
            <p className="caption">You haven't added any movie yet.</p>
            <IonButton shape="round" color="tertiary" onClick={() => history.push("/admin/add-movie")}>
              Add a movie
            </IonButton>
          </div>
        )}

        {!loading && !error && movies.length > 0 && filtered.length === 0 && (
          <p className="caption" style={{ textAlign: "center", padding: 24 }}>No movies match your search.</p>
        )}

        <IonList>
          {filtered.map((m) => (
            <IonItem key={m.id} lines="full">
              <div
                slot="start"
                style={{
                  width: 64, height: 96, flexShrink: 0, margin: "10px 16px 10px 0",
                  borderRadius: 8, overflow: "hidden", background: "#e5e7eb",
                }}
              >
                <img
                  src={m.posterURL}
                  alt={m.title}
                  onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
                  style={{ width: "100%", height: "100%", objectFit: "cover", display: "block" }}
                />
              </div>

              <IonLabel className="ion-text-wrap">
                <h3 style={{ fontWeight: 600, marginBottom: 4 }}>{m.title}</h3>
                <p className="caption">
                  {[(m.releaseDate || "").slice(0, 4), m.genre].filter(Boolean).join(" · ")}
                </p>
                <p style={{
                  fontSize: 13,
                  display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
                }}>
                  {m.description}
                </p>
                {m.createdAt && <p className="caption">Added on {formatDate(m.createdAt)}</p>}
              </IonLabel>
            </IonItem>
          ))}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AdminMovies;