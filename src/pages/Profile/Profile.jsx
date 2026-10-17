import { useState } from "react";
import { useHistory } from "react-router-dom";
import {
  IonContent, IonHeader, IonIcon, IonItem, IonLabel, IonList, IonPage,
  IonSpinner, IonTitle, IonToolbar, useIonAlert, useIonViewWillEnter,
} from "@ionic/react";
import {
  createOutline, heartOutline, helpCircleOutline, listOutline, logOutOutline,
} from "ionicons/icons";
import EditProfileModal from "../../components/EditProfileModal";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { usePlaylists } from "../../hooks/usePlaylists";
import { logoutUser } from "../../services/authService";
import { findMatches } from "../../services/matchService";

const Stat = ({ value, label, divider }) => (
  <div
    style={{
      textAlign: "center", flex: 1, padding: "4px 0",
      borderRight: divider ? "1px solid rgba(31,41,55,0.08)" : "none",
    }}
  >
    <div style={{ fontSize: 22, fontWeight: 700, color: "var(--ion-color-tertiary)" }}>{value}</div>
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

  const fullName = `${profile.firstName} ${profile.lastName}`;

  const items = [
    { icon: listOutline, label: "My Playlist", action: () => history.push("/app/playlist") },
    { icon: heartOutline, label: "My Matches", action: () => history.push("/app/match") },
    { icon: createOutline, label: "Edit profile", action: () => setEditOpen(true) },
    { icon: helpCircleOutline, label: "Help & Support", action: showHelp },
    { icon: logOutOutline, label: "Log Out", action: confirmLogout, danger: true },
  ];

  return (
    <IonPage>
      <IonHeader className="ion-no-border">
        <IonToolbar style={{ "--background": "var(--ion-color-tertiary)", "--color": "#fff" }}>
          <IonTitle>Profile</IonTitle>
        </IonToolbar>
      </IonHeader>

      <IonContent>
        {/* bandeau orange avec la photo */}
        <div
          style={{
            background: "linear-gradient(180deg, var(--ion-color-tertiary) 0%, var(--ion-color-secondary) 100%)",
            padding: "8px 16px 64px",
            textAlign: "center",
            color: "#fff",
          }}
        >
          <div
            style={{
              display: "inline-block", borderRadius: "50%", overflow: "hidden",
              border: "4px solid #fff", background: "#fff",
              boxShadow: "0 8px 24px rgba(0,0,0,0.18)",
            }}
          >
            <UserAvatar src={profile.photoURL} name={fullName} size={96} />
          </div>
          <h2 style={{ margin: "12px 0 0", color: "#fff" }}>{fullName}</h2>
          {profile.age ? (
            <p style={{ margin: "2px 0 0", fontSize: 14, color: "rgba(255,255,255,0.9)" }}>
              {profile.age} years old
            </p>
          ) : null}
        </div>

        {/* statistiques : carte blanche qui chevauche le bandeau */}
        <div
          style={{
            display: "flex", background: "#fff", borderRadius: 16,
            margin: "-40px 16px 0", padding: "14px 4px",
            boxShadow: "0 6px 20px rgba(31,41,55,0.10)",
          }}
        >
          <Stat value={profile.favoriteMovieIds?.length ?? 0} label="Favorites" divider />
          <Stat value={playlists.length} label="Playlists" divider />
          <Stat value={matchCount ?? "–"} label="Matches" />
        </div>

        {/* menu */}
        <IonList
          lines="none"
          style={{
            margin: "16px 16px 24px", padding: 0, borderRadius: 16, overflow: "hidden",
            boxShadow: "0 2px 12px rgba(31,41,55,0.06)",
          }}
        >
          {items.map((it, i) => (
            <IonItem
              key={it.label}
              button
              detail
              lines={i === items.length - 1 ? "none" : "full"}
              onClick={it.action}
            >
              <div
                slot="start"
                style={{
                  width: 38, height: 38, borderRadius: 12, display: "grid", placeItems: "center",
                  marginInlineEnd: 14,
                  background: it.danger ? "rgba(235,68,90,0.12)" : "rgba(249,115,22,0.12)",
                }}
              >
                <IonIcon
                  icon={it.icon}
                  style={{
                    fontSize: 20,
                    color: it.danger ? "var(--ion-color-danger)" : "var(--ion-color-tertiary)",
                  }}
                />
              </div>
              <IonLabel color={it.danger ? "danger" : undefined}>{it.label}</IonLabel>
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