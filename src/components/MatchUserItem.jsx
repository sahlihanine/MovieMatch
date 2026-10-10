import { IonButton, IonItem, IonLabel } from "@ionic/react";
import UserAvatar from "./UserAvatar";

const MatchUserItem = ({ user, onView }) => (
  <IonItem lines="full">
    <div slot="start">
      <UserAvatar src={user.photoURL} name={`${user.firstName} ${user.lastName}`} size={48} />
    </div>
    <IonLabel>
      <h3 style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</h3>
      <p className="caption">
        {user.commonIds.length} common movie{user.commonIds.length > 1 ? "s" : ""}
      </p>
    </IonLabel>
    <div slot="end" style={{ textAlign: "center" }}>
      <div style={{ color: "var(--ion-color-tertiary)", fontWeight: 700 }}>{user.percentage}%</div>
      <IonButton size="small" fill="outline" color="tertiary" shape="round" onClick={onView}>
        View profile
      </IonButton>
    </div>
  </IonItem>
);

export default MatchUserItem;