import { useEffect, useState } from "react";

const columnsFor = (width) => {
  if (width < 576) return 3;
  if (width < 768) return 4;
  if (width < 1024) return 6;
  return 8;
};

export const useGridColumns = () => {
  const [columns, setColumns] = useState(() => columnsFor(window.innerWidth));

  useEffect(() => {
    const onResize = () => setColumns(columnsFor(window.innerWidth));
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  return columns;
};