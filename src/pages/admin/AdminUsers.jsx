import { useCallback, useState } from "react";
import {
  IonBadge, IonContent, IonItem, IonLabel, IonList, IonPage, IonRefresher,
  IonRefresherContent, IonSearchbar, IonSpinner, IonToggle,
  useIonAlert, useIonToast, useIonViewWillEnter,
} from "@ionic/react";
import AdminHeader from "../../components/AdminHeader";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { getAllUsers, setUserActive } from "../../services/adminService";
import { ROLES } from "../../utils/constants";

const AdminUsers = () => {
  const { user } = useAuth();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [search, setSearch] = useState("");
  const [rev, setRev] = useState(0); // force le toggle à se redessiner si l'admin annule

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      setUsers(await getAllUsers());
    } catch {
      setError("Unable to load users.");
    } finally {
      setLoading(false);
    }
  }, []);

  useIonViewWillEnter(() => { load(); }, [load]);

  // mise à jour optimiste, annulée si Firestore refuse
  const apply = async (target, next) => {
    const patch = (value) =>
      setUsers((list) => list.map((u) => (u.id === target.id ? { ...u, isActive: value } : u)));

    patch(next);
    try {
      await setUserActive(target.id, next);
      presentToast({
        message: `${target.firstName} ${next ? "reactivated" : "deactivated"}`,
        duration: 1500, color: next ? "success" : "medium", position: "top",
      });
    } catch {
      patch(!next);
      setRev((r) => r + 1);
      presentToast({ message: "Action failed", duration: 1800, color: "danger", position: "top" });
    }
  };

  const handleToggle = (target, next) => {
    if (next === target.isActive) return;
    if (next) return apply(target, true); // réactivation directe

    presentAlert({
      header: "Deactivate user",
      message: `${target.firstName} ${target.lastName} will no longer be able to log in or appear in matches. The account is kept and can be reactivated.`,
      buttons: [
        { text: "Cancel", role: "cancel" },
        { text: "Deactivate", role: "destructive", handler: () => { apply(target, false); } },
      ],
      // annulation ou clic hors de l'alerte : on remet le toggle dans son état réel
      onDidDismiss: (e) => { if (e.detail.role !== "destructive") setRev((r) => r + 1); },
    });
  };

  const needle = search.trim().toLowerCase();
  const filtered = users.filter((u) =>
    `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(needle)
  );

  return (
    <IonPage>
      <AdminHeader active="users" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <IonSearchbar
          debounce={300}
          placeholder="Search users..."
          onIonInput={(e) => setSearch(e.detail.value ?? "")}
        />

        <h3 style={{ margin: "0 16px 4px", fontWeight: 600 }}>Users ({users.length})</h3>

        {loading && <div style={{ textAlign: "center", padding: 32 }}><IonSpinner name="crescent" /></div>}
        {error && <p className="caption" style={{ textAlign: "center", padding: 16 }}>{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="caption" style={{ textAlign: "center", padding: 24 }}>No users found.</p>
        )}

        <IonList>
          {filtered.map((u) => {
            const isAdminAccount = u.role === ROLES.ADMIN;
            const isMe = u.id === user?.uid;
            return (
              <IonItem key={u.id} lines="full">
                <div slot="start">
                  <UserAvatar src={u.photoURL} name={`${u.firstName} ${u.lastName}`} size={44} />
                </div>
                <IonLabel>
                  <h3 style={{ fontWeight: 600 }}>
                    {u.firstName} {u.lastName}{" "}
                    {isAdminAccount && <IonBadge color="tertiary">Admin</IonBadge>}
                  </h3>
                  <p style={{ color: u.isActive ? "var(--ion-color-success)" : "var(--ion-color-medium)" }}>
                    {u.isActive ? "Active" : "Inactive"}
                  </p>
                  <p className="caption">{u.email}</p>
                </IonLabel>
                <IonToggle
                  key={`${u.id}-${rev}`}
                  slot="end"
                  color="tertiary"
                  checked={u.isActive}
                  // un admin ne peut pas se désactiver lui-même ni désactiver un autre admin
                  disabled={isMe || isAdminAccount}
                  onIonChange={(e) => handleToggle(u, e.detail.checked)}
                />
              </IonItem>
            );
          })}
        </IonList>
      </IonContent>
    </IonPage>
  );
};

export default AdminUsers;