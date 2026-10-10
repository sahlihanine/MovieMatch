import { IonSkeletonText } from "@ionic/react";
import MovieCard from "./MovieCard";
import { ROWS_PER_PAGE } from "../utils/constants";

const MovieGrid = ({ movies, columns, onSelect, isFavorite, onToggleFavorite }) => (
  <div className="movie-grid" style={{ "--cols": columns }}>
    {movies.map((m) => (
      <MovieCard
        key={m.id}
        fluid
        title={m.title}
        posterUrl={m.posterUrl}
        subtitle={m.year}
        onClick={() => onSelect(m.id)}
        isFavorite={isFavorite(m.id)}
        onToggleFavorite={() => onToggleFavorite(m.id)}
      />
    ))}
  </div>
);

/* Squelettes : la grille complète (colonnes × lignes) pendant le chargement */
export const MovieGridSkeleton = ({ columns }) => (
  <div className="movie-grid" style={{ "--cols": columns }}>
    {Array.from({ length: columns * ROWS_PER_PAGE }).map((_, i) => (
      <IonSkeletonText
        key={i}
        animated
        style={{ width: "100%", aspectRatio: "2 / 3", margin: 0, borderRadius: 12 }}
      />
    ))}
  </div>
);

export default MovieGrid;