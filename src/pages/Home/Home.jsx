import { useRef, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon,
  IonPage, IonSearchbar, IonTitle, IonToolbar,
} from "@ionic/react";
import { addCircleOutline, peopleOutline, playCircle } from "ionicons/icons";
import CategoryChips from "../../components/CategoryChips";
import MovieGrid, { MovieGridSkeleton } from "../../components/MovieGrid";
import Pagination from "../../components/Pagination";
import { useGridColumns } from "../../hooks/useGridColumns";
import { useMovies } from "../../hooks/useMovies";
import { useFavorites } from "../../hooks/useFavorites";
import { useAuth } from "../../hooks/useAuth";
import { MOVIE_CATEGORIES, ROLES, ROWS_PER_PAGE } from "../../utils/constants";

const Home = () => {
  const history = useHistory();
  const contentRef = useRef(null);
  const { profile } = useAuth();
  const { isFavorite, toggleFavorite } = useFavorites();

  const columns = useGridColumns();
  const pageSize = columns * ROWS_PER_PAGE; // toujours des lignes complètes

  const [category, setCategory] = useState("popular");
  const [search, setSearch] = useState("");
  const { movies, loading, error, page, totalPages, goToPage } = useMovies(category, search, pageSize);

  const searching = search.trim().length >= 2;
  const isAdmin = profile?.role === ROLES.ADMIN;
  const open = (id) => history.push(`/movie/${id}`);

  const scrollTop = () => contentRef.current?.scrollToTop(300);

  const changeCategory = (key) => {
    setCategory(key);
    scrollTop();
  };

  const changePage = (p) => {
    goToPage(p);
    scrollTop();
  };

  // héros : seulement sur la page 1 (premier film TMDB, il a une affiche paysage)
  const featured = !searching && page === 1 ? movies.find((m) => m.source === "tmdb") : null;
  const categoryLabel = MOVIE_CATEGORIES.find((c) => c.key === category)?.label;

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>MovieMatch</IonTitle>
          {isAdmin && (
            <IonButtons slot="end">
              <IonButton onClick={() => history.push("/admin/add-movie")}>
                <IonIcon slot="icon-only" icon={addCircleOutline} />
              </IonButton>
              <IonButton onClick={() => history.push("/admin/users")}>
                <IonIcon slot="icon-only" icon={peopleOutline} />
              </IonButton>
            </IonButtons>
          )}
        </IonToolbar>
        <IonToolbar>
          <IonSearchbar
            debounce={500}
            placeholder="Search for a movie..."
            onIonInput={(e) => setSearch(e.detail.value ?? "")}
          />
        </IonToolbar>
      </IonHeader>

      <IonContent ref={contentRef}>
        {!searching && <CategoryChips value={category} onChange={changeCategory} />}

        {error && <p className="caption" style={{ textAlign: "center", padding: 16 }}>{error}</p>}

        {/* héros (page 1 uniquement) */}
        {!loading && !error && featured && (
          <div className="page-container">
            <div
              onClick={() => open(featured.id)}
              style={{
                margin: 12, height: 190, borderRadius: 16, cursor: "pointer",
                backgroundImage: `linear-gradient(transparent 30%, rgba(0,0,0,.8)), url(${featured.backdropUrl || featured.posterUrl})`,
                backgroundSize: "cover", backgroundPosition: "center",
                display: "flex", alignItems: "flex-end", justifyContent: "space-between",
                padding: 14, color: "#fff",
              }}
            >
              <div>
                <div style={{ fontWeight: 700, fontSize: 18 }}>{featured.title}</div>
                <div style={{ fontSize: 12, opacity: 0.9 }}>
                  {featured.rating && `★ ${featured.rating}  `}{featured.genres.slice(0, 3).join(" · ")}
                </div>
              </div>
              <IonIcon icon={playCircle} style={{ fontSize: 40, color: "#f97316" }} />
            </div>
          </div>
        )}

        {/* titre + indicateur de page */}
        {!error && (
          <div
            className="page-container"
            style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", padding: "0 16px" }}
          >
            <h3 style={{ margin: "8px 0 4px", fontWeight: 600 }}>
              {searching ? `Results for "${search.trim()}"` : `${categoryLabel} Movies`}
            </h3>
            {!loading && totalPages > 1 && (
              <span className="caption">Page {page} of {totalPages}</span>
            )}
          </div>
        )}

        {loading && <MovieGridSkeleton columns={columns} />}

        {!loading && !error && movies.length === 0 && (
          <p className="caption" style={{ padding: 16, textAlign: "center" }}>No movies found.</p>
        )}

        {!loading && !error && movies.length > 0 && (
          <>
            <MovieGrid
              movies={movies}
              columns={columns}
              onSelect={open}
              isFavorite={isFavorite}
              onToggleFavorite={toggleFavorite}
            />
            <Pagination page={page} totalPages={totalPages} onChange={changePage} />
          </>
        )}
      </IonContent>
    </IonPage>
  );
};

export default Home;