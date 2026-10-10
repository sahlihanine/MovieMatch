import { useCallback, useEffect, useRef, useState } from "react";
import { getMoviesPage } from "../services/movieService";

export const useMovies = (category, search = "", pageSize = 20) => {
  const text = search.trim();
  const query = text.length >= 2 ? text : "";
  const key = `${category}|${query}|${pageSize}`;

  const [movies, setMovies] = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const requestId = useRef(0); // ignore les réponses d'une requête devenue obsolète

  // la page est liée à (catégorie, recherche, taille de page) : en changer revient à la page 1
  const [pageState, setPageState] = useState({ key, page: 1 });
  const page = pageState.key === key ? pageState.page : 1;
  const goToPage = useCallback((p) => setPageState({ key, page: p }), [key]);

  useEffect(() => {
    const id = ++requestId.current;
    setLoading(true);
    setError(null);

    getMoviesPage({ category, query, page, pageSize })
      .then(({ results, totalPages: tp }) => {
        if (id !== requestId.current) return;
        setMovies(results);
        setTotalPages(tp);
      })
      .catch(() => id === requestId.current && setError("Unable to load movies. Check your connection."))
      .finally(() => id === requestId.current && setLoading(false));
  }, [category, query, page, pageSize]);

  return { movies, loading, error, page, totalPages, goToPage };
};