// src/components/pwa/PWAInstallPrompt.jsx
//
// Muestra un banner/botón de "Instalar app" cuando el browser lo permite.
// En Android Chrome y Edge desktop aparece automáticamente el evento
// "beforeinstallprompt". En iOS Safari no existe ese evento; mostramos
// instrucciones manuales.
//
import { useEffect, useState } from "react";
import {
  Box, Button, IconButton, Typography, Stack, Slide, useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import InstallMobileIcon from "@mui/icons-material/InstallMobile";
import IosShareIcon      from "@mui/icons-material/IosShare";
import CloseIcon         from "@mui/icons-material/Close";
import DownloadIcon      from "@mui/icons-material/Download";

const B = { blue: "#397B9C", teal: "#49949C" };

const isIOS = () =>
  /iphone|ipad|ipod/i.test(navigator.userAgent) &&
  !(window.navigator.standalone); // standalone = ya instalado

const isInStandaloneMode = () =>
  window.matchMedia("(display-mode: standalone)").matches ||
  window.navigator.standalone === true;

export default function PWAInstallPrompt() {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [deferredPrompt, setDeferredPrompt] = useState(null);
  const [showAndroid, setShowAndroid]       = useState(false);
  const [showIOS, setShowIOS]               = useState(false);
  const [dismissed, setDismissed]           = useState(false);

  useEffect(() => {
    // Ya instalada → no mostrar nada
    if (isInStandaloneMode()) return;
    // Si el usuario ya descartó el banner en esta sesión → no molestar
    if (sessionStorage.getItem("pwa-prompt-dismissed")) return;

    if (isIOS()) {
      // iOS: no hay evento, mostramos instrucciones manuales
      setShowIOS(true);
      return;
    }

    // Android / Desktop Chrome, Edge
    const handler = (e) => {
      e.preventDefault();          // evitar el mini-infobar del browser
      setDeferredPrompt(e);
      setShowAndroid(true);
    };
    window.addEventListener("beforeinstallprompt", handler);

    // Si ya estaba instalando (appinstalled)
    window.addEventListener("appinstalled", () => {
      setShowAndroid(false);
      setDeferredPrompt(null);
    });

    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);

  const handleInstall = async () => {
    if (!deferredPrompt) return;
    deferredPrompt.prompt();
    const { outcome } = await deferredPrompt.userChoice;
    if (outcome === "accepted") setShowAndroid(false);
    setDeferredPrompt(null);
  };

  const dismiss = () => {
    setShowAndroid(false);
    setShowIOS(false);
    setDismissed(true);
    sessionStorage.setItem("pwa-prompt-dismissed", "1");
  };

  if (dismissed) return null;

  const bannerSx = {
    position: "fixed",
    bottom: 16,
    left: "50%",
    transform: "translateX(-50%)",
    zIndex: 9999,
    width: { xs: "calc(100% - 24px)", sm: 420 },
    borderRadius: "14px",
    p: "12px 14px",
    bgcolor: isDark ? "#172A36" : "#fff",
    border: `1px solid ${isDark ? "rgba(255,255,255,0.09)" : "rgba(0,0,0,0.08)"}`,
    boxShadow: "0 8px 32px rgba(0,0,0,0.22)",
  };

  // ── Android / Desktop ─────────────────────────────────────────────────────
  if (showAndroid) {
    return (
      <Slide direction="up" in>
        <Box sx={bannerSx}>
          <Stack direction="row" alignItems="center" spacing={1.5}>
            <Box sx={{
              width: 40, height: 40, borderRadius: "10px", flexShrink: 0,
              background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <DownloadIcon sx={{ color: "#fff", fontSize: 20 }} />
            </Box>
            <Box sx={{ flex: 1, minWidth: 0 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13.5, color: isDark ? "#E6EEF5" : "#1A202C" }}>
                Instalar ArtDent
              </Typography>
              <Typography sx={{ fontSize: 11.5, color: isDark ? "rgba(230,238,245,0.5)" : "rgba(26,32,44,0.5)" }}>
                Acceso rápido desde tu pantalla de inicio
              </Typography>
            </Box>
            <Button
              variant="contained"
              size="small"
              onClick={handleInstall}
              startIcon={<InstallMobileIcon sx={{ fontSize: "15px !important" }} />}
              sx={{
                background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
                color: "#fff", fontWeight: 700, fontSize: 12,
                textTransform: "none", borderRadius: "9px",
                boxShadow: `0 3px 10px ${alpha(B.blue, 0.4)}`,
                whiteSpace: "nowrap", flexShrink: 0,
                px: 1.5, py: 0.7,
              }}
            >
              Instalar
            </Button>
            <IconButton size="small" onClick={dismiss} sx={{ flexShrink: 0, p: 0.5 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>
      </Slide>
    );
  }

  // ── iOS: instrucciones manuales ───────────────────────────────────────────
  if (showIOS) {
    return (
      <Slide direction="up" in>
        <Box sx={bannerSx}>
          <Stack direction="row" alignItems="flex-start" spacing={1.5}>
            <Box sx={{
              width: 36, height: 36, borderRadius: "9px", flexShrink: 0, mt: 0.25,
              background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
              display: "flex", alignItems: "center", justifyContent: "center",
            }}>
              <IosShareIcon sx={{ color: "#fff", fontSize: 18 }} />
            </Box>
            <Box sx={{ flex: 1 }}>
              <Typography sx={{ fontWeight: 700, fontSize: 13, color: isDark ? "#E6EEF5" : "#1A202C", mb: 0.4 }}>
                Instalar en iPhone / iPad
              </Typography>
              <Typography sx={{ fontSize: 12, color: isDark ? "rgba(230,238,245,0.6)" : "rgba(26,32,44,0.6)", lineHeight: 1.5 }}>
                Tocá{" "}
                <IosShareIcon sx={{ fontSize: 12, verticalAlign: "middle", mx: 0.25 }} />
                {" "}Compartir y luego{" "}
                <strong style={{ color: B.blue }}>«Agregar a inicio»</strong>
              </Typography>
            </Box>
            <IconButton size="small" onClick={dismiss} sx={{ flexShrink: 0, p: 0.5 }}>
              <CloseIcon sx={{ fontSize: 16 }} />
            </IconButton>
          </Stack>
        </Box>
      </Slide>
    );
  }

  return null;
}