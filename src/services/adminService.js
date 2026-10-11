import {
  addDoc, collection, doc, getDocs, serverTimestamp, updateDoc,
} from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../utils/constants";

/* Tous les utilisateurs (actifs et inactifs), triés par nom */
export const getAllUsers = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.USERS));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`));
};

/* Désactivation = on change le champ isActive, on ne supprime JAMAIS le document */
export const setUserActive = (uid, isActive) =>
  updateDoc(doc(db, COLLECTIONS.USERS, uid), { isActive });

/* Ajout d'un film dans la base de départ (collection movies) */
export const addMovie = (adminUid, { title, description, releaseDate, genre, posterURL }) =>
  addDoc(collection(db, COLLECTIONS.MOVIES), {
    title: title.trim(),
    description: description.trim(),
    releaseDate, // "YYYY-MM-DD"
    genre,
    posterURL: posterURL.trim(),
    addedBy: adminUid,
    createdAt: serverTimestamp(),
  });

/* Films ajoutés par l'admin, du plus récent au plus ancien */
export const getAddedMovies = async () => {
  const snap = await getDocs(collection(db, COLLECTIONS.MOVIES));
  return snap.docs
    .map((d) => ({ id: d.id, ...d.data() }))
    .sort((a, b) => (b.createdAt?.seconds ?? 0) - (a.createdAt?.seconds ?? 0));
};