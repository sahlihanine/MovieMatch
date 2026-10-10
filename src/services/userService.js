import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS, ROLES } from "../utils/constants";

export const createUserProfile = async (uid, data) => {
  await setDoc(doc(db, COLLECTIONS.USERS, uid), {
    firstName: data.firstName,
    lastName: data.lastName,
    age: data.age ?? null,
    email: data.email,
    photoURL: data.photoURL ?? null,
    role: ROLES.USER,      // l'admin se met à la main dans la console
    isActive: true,        // désactivation = isActive:false, jamais de suppression
    favoriteMovieIds: [],  // utilisé plus tard par le matching
    createdAt: serverTimestamp(),
  });
};

export const getUserProfile = async (uid) => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, uid));
  return snap.exists() ? { id: snap.id, ...snap.data() } : null;
};

export const updateUserPhoto = async (uid, photoURL) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), { photoURL });
};

export const updateUserProfile = async (uid, data) => {
  await updateDoc(doc(db, COLLECTIONS.USERS, uid), data);
};