import { useEffect, useState } from "react";
import { useTheme, useMediaQuery } from "@mui/material";

/**
 * Devuelve el ancho actual del sidebar (pro-sidebar) para compensar el layout en desktop.
 * En pantallas mdDown devuelve 0 (drawer).
 */
export default function useSidebarWidth() {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));
  const [sidebarW, setSidebarW] = useState(0);

  useEffect(() => {
    if (mdDown) {
      setSidebarW(0);
      return;
    }

    const el = document.querySelector(".pro-sidebar");
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement;
    if (!sideBox) {
      setSidebarW(0);
      return;
    }

    const update = () =>
      setSidebarW(sideBox.offsetWidth || sideBox.getBoundingClientRect?.().width || 0);

    update();

    const ro = new ResizeObserver(update);
    ro.observe(sideBox);

    window.addEventListener("resize", update);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", update);
    };
  }, [mdDown]);

  return sidebarW;
}
