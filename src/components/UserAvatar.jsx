import { IonAvatar } from "@ionic/react";

const UserAvatar = ({ src, name = "", size = 48 }) => {
  const initials = name
    .split(" ")
    .map((p) => p[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <IonAvatar style={{ width: size, height: size }}>
      {src ? (
        <img src={src} alt={name} />
      ) : (
        <div
          style={{
            width: "100%", height: "100%", display: "flex",
            alignItems: "center", justifyContent: "center",
            background: "var(--ion-color-tertiary)", color: "#fff", fontWeight: 600,
          }}
        >
          {initials || "?"}
        </div>
      )}
    </IonAvatar>
  );
};

export default UserAvatar;