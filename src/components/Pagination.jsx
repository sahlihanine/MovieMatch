import { IonButton, IonIcon } from "@ionic/react";
import { chevronBack, chevronForward } from "ionicons/icons";

// pages affichées : première, dernière, page courante et ses voisines, avec des "…" entre les trous
const getPageItems = (current, total) => {
  const pages = [...new Set([1, total, current - 1, current, current + 1])]
    .filter((p) => p >= 1 && p <= total)
    .sort((a, b) => a - b);

  const items = [];
  let prev = 0;
  for (const p of pages) {
    if (p - prev === 2) items.push(prev + 1);      // un seul trou : on affiche la page
    else if (p - prev > 2) items.push("gap");      // plusieurs pages cachées : "…"
    items.push(p);
    prev = p;
  }
  return items;
};

const btn = { minWidth: 36, margin: 0, "--padding-start": "6px", "--padding-end": "6px" };

const Pagination = ({ page, totalPages, onChange }) => {
  if (totalPages <= 1) return null;

  return (
    <nav
      aria-label="Pagination"
      style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 2, padding: "8px 8px 28px" }}
    >
      <IonButton size="small" fill="clear" color="tertiary" style={btn}
        disabled={page <= 1} onClick={() => onChange(page - 1)} aria-label="Previous page">
        <IonIcon slot="icon-only" icon={chevronBack} />
      </IonButton>

      {getPageItems(page, totalPages).map((item, i) =>
        item === "gap" ? (
          <span key={`gap-${i}`} className="caption" style={{ padding: "0 2px" }}>…</span>
        ) : (
          <IonButton
            key={item}
            size="small"
            color="tertiary"
            fill={item === page ? "solid" : "clear"}
            style={btn}
            onClick={() => item !== page && onChange(item)}
            aria-current={item === page ? "page" : undefined}
          >
            {item}
          </IonButton>
        )
      )}

      <IonButton size="small" fill="clear" color="tertiary" style={btn}
        disabled={page >= totalPages} onClick={() => onChange(page + 1)} aria-label="Next page">
        <IonIcon slot="icon-only" icon={chevronForward} />
      </IonButton>
    </nav>
  );
};

export default Pagination;