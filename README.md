# 🎬 MovieMatch

> Application mobile de gestion de films avec playlists personnelles et **matching entre utilisateurs** selon leurs goûts cinéma.

![Ionic](https://img.shields.io/badge/Ionic-React-3880FF?logo=ionic&logoColor=white)
![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?logo=javascript&logoColor=black)
![Capacitor](https://img.shields.io/badge/Capacitor-Android-119EFF?logo=capacitor&logoColor=white)
![Firebase](https://img.shields.io/badge/Firebase-Auth%20%2B%20Firestore-FFCA28?logo=firebase&logoColor=black)
![TMDB](https://img.shields.io/badge/API-TMDB-01B4E4)

Mini-projet de **développement mobile hybride** réalisé avec Ionic, JavaScript, Firebase et l'API publique TMDB.

---

## 📖 Description

MovieMatch permet à chaque utilisateur de :

- s'inscrire (nom, prénom, âge, **photo prise avec la caméra du téléphone**) et s'authentifier ;
- parcourir un catalogue de films (populaires, à l'affiche, prochaines sorties) et rechercher un film ;
- créer ses propres **playlists** et gérer ses films favoris ;
- découvrir les utilisateurs qui ont des goûts proches des siens grâce au **matching** (taux de correspondance des favoris supérieur à **75 %**).

Un **administrateur** peut ajouter des films à la base de départ et **désactiver** (sans supprimer) un utilisateur.

## ✨ Fonctionnalités

| Domaine | Détail |
|---|---|
| Authentification | Inscription et connexion par email / mot de passe, connexion Google, mot de passe oublié |
| Profil | Nom, prénom, âge, photo via Capacitor Camera ou galerie |
| Catalogue | Films TMDB (Popular, Now Playing, Upcoming), recherche, détails avec casting |
| Playlists | Favorites, My List, Watched et playlists personnalisées, cœur de favori rapide |
| Matching | Calcul du taux de correspondance entre listes de favoris, seuil de 75 % |
| Administration | Ajout de films, activation / désactivation des utilisateurs |
| Sécurité | Routes protégées, compte désactivé = déconnexion immédiate (écoute temps réel) |

## 🛠️ Stack technique

- **[Ionic Framework](https://ionicframework.com/docs)** (React, JavaScript) : composants UI, navigation par onglets
- **[Capacitor](https://capacitorjs.com/)** : accès natif (caméra, préférences) et génération de l'application Android
- **[Firebase](https://firebase.google.com/)** : Authentication + Cloud Firestore
- **[TMDB API](https://developer.themoviedb.org/docs)** : base de films de départ
- **Swiper** (onboarding), **Axios** (requêtes HTTP), **Vite** (build)

## 📁 Structure du projet

```
moviematch/
├── src/
│   ├── main.jsx                # Point d'entrée
│   ├── App.jsx                 # Routes + onglets
│   ├── config/                 # firebase.js, tmdb.js
│   ├── services/               # Accès aux données (auth, users, movies, playlists, match, caméra)
│   ├── context/                # AuthContext (utilisateur courant + rôle)
│   ├── hooks/                  # useAuth, useMovies, usePlaylists, useFavorites
│   ├── pages/                  # Splash, Onboarding, Login, Register, Home, MovieDetails,
│   │                           # Playlist, Match, MatchResults, Profile, admin/
│   ├── components/             # MovieCard, MovieCarousel, PlaylistModal, ProtectedRoute...
│   ├── utils/                  # constants, validators, matchAlgorithm
│   └── theme/                  # variables.css, global.css
├── capacitor.config.json
├── ionic.config.json
└── package.json
```

> Règle d'architecture : les pages n'appellent jamais Firebase directement, elles passent par `services/`.

## 🚀 Installation

### Prérequis

- [Node.js](https://nodejs.org/) (version LTS)
- Ionic CLI : `npm install -g @ionic/cli`
- Pour Android : [Android Studio](https://developer.android.com/studio) et le SDK Android

### 1. Cloner et installer

```bash
git clone https://github.com/<votre-utilisateur>/moviematch.git
cd moviematch
npm install
```

### 2. Configurer les clés

Crée un fichier `.env` à la racine (voir `.env.example`) :

```env
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_TMDB_API_KEY=
```

- Projet Firebase : active **Authentication** (Email/Password et Google) et **Cloud Firestore**.
- Clé TMDB : à créer sur [themoviedb.org](https://www.themoviedb.org/settings/api).

> ⚠️ Le fichier `.env` ne doit jamais être commité (il est dans `.gitignore`).

### 3. Lancer en local

```bash
ionic serve
```

### 4. Générer l'application Android

```bash
ionic build
ionic capacitor add android      # première fois uniquement
npx cap sync android
npx cap open android             # ouvre Android Studio pour lancer l'émulateur ou générer l'APK
```

## 🗄️ Modèle de données (Firestore)

```
users/{uid}
  firstName, lastName, age, email, photoURL
  role: "user" | "admin"
  isActive: true | false          ← désactivation, jamais de suppression
  favoriteMovieIds: [ ... ]       ← utilisé par le matching
  createdAt

movies/{movieId}                  ← films ajoutés par l'administrateur
  title, description, releaseDate, genre, posterURL, createdAt

playlists/{playlistId}
  ownerId, name, type, movieIds: [ ... ], createdAt
```

## 👤 Créer un compte administrateur

Pour des raisons de sécurité, aucun utilisateur ne peut se déclarer admin. Après avoir créé un compte via l'application, ouvre la console Firestore, document `users/{uid}`, et passe le champ `role` à `"admin"`.

## 🗺️ Avancement

- [x] Configuration (Firebase, TMDB, thème, navigation)
- [x] Splash et onboarding
- [x] Authentification, inscription, photo de profil (caméra)
- [x] Catalogue de films et détails
- [x] Playlists et favoris
- [ ] Matching entre utilisateurs (seuil 75 %)
- [ ] Profil complet
- [ ] Espace administrateur
- [ ] Règles de sécurité Firestore, tests sur appareil réel, build APK

## 🎨 Charte graphique

Police **Poppins**. Couleurs : primaire `#8B5CF6`, secondaire `#F59E0B`, accent `#F97316`, fond `#FAFAF7`, texte `#1F2937`.

## 📸 Captures d'écran

_À ajouter (dossier `docs/screenshots/`)._

## 👥 Auteurs

- _Prénom Nom_ (à compléter)

Projet réalisé dans le cadre du cours de **Développement mobile (Ionic)**.

## 📄 Licence

Projet académique. Les données de films proviennent de [TMDB](https://www.themoviedb.org/) ; ce produit utilise l'API TMDB mais n'est ni approuvé ni certifié par TMDB.
