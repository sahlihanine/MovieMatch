import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonButton, IonButtons, IonContent, IonHeader, IonIcon, IonItem, IonLabel,
  IonList, IonPage, IonSpinner, IonTitle, IonToolbar, useIonAlert, useIonViewWillEnter,
} from "@ionic/react";
import {
  addCircleOutline, heartOutline, helpCircleOutline, listOutline, logOutOutline,
  peopleOutline, settingsOutline, shieldCheckmarkOutline,
} from "ionicons/icons";
import EditProfileModal from "../../components/EditProfileModal";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { usePlaylists } from "../../hooks/usePlaylists";
import { logoutUser } from "../../services/authService";
import { findMatches } from "../../services/matchService";
import { ROLES } from "../../utils/constants";

const Stat = ({ value, label }) => (
  <div style={{ textAlign: "center", flex: 1 }}>
    <div style={{ fontSize: 22, fontWeight: 700 }}>{value}</div>
    <div className="caption">{label}</div>
  </div>
);

const Profile = () => {
  const history = useHistory();
  const { user, profile } = useAuth();
  const { playlists } = usePlaylists();
  const [presentAlert] = useIonAlert();

  const [editOpen, setEditOpen] = useState(false);
  const [matchCount, setMatchCount] = useState(null);

  // nombre de matchs, recalculé à chaque retour sur l'onglet
  useIonViewWillEnter(() => {
    if (!user || !profile) return;
    findMatches(user.uid, profile.favoriteMovieIds ?? [])
      .then((m) => setMatchCount(m.length))
      .catch(() => setMatchCount(null));
  }, [user, profile]);

  const confirmLogout = () =>
    presentAlert({
      header: "Log out",
      message: "Are you sure you want to log out?",
      buttons: [
        { text: "Cancel", role: "cancel" },
        {
          text: "Log out",
          role: "destructive",
          handler: async () => {
            await logoutUser();
            history.replace("/login");
          },
        },
      ],
    });

  const showHelp = () =>
    presentAlert({
      header: "Help & Support",
      message: "MovieMatch finds users whose favorite movies match yours. Add favorites with the heart icon, then open the Match tab. Need help? Contact an administrator.",
      buttons: ["OK"],
    });

  if (!profile) {
    return (
      <IonPage>
        <IonContent><div style={{ textAlign: "center", padding: 48 }}><IonSpinner name="crescent" /></div></IonContent>
      </IonPage>
    );
  }

  const isAdmin = profile.role === ROLES.ADMIN;
  const fullName = `${profile.firstName} ${profile.lastName}`;

  const items = [
    { icon: listOutline, label: "My Playlist", action: () => history.push("/app/playlist") },
    { icon: heartOutline, label: "My Matches", action: () => history.push("/app/match") },
    { icon: settingsOutline, label: "Settings", action: () => setEditOpen(true) },
    { icon: helpCircleOutline, label: "Help & Support", action: showHelp },
    ...(isAdmin
      ? [
          { icon: shieldCheckmarkOutline, label: "Admin: manage users", action: () => history.push("/admin/users") },
          { icon: addCircleOutline, label: "Admin: add movie", action: () => history.push("/admin/add-movie") },
        ]
      : []),
    { icon: logOutOutline, label: "Log Out", action: confirmLogout, color: "danger" },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar>
          <IonTitle>Profile</IonTitle>
          <IonButtons slot="end">
            <IonButton onClick={() => setEditOpen(true)}>
              <IonIcon slot="icon-only" icon={settingsOutline} />
            </IonButton>
          </IonButtons>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        <div style={{ textAlign: "center", padding: "16px 16px 8px" }}>
          <div style={{ display: "inline-block" }}>
            <UserAvatar src={profile.photoURL} name={fullName} size={96} />
          </div>
          <h2 style={{ margin: "12px 0 0" }}>{fullName}</h2>
          <p className="caption" style={{ margin: 0 }}>
            {profile.age ? `${profile.age} years old` : ""}
            {isAdmin && (profile.age ? " · Admin" : "Admin")}
          </p>
        </div>

        <div style={{ display: "flex", padding: "12px 16px 20px" }}>
          <Stat value={profile.favoriteMovieIds?.length ?? 0} label="Favorites" />
          <Stat value={playlists.length} label="Playlists" />
          <Stat value={matchCount ?? "–"} label="Matches" />
        </div>

        <IonList lines="full">
          {items.map((it) => (
            <IonItem key={it.label} button detail onClick={it.action}>
              <IonIcon slot="start" icon={it.icon} color={it.color} />
              <IonLabel color={it.color}>{it.label}</IonLabel>
            </IonItem>
          ))}
        </IonList>

        <EditProfileModal
          isOpen={editOpen}
          onClose={() => setEditOpen(false)}
          uid={user?.uid}
          profile={profile}
        />
      </IonContent>
    </IonPage>
  );
};

export default Profile;