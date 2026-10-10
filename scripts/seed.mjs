/*
  Seed MovieMatch : crée un compte admin + des comptes de test pour la démo du matching.
  Usage (PowerShell, depuis la racine du projet) :
    $env:ADMIN_PASSWORD = "un-mot-de-passe-fort"
    npm run seed
  Le script peut être relancé : il met à jour les comptes existants au lieu de les dupliquer.
*/
import { initializeApp, cert } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import { getFirestore, FieldValue } from "firebase-admin/firestore";
import { readFileSync } from "node:fs";

const key = JSON.parse(
  readFileSync(new URL("./serviceAccountKey.json", import.meta.url), "utf8")
);
initializeApp({ credential: cert(key) });

const auth = getAuth();
const db = getFirestore();

/* ---------- Configuration ---------- */
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "admin@moviematch.test";
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; // volontairement sans valeur par défaut
const TEST_PASSWORD = process.env.SEED_PASSWORD || "Test1234!";

if (!ADMIN_PASSWORD || ADMIN_PASSWORD.length < 8) {
  console.error('Définis ADMIN_PASSWORD (8 caractères minimum) : $env:ADMIN_PASSWORD = "..."');
  process.exit(1);
}

// ids TMDB (en string, comme dans l'app)
const INCEPTION = "27205";
const INTERSTELLAR = "157336";
const DARK_KNIGHT = "155";
const MATRIX = "603";
const FIGHT_CLUB = "550";
const FORREST_GUMP = "13";
const PULP_FICTION = "680";
const TITANIC = "597";

const BASE = [INCEPTION, INTERSTELLAR, DARK_KNIGHT, MATRIX, FIGHT_CLUB];

const USERS = [
  {
    email: ADMIN_EMAIL, password: ADMIN_PASSWORD,
    firstName: "Admin", lastName: "MovieMatch", age: 30, role: "admin", favorites: [],
  },
  // compte à utiliser pour la démo : ses favoris = BASE
  { email: "demo@moviematch.test", firstName: "Demo", lastName: "User", age: 22, favorites: BASE },
  // Taux attendus pour "Demo User" (Jaccard) :
  { email: "sarah@moviematch.test", firstName: "Sarah", lastName: "Connor", age: 28, favorites: BASE },                              // 100 %
  { email: "emma@moviematch.test", firstName: "Emma", lastName: "Wilson", age: 25, favorites: [...BASE, FORREST_GUMP] },            // 83 %
  { email: "michael@moviematch.test", firstName: "Michael", lastName: "Brown", age: 31, favorites: [INCEPTION, INTERSTELLAR, DARK_KNIGHT, MATRIX] }, // 80 %
  { email: "daniel@moviematch.test", firstName: "Daniel", lastName: "Lee", age: 27, favorites: [INCEPTION, INTERSTELLAR, DARK_KNIGHT, FORREST_GUMP] }, // 50 % (masqué)
  { email: "sophia@moviematch.test", firstName: "Sophia", lastName: "Martinez", age: 24, favorites: [FORREST_GUMP, PULP_FICTION, TITANIC] },        // 0 % (masqué)
  // favoris identiques mais compte désactivé : ne doit PAS apparaître dans les matchs
  { email: "lucas@moviematch.test", firstName: "Lucas", lastName: "Inactive", age: 29, isActive: false, favorites: BASE },
];

/* ---------- Création / mise à jour ---------- */
const upsertUser = async (u) => {
  const displayName = `${u.firstName} ${u.lastName}`;
  const password = u.password || TEST_PASSWORD;

  let record;
  try {
    record = await auth.getUserByEmail(u.email);
    await auth.updateUser(record.uid, { password, displayName });
  } catch (e) {
    if (e.code !== "auth/user-not-found") throw e;
    record = await auth.createUser({ email: u.email, password, displayName });
  }

  const uid = record.uid;
  const favorites = u.favorites ?? [];

  await db.collection("users").doc(uid).set({
    firstName: u.firstName,
    lastName: u.lastName,
    age: u.age,
    email: u.email,
    photoURL: null,
    role: u.role ?? "user",
    isActive: u.isActive ?? true,
    favoriteMovieIds: favorites,
    createdAt: FieldValue.serverTimestamp(),
  });

  // playlists par défaut (mêmes ids que l'app : {uid}_{type})
  const defaults = [
    { type: "favorites", name: "Favorites", movieIds: favorites },
    { type: "watchlist", name: "My List", movieIds: [] },
    { type: "watched", name: "Watched", movieIds: [] },
  ];
  for (const p of defaults) {
    await db.collection("playlists").doc(`${uid}_${p.type}`).set({
      ownerId: uid,
      name: p.name,
      type: p.type,
      movieIds: p.movieIds,
      createdAt: FieldValue.serverTimestamp(),
    });
  }

  console.log(`✔ ${u.role === "admin" ? "ADMIN" : "user "}  ${u.email}${u.isActive === false ? "  (inactive)" : ""}`);
};

for (const u of USERS) {
  await upsertUser(u);
}

console.log("\nTerminé.");
console.log(`Admin : ${ADMIN_EMAIL}`);
console.log(`Comptes de test : mot de passe "${TEST_PASSWORD}" (connecte-toi avec demo@moviematch.test pour voir les matchs)`);
process.exit(0);