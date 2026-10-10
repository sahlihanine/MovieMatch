import axios from "axios";
import { collection, doc, getDoc, getDocs } from "firebase/firestore";
import { db } from "../config/firebase";
import {
  TMDB_API_KEY, TMDB_BASE_URL, TMDB_IMAGE_URL, TMDB_BACKDROP_URL,
} from "../config/tmdb";
import { ADMIN_MOVIE_PREFIX, COLLECTIONS, GENRES } from "../utils/constants";

const api = axios.create({
  baseURL: TMDB_BASE_URL,
  params: { api_key: TMDB_API_KEY, language: "en-US" },
});

const PLACEHOLDER =
  "data:image/svg+xml;utf8," +
  encodeURIComponent(
    `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="450">
      <rect width="100%" height="100%" fill="#e5e7eb"/>
      <text x="50%" y="50%" fill="#9ca3af" font-size="20" text-anchor="middle">No poster</text>
    </svg>`
  );

/* ---------- Conversion vers le format interne ---------- */

const mapTmdbMovie = (m) => ({
  id: String(m.id),
  title: m.title,
  overview: m.overview || "",
  posterUrl: m.poster_path ? TMDB_IMAGE_URL + m.poster_path : PLACEHOLDER,
  backdropUrl: m.backdrop_path ? TMDB_BACKDROP_URL + m.backdrop_path : null,
  rating: m.vote_average ? Number(m.vote_average).toFixed(1) : null,
  year: (m.release_date || "").slice(0, 4),
  // liste : genre_ids / détails : genres[{name}]
  genres: m.genres ? m.genres.map((g) => g.name) : (m.genre_ids || []).map((id) => GENRES[id]).filter(Boolean),
  cast: (m.credits?.cast || []).slice(0, 6).map((c) => ({
    id: c.id,
    name: c.name,
    photoUrl: c.profile_path ? TMDB_IMAGE_URL + c.profile_path : null,
  })),
  source: "tmdb",
});

const mapAdminMovie = (snap) => {
  const d = snap.data();
  return {
    id: ADMIN_MOVIE_PREFIX + snap.id,
    title: d.title,
    overview: d.description || "",
    posterUrl: d.posterURL || PLACEHOLDER,
    backdropUrl: d.posterURL || null,
    rating: null,
    year: (d.releaseDate || "").slice(0, 4),
    genres: d.genre ? [d.genre] : [],
    cast: [],
    source: "admin",
    createdAt: d.createdAt?.seconds ?? 0,
  };
};

/* ---------- Films ajoutés par l'admin (Firestore) ---------- */

export const getAdminMovies = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.MOVIES));
  return snap.docs.map(mapAdminMovie).sort((a, b) => b.createdAt - a.createdAt);
};

const getAdminMovieById = async (id) => {
  const snap = await getDoc(doc(db, COLLECTIONS.MOVIES, id.replace(ADMIN_MOVIE_PREFIX, "")));
  if (!snap.exists()) throw new Error("Movie not found");
  return mapAdminMovie(snap);
};

/* ---------- Catalogue ---------- */

// category : "popular" | "now_playing" | "upcoming"
export const getMovies = async (category = "popular", page = 1) => {
  const [tmdbRes, adminMovies] = await Promise.all([
    api.get(`/movie/${category}`, { params: { page } }),
    category === "popular" && page === 1 ? getAdminMovies().catch(() => []) : Promise.resolve([]),
  ]);
  return {
    results: [...adminMovies, ...tmdbRes.data.results.map(mapTmdbMovie)],
    totalPages: Math.min(tmdbRes.data.total_pages, 500), // TMDB limite à 500 pages
  };
};

export const searchMovies = async (text, page = 1) => {
  const [tmdbRes, adminMovies] = await Promise.all([
    api.get("/search/movie", { params: { query: text, include_adult: false, page } }),
    page === 1 ? getAdminMovies().catch(() => []) : Promise.resolve([]),
  ]);
  const needle = text.toLowerCase();
  const adminMatches = adminMovies.filter((m) => m.title.toLowerCase().includes(needle));
  return {
    results: [...adminMatches, ...tmdbRes.data.results.map(mapTmdbMovie)],
    totalPages: Math.min(tmdbRes.data.total_pages, 500),
  };
};

