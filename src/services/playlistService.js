import {
  addDoc, arrayRemove, arrayUnion, collection, doc, getDocs,
  query, serverTimestamp, setDoc, where, writeBatch,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS, DEFAULT_PLAYLISTS, PLAYLIST_TYPES } from "../utils/constants";

const playlistsRef = () => collection(db, COLLECTIONS.PLAYLISTS);
const defaultId = (uid, type) => `${uid}_${type}`;

const ORDER = DEFAULT_PLAYLISTS.map((p) => p.type);
const sortPlaylists = (list) =>
  [...list].sort((a, b) => {
    const ia = ORDER.indexOf(a.type);
    const ib = ORDER.indexOf(b.type);
    if (ia !== -1 || ib !== -1) return (ia === -1 ? 99 : ia) - (ib === -1 ? 99 : ib);
    return (a.createdAt?.seconds ?? 0) - (b.createdAt?.seconds ?? 0);
  });

/* Liste des playlists d'un utilisateur ; crée les 3 playlists par défaut si besoin */
export const getUserPlaylists = async (uid) => {
  const q = query(playlistsRef(), where("ownerId", "==", uid));
  const snap = await getDocs(q);
  const list = snap.docs.map((d) => ({ id: d.id, ...d.data() }));

  const missing = DEFAULT_PLAYLISTS.filter((def) => !list.some((p) => p.type === def.type));
  for (const def of missing) {
    const data = { ownerId: uid, name: def.name, type: def.type, movieIds: [] };
    await setDoc(doc(db, COLLECTIONS.PLAYLISTS, defaultId(uid, def.type)), {
      ...data, createdAt: serverTimestamp(),
    });
    list.push({ id: defaultId(uid, def.type), ...data });
  }
  return sortPlaylists(list);
};

export const createPlaylist = async (uid, name) => {
  const data = { ownerId: uid, name: name.trim(), type: PLAYLIST_TYPES.CUSTOM, movieIds: [] };
  const ref = await addDoc(playlistsRef(), { ...data, createdAt: serverTimestamp() });
  return { id: ref.id, ...data };
};

/* Ajoute / retire un film. Si c'est la playlist Favorites, on synchronise users/{uid}.favoriteMovieIds */
const changeMovie = async (uid, playlist, movieId, add) => {
  const op = add ? arrayUnion : arrayRemove;
  const batch = writeBatch(db);
  batch.update(doc(db, COLLECTIONS.PLAYLISTS, playlist.id), { movieIds: op(movieId) });
  if (playlist.type === PLAYLIST_TYPES.FAVORITES) {
    batch.update(doc(db, COLLECTIONS.USERS, uid), { favoriteMovieIds: op(movieId) });
  }
  await batch.commit();
};

export const addMovieToPlaylist = (uid, playlist, movieId) => changeMovie(uid, playlist, movieId, true);
export const removeMovieFromPlaylist = (uid, playlist, movieId) => changeMovie(uid, playlist, movieId, false);

/* Raccourci du bouton cœur : ajoute/retire des Favorites sans ouvrir la modale */
export const setFavorite = async (uid, movieId, value) => {
  const op = value ? arrayUnion : arrayRemove;
  const batch = writeBatch(db);
  // setDoc+merge : crée la playlist Favorites si elle n'existe pas encore
  batch.set(
    doc(db, COLLECTIONS.PLAYLISTS, defaultId(uid, PLAYLIST_TYPES.FAVORITES)),
    { ownerId: uid, name: "Favorites", type: PLAYLIST_TYPES.FAVORITES, movieIds: op(movieId) },
    { merge: true }
  );
  batch.update(doc(db, COLLECTIONS.USERS, uid), { favoriteMovieIds: op(movieId) });
  await batch.commit();
};