// src/scenes/global/Layout.jsx
import { useMemo, useState } from "react";
import { Box, useMediaQuery, useTheme } from "@mui/material";
import Sidebar, { SIDEBAR_WIDTH, COLLAPSED_WIDTH } from "./Sidebar";
import Topbar from "./Topbar";

export default function Layout({ children, setIsAuthenticated }) {
  const theme = useTheme();
  const mdDown = useMediaQuery(theme.breakpoints.down("md"));

  const [mobileOpen, setMobileOpen] = useState(false);
  const [isCollapsed, setIsCollapsed] = useState(false);

  const leftOffset = useMemo(() => {
    if (mdDown) return 0;
    return isCollapsed ? COLLAPSED_WIDTH : SIDEBAR_WIDTH;
  }, [mdDown, isCollapsed]);

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
          transition: "margin-left .2s ease",
        }}
      >
        <Topbar
          setIsAuthenticated={setIsAuthenticated}
          onOpenSidebar={() => setMobileOpen(true)}
        />

        <Box component="main" sx={{ p: { xs: 2, md: 3 } }}>
          {children}
        </Box>
      </Box>
    </Box>
  );
}