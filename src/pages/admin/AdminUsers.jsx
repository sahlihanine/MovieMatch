import { useCallback, useMemo, useState } from "react";
import {
  IonBadge, IonButton, IonChip, IonContent, IonItem, IonLabel, IonList, IonPage,
  IonRefresher, IonRefresherContent, IonSearchbar, IonSelect, IonSelectOption,
  IonSpinner, IonToggle, useIonAlert, useIonToast, useIonViewWillEnter,
} from "@ionic/react";
import AdminHeader from "../../components/AdminHeader";
import UserAvatar from "../../components/UserAvatar";
import { useAuth } from "../../hooks/useAuth";
import { getAllUsers, setUserActive } from "../../services/adminService";
import { ROLES } from "../../utils/constants";

const STATUS_FILTERS = [
  { key: "all", label: "All" },
  { key: "active", label: "Active" },
  { key: "inactive", label: "Inactive" },
];
const PERIODS = [
  { value: "all", label: "Any time", days: null },
  { value: "7", label: "Last 7 days", days: 7 },
  { value: "30", label: "Last 30 days", days: 30 },
  { value: "90", label: "Last 90 days", days: 90 },
];
const SORTS = [
  { value: "newest", label: "Newest first" },
  { value: "oldest", label: "Oldest first" },
  { value: "name", label: "Name (A-Z)" },
];

const timeOf = (u) => (u.createdAt?.seconds ?? 0) * 1000;
const formatDate = (u) => (u.createdAt?.seconds ? new Date(timeOf(u)).toLocaleDateString() : "unknown");

const AdminUsers = () => {
  const { user } = useAuth();
  const [presentAlert] = useIonAlert();
  const [presentToast] = useIonToast();

  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [rev, setRev] = useState(0); // force le toggle à se redessiner si l'admin annule

  // filtres
  const [search, setSearch] = useState("");
  const [status, setStatus] = useState("all");
  const [period, setPeriod] = useState("all");
  const [sort, setSort] = useState("newest");

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

  const filtered = useMemo(() => {
    const needle = search.trim().toLowerCase();
    const days = PERIODS.find((p) => p.value === period)?.days;
    const cutoff = days ? Date.now() - days * 86400000 : null;

    return users
      .filter((u) => `${u.firstName} ${u.lastName} ${u.email}`.toLowerCase().includes(needle))
      .filter((u) => status === "all" || (status === "active" ? u.isActive === true : u.isActive === false))
      .filter((u) => cutoff === null || timeOf(u) >= cutoff)
      .sort((a, b) => {
        if (sort === "name") {
          return `${a.firstName} ${a.lastName}`.localeCompare(`${b.firstName} ${b.lastName}`);
        }
        return sort === "oldest" ? timeOf(a) - timeOf(b) : timeOf(b) - timeOf(a);
      });
  }, [users, search, status, period, sort]);

  const hasFilters = status !== "all" || period !== "all" || search.trim() !== "";
  const resetFilters = () => {
    setSearch("");
    setStatus("all");
    setPeriod("all");
  };

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

  return (
    <IonPage>
      <AdminHeader active="users" />

      <IonContent>
        <IonRefresher slot="fixed" onIonRefresh={async (e) => { await load(); e.detail.complete(); }}>
          <IonRefresherContent />
        </IonRefresher>

        <IonSearchbar
          value={search}
          debounce={300}
          placeholder="Search users..."
          onIonInput={(e) => setSearch(e.detail.value ?? "")}
        />

        {/* filtre par statut */}
        <div style={{ display: "flex", gap: 4, padding: "0 12px", overflowX: "auto" }}>
          {STATUS_FILTERS.map((f) => (
            <IonChip key={f.key} color="tertiary" outline={status !== f.key} onClick={() => setStatus(f.key)}>
              <IonLabel>{f.label}</IonLabel>
            </IonChip>
          ))}
        </div>

        {/* filtre par date d'inscription + tri */}
        <div style={{ display: "flex", gap: 8, padding: "8px 12px" }}>
          <IonSelect
            style={{ flex: 1 }} label="Registered" labelPlacement="stacked" fill="outline"
            interface="popover" value={period} onIonChange={(e) => setPeriod(e.detail.value)}
          >
            {PERIODS.map((p) => <IonSelectOption key={p.value} value={p.value}>{p.label}</IonSelectOption>)}
          </IonSelect>
          <IonSelect
            style={{ flex: 1 }} label="Sort by" labelPlacement="stacked" fill="outline"
            interface="popover" value={sort} onIonChange={(e) => setSort(e.detail.value)}
          >
            {SORTS.map((s) => <IonSelectOption key={s.value} value={s.value}>{s.label}</IonSelectOption>)}
          </IonSelect>
        </div>

        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px" }}>
          <h3 style={{ margin: "4px 0", fontWeight: 600 }}>
            Users ({filtered.length}{filtered.length !== users.length ? ` of ${users.length}` : ""})
          </h3>
          {hasFilters && (
            <IonButton size="small" fill="clear" color="tertiary" onClick={resetFilters}>
              Reset filters
            </IonButton>
          )}
        </div>

        {loading && <div style={{ textAlign: "center", padding: 32 }}><IonSpinner name="crescent" /></div>}
        {error && <p className="caption" style={{ textAlign: "center", padding: 16 }}>{error}</p>}
        {!loading && !error && filtered.length === 0 && (
          <p className="caption" style={{ textAlign: "center", padding: 24 }}>
            {users.length === 0 ? "No users found." : "No users match your filters."}
          </p>
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
                  <p className="caption">Joined {formatDate(u)}</p>
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