export const getMovieDetails = async (id) => {
  if (id.startsWith(ADMIN_MOVIE_PREFIX)) return getAdminMovieById(id);
  const res = await api.get(`/movie/${id}`, { params: { append_to_response: "credits" } });
  return mapTmdbMovie(res.data);
};

// Pour afficher le contenu d'une playlist (liste d'ids → liste de films)
export const getMoviesByIds = async (ids = []) => {
  const results = await Promise.allSettled(ids.map((id) => getMovieDetails(id)));
  return results.filter((r) => r.status === "fulfilled").map((r) => r.value);
};


/* ---------- Pagination par lignes complètes ---------- */

const TMDB_PAGE_SIZE = 20; // taille fixe imposée par TMDB
const tmdbPageCache = new Map();

// une page TMDB, mise en cache (évite de recharger la même page quand deux pages de l'app la partagent)
const fetchTmdbPage = (category, query, p) => {
  const key = `${category}|${query}|${p}`;
  if (!tmdbPageCache.has(key)) {
    const request = (query
      ? api.get("/search/movie", { params: { query, include_adult: false, page: p } })
      : api.get(`/movie/${category}`, { params: { page: p } })
    )
      .then((res) => ({
        results: res.data.results.map(mapTmdbMovie),
        // TMDB plafonne à 500 pages
        total: Math.min(res.data.total_results, Math.min(res.data.total_pages, 500) * TMDB_PAGE_SIZE),
      }))
      .catch((err) => {
        tmdbPageCache.delete(key); // on ne garde pas un échec en cache
        throw err;
      });
    tmdbPageCache.set(key, request);
  }
  return tmdbPageCache.get(key);
};

// films de l'admin : relus au plus toutes les 30 s pour ne pas interroger Firestore à chaque page
let adminCache = { at: 0, movies: [] };
const getAdminMoviesCached = async () => {
  if (Date.now() - adminCache.at < 30000) return adminCache.movies;
  try {
    const movies = await getAdminMovies();
    adminCache = { at: Date.now(), movies };
    return movies;
  } catch {
    return [];
  }
};

/*
  Renvoie exactement `pageSize` films (sauf sur la dernière page).
  Liste combinée = films admin d'abord (Popular ou recherche), puis films TMDB.
*/
export const getMoviesPage = async ({ category = "popular", query = "", page = 1, pageSize = 20 }) => {
  const adminAll = query || category === "popular" ? await getAdminMoviesCached() : [];
  const needle = query.toLowerCase();
  const admin = query ? adminAll.filter((m) => m.title.toLowerCase().includes(needle)) : adminAll;
  const adminCount = admin.length;

  // position de la page dans la liste combinée, puis dans la liste TMDB seule
  const start = (page - 1) * pageSize;
  const end = start + pageSize;
  const tStart = Math.max(0, start - adminCount);
  const tEnd = Math.max(tStart, end - adminCount);

  const firstPage = Math.floor(tStart / TMDB_PAGE_SIZE) + 1;
  const first = await fetchTmdbPage(category, query, firstPage);

  // on ne demande jamais une page TMDB qui n'existe pas
  const tEndClamped = Math.min(tEnd, first.total);
  const lastPage = Math.floor((Math.max(tEndClamped, tStart + 1) - 1) / TMDB_PAGE_SIZE) + 1;

  const others = [];
  for (let p = firstPage + 1; p <= lastPage; p += 1) others.push(fetchTmdbPage(category, query, p));
  const pages = [first, ...(await Promise.all(others))];

  const offset = (firstPage - 1) * TMDB_PAGE_SIZE;
  const tmdb = pages.flatMap((p) => p.results).slice(tStart - offset, tEnd - offset);

  return {
    results: [...admin.slice(start, end), ...tmdb],
    totalPages: Math.max(1, Math.ceil((adminCount + first.total) / pageSize)),
  };
};