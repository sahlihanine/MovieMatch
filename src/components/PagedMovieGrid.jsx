import { Fragment, useEffect, useMemo, useState } from "react";
import { IonSkeletonText } from "@ionic/react";
import Pagination from "./Pagination";
import { getMoviesByIds } from "../services/movieService";

// cache partagé entre toutes les grilles : un film déjà chargé n'est jamais redemandé
const cache = new Map();

/*
  Grille paginée à partir d'une liste d'ids de films.
  columns : nombre de colonnes (= films par ligne), rows : lignes par page.
  Seuls les films de la page affichée sont chargés.
*/
const PagedMovieGrid = ({ ids, columns, rows = 2, renderCard }) => {
  const pageSize = columns * rows;
  const totalPages = Math.max(1, Math.ceil(ids.length / pageSize));

  const [requestedPage, setPage] = useState(1);
  const page = Math.min(requestedPage, totalPages); // reste valide si la liste raccourcit

  const pageIds = useMemo(
    () => ids.slice((page - 1) * pageSize, page * pageSize),
    [ids, page, pageSize]
  );

  const [settledKey, setSettledKey] = useState("");
  const missingKey = pageIds.filter((id) => !cache.has(id)).join(",");

  useEffect(() => {
    if (!missingKey) return;
    getMoviesByIds(missingKey.split(","))
      .then((list) => list.forEach((m) => cache.set(m.id, m)))
      .finally(() => setSettledKey(missingKey));
  }, [missingKey]);

  return (
    <>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: `repeat(${columns}, minmax(0, 1fr))`,
          gap: 12,
        }}
      >
        {pageIds.map((id) => {
          const movie = cache.get(id);
          if (movie) return <Fragment key={id}>{renderCard(movie)}</Fragment>;
          // squelette tant que ce film est en cours de chargement
          if (settledKey !== missingKey) {
            return (
              <IonSkeletonText
                key={id}
                animated
                style={{ width: "100%", aspectRatio: "2 / 3", margin: 0, borderRadius: 12 }}
              />
            );
          }
          return null; // film introuvable : on l'ignore
        })}
      </div>

      <Pagination page={page} totalPages={totalPages} onChange={setPage} />
    </>
  );
};

export default PagedMovieGrid;