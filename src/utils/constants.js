export const ROLES = { USER: "user", ADMIN: "admin" };

export const COLLECTIONS = {
  USERS: "users",
  MOVIES: "movies",
  PLAYLISTS: "playlists",
};

export const STORAGE_KEYS = { ONBOARDING_SEEN: "onboarding_seen" };

export const MATCH_THRESHOLD = 75; // % minimum exigé par le prof

export const ROWS_PER_PAGE = 4;

export const MIN_FAVORITES_FOR_MATCH = 3;

export const ADMIN_MOVIE_PREFIX = "admin-";

export const PLAYLIST_TYPES = {
  FAVORITES: "favorites",
  WATCHLIST: "watchlist",
  WATCHED: "watched",
  CUSTOM: "custom",
};

export const DEFAULT_PLAYLISTS = [
  { type: PLAYLIST_TYPES.FAVORITES, name: "Favorites" },
  { type: PLAYLIST_TYPES.WATCHLIST, name: "My List" },
  { type: PLAYLIST_TYPES.WATCHED, name: "Watched" },
];

export const MOVIE_CATEGORIES = [
  { key: "popular", label: "Popular" },
  { key: "now_playing", label: "Now Playing" },
  { key: "upcoming", label: "Upcoming" },
];

// TMDB renvoie des ids de genres dans les listes
export const GENRES = {
  28: "Action", 12: "Adventure", 16: "Animation", 35: "Comedy", 80: "Crime",
  99: "Documentary", 18: "Drama", 10751: "Family", 14: "Fantasy", 36: "History",
  27: "Horror", 10402: "Music", 9648: "Mystery", 10749: "Romance",
  878: "Sci-Fi", 10770: "TV Movie", 53: "Thriller", 10752: "War", 37: "Western",
};