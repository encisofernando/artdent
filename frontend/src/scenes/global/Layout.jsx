// src/scenes/global/Layout.jsx
import { useMemo, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar, { SIDEBAR_WIDTH, COLLAPSED_WIDTH } from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children, setIsAuthenticated }) {
  const theme   = useTheme();
  const mdDown  = useMediaQuery(theme.breakpoints.down("md"));
  const narrow  = useMediaQuery("(max-width: 900px)");
  const isMobile = mdDown || narrow;

  const [mobileOpen, setMobileOpen]   = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const leftOffset = useMemo(() => {
    if (isMobile) return 0;
    return isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  }, [isMobile, isCollapsed]);

  return (
    <Box sx={{ display: "flex", minHeight: "100vh" }}>
      <Sidebar
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
        isCollapsed={isCollapsed}
        setIsCollapsed={setIsCollapsed}
      />

      <Box
        sx={{
          flex: 1,
          minWidth: 0,
          ml: { xs: 0, md: `${leftOffset}px` },
          transition: "margin-left .22s cubic-bezier(.4,0,.2,1)",
          display: "flex",
          flexDirection: "column",
          minHeight: "100vh",
        }}
      >
        <Topbar
          setIsAuthenticated={setIsAuthenticated}
          onOpenSidebar={() => setMobileOpen(true)}
        />

        <Box
          component="main"
          sx={{
            flex: 1,
            p: { xs: 2, sm: 2.5, md: 3 },
            // Fondo ligeramente diferente al sidebar para dar profundidad
            bgcolor: "background.default",
          }}
        >
          {children}
        </Box>
      </Box>
    </Box>
  );
}