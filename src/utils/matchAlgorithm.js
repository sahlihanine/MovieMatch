import { MATCH_THRESHOLD, MIN_FAVORITES_FOR_MATCH } from "./constants";

/* Similarité de Jaccard entre deux listes de favoris */
export const computeMatch = (listA = [], listB = []) => {
  const a = new Set(listA.map(String));
  const b = new Set(listB.map(String));

  const common = [...a].filter((id) => b.has(id));
  const unionSize = new Set([...a, ...b]).size;

  const percentage = unionSize === 0 ? 0 : Math.round((common.length / unionSize) * 100);
  return { percentage, common };
};

/* Une liste est exploitable si elle contient assez de films */
export const canMatch = (list = []) => list.length >= MIN_FAVORITES_FOR_MATCH;

export const meetsThreshold = (percentage) => percentage >= MATCH_THRESHOLD;