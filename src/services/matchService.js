import { collection, doc, getDoc, getDocs, query, where } from "firebase/firestore";
import { db } from "../config/firebase";
import { COLLECTIONS } from "../utils/constants";
import { canMatch, computeMatch, meetsThreshold } from "../utils/matchAlgorithm";

// on ne garde que les champs utiles (jamais l'email d'un autre utilisateur dans l'UI)
const publicUser = (id, d) => ({
  id,
  firstName: d.firstName,
  lastName: d.lastName,
  age: d.age,
  photoURL: d.photoURL ?? null,
});

/* Tous les utilisateurs actifs dont le taux dépasse le seuil, triés par taux décroissant */
export const findMatches = async (uid, myFavorites = []) => {
  if (!canMatch(myFavorites)) return [];

  const snap = await getDocs(
    query(collection(db, COLLECTIONS.USERS), where("isActive", "==", true))
  );

  return snap.docs
    .filter((d) => d.id !== uid)
    .map((d) => {
      const data = d.data();
      const favs = data.favoriteMovieIds ?? [];
      const { percentage, common } = computeMatch(myFavorites, favs);
      return {
        ...publicUser(d.id, data),
        percentage,
        commonIds: common,
        eligible: canMatch(favs),
      };
    })
    .filter((m) => m.eligible && meetsThreshold(m.percentage))
    .sort((a, b) => b.percentage - a.percentage || b.commonIds.length - a.commonIds.length);
};

/* Détail du match entre moi et un utilisateur précis (écran 12) */
export const getMatchWith = async (myFavorites = [], otherUid) => {
  const snap = await getDoc(doc(db, COLLECTIONS.USERS, otherUid));
  // un compte inexistant ou désactivé n'est pas consultable
  if (!snap.exists() || snap.data().isActive === false) throw new Error("User not found");

  const data = snap.data();
  const favorites = data.favoriteMovieIds ?? [];
  const { percentage, common } = computeMatch(myFavorites, favorites);

  return {
    ...publicUser(snap.id, data),
    percentage,
    commonIds: common,
    favoriteMovieIds: favorites, // liste complète, sert aux recommandations
  };
};