import { useHistory } from "react-router-dom";
import {
  IonButton, IonButtons, IonHeader, IonIcon, IonLabel,
  IonSegment, IonSegmentButton, IonTitle, IonToolbar,
} from "@ionic/react";
import { logOutOutline } from "ionicons/icons";
import { logoutUser } from "../services/authService";

// active : "users" | "movies" | "add-movie"
const AdminHeader = ({ active }) => {
  const history = useHistory();

  const logout = async () => {
    await logoutUser();
    history.replace("/login");
  };

  return (
    <IonHeader className="ion-no-border">
      <IonToolbar>
        <IonTitle>Admin Panel</IonTitle>
        <IonButtons slot="end">
          <IonButton onClick={logout} aria-label="Log out">
            <IonIcon slot="icon-only" icon={logOutOutline} />
          </IonButton>
        </IonButtons>
      </IonToolbar>
      <IonToolbar>
        <IonSegment
          value={active}
          onIonChange={(e) => {
            if (e.detail.value !== active) history.replace(`/admin/${e.detail.value}`);
          }}
        >
          <IonSegmentButton value="users"><IonLabel>Users</IonLabel></IonSegmentButton>
          <IonSegmentButton value="movies"><IonLabel>Movies</IonLabel></IonSegmentButton>
          <IonSegmentButton value="add-movie"><IonLabel>Add Movie</IonLabel></IonSegmentButton>
        </IonSegment>
      </IonToolbar>
    </IonHeader>
  );
};

export default AdminHeader;