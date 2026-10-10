import { IonChip, IonLabel } from "@ionic/react";
import { MOVIE_CATEGORIES } from "../utils/constants";

const CategoryChips = ({ value, onChange }) => (
  <div style={{ display: "flex", gap: 4, overflowX: "auto", padding: "4px 12px" }}>
    {MOVIE_CATEGORIES.map((c) => (
      <IonChip
        key={c.key}
        color="tertiary"
        outline={value !== c.key}
        onClick={() => onChange(c.key)}
      >
        <IonLabel>{c.label}</IonLabel>
      </IonChip>
    ))}
  </div>
);

export default CategoryChips;