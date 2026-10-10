import { IonCard, IonIcon } from "@ionic/react";
import { closeCircle, heart, heartOutline } from "ionicons/icons";

const overlay = {
  position: "absolute", top: 6, right: 6, zIndex: 2,
  width: 28, height: 28, borderRadius: "50%",
  background: "rgba(0,0,0,0.45)", display: "grid", placeItems: "center",
};

const MovieCard = ({
  title, posterUrl, subtitle, onClick, width = 110, fluid = false,
  isFavorite, onToggleFavorite, onRemove,
}) => {
  const stop = (fn) => (e) => { e.stopPropagation(); fn(); };

  return (
    <IonCard
      style={{
        margin: fluid ? 0 : 6,
        width: fluid ? "100%" : width,
        flex: "0 0 auto",
        position: "relative",
      }}
    >
      {onToggleFavorite && (
        <div style={overlay} onClick={stop(onToggleFavorite)}>
          <IonIcon icon={isFavorite ? heart : heartOutline} style={{ color: isFavorite ? "#f97316" : "#fff", fontSize: 16 }} />
        </div>
      )}
      {onRemove && (
        <div style={overlay} onClick={stop(onRemove)}>
          <IonIcon icon={closeCircle} style={{ color: "#fff", fontSize: 18 }} />
        </div>
      )}

      <div onClick={onClick} style={{ cursor: "pointer" }}>
        <img
          src={posterUrl}
          alt={title}
          loading="lazy"
          style={{ width: "100%", aspectRatio: "2 / 3", objectFit: "cover", display: "block" }}
        />
        <div style={{ padding: "6px 8px" }}>
          <div style={{
            fontSize: 12, fontWeight: 600, lineHeight: 1.2,
            display: "-webkit-box", WebkitLineClamp: 2, WebkitBoxOrient: "vertical", overflow: "hidden",
          }}>
            {title}
          </div>
          {subtitle && <div className="caption" style={{ fontSize: 11 }}>{subtitle}</div>}
        </div>
      </div>
    </IonCard>
  );
};

export default MovieCard;