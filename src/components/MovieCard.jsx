import { IonCard, IonImg } from "@ionic/react";

const MovieCard = ({ title, posterUrl, subtitle, onClick }) => (
  <IonCard button onClick={onClick} style={{ margin: 6, width: 110 }}>
    <IonImg src={posterUrl} alt={title} style={{ height: 150, objectFit: "cover" }} />
    <div style={{ padding: "6px 8px" }}>
      <div style={{ fontSize: 12, fontWeight: 600 }}>{title}</div>
      {subtitle && <div className="caption">{subtitle}</div>}
    </div>
  </IonCard>
);

export default MovieCard;