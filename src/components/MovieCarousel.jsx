import MovieCard from "./MovieCard";

const MovieCarousel = ({ movies, onSelect, isFavorite, onToggleFavorite }) => (
  <div style={{ display: "flex", overflowX: "auto", padding: "0 6px 8px" }}>
    {movies.map((m) => (
      <MovieCard
        key={m.id}
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

export default MovieCarousel;