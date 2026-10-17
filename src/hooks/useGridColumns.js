import { useEffect, useState } from "react";

const DESKTOP_BREAKPOINT = 768; // même valeur que la media query de global.css

// largeur maximale de l'application, lue dans la variable CSS --app-max-width
const appMaxWidth = () => {
  const value = parseInt(
    getComputedStyle(document.documentElement).getPropertyValue("--app-max-width"),
    10
  );
  return Number.isFinite(value) ? value : 480;
};

// largeur réellement occupée par l'application (colonne centrée sur ordinateur)
const appWidth = () =>
  window.innerWidth >= DESKTOP_BREAKPOINT
    ? Math.min(window.innerWidth, appMaxWidth())
    : window.innerWidth;

const columnsFor = (width) => {
  if (width < 576) return 3;
  if (width < 768) return 4;
  if (width < 1024) return 6;
  return 8;
};

export const useGridColumns = () => {
  const [columns, setColumns] = useState(() => columnsFor(appWidth()));

  useEffect(() => {
    const onResize = () => setColumns(columnsFor(appWidth()));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return columns;
};