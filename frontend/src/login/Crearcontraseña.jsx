// src/pages/ForgotPassword.jsx
//
// Assets requeridos — copiar a src/assets/:
//   logo-artdent-color.png    →  "logo ART DENT.png"
//
import React, { useState } from "react";
import {
  Box, TextField, Button, Typography, Link, InputAdornment,
} from "@mui/material";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import { Auth } from "../services";

import logoColor from "../assets/logo-artdent-color.png";

/* ─── Brand tokens ─── */
const C = {
  blue:     "#397B9C",
  green:    "#5AAD9C",
  mint:     "#ACD6CE",
  teal:     "#49949C",
  blueSoft: "#7CA5C3",
};

export default function ForgotPassword() {
  const [email, setEmail]     = useState("");
  const [msg, setMsg]         = useState("");
  const [error, setError]     = useState("");
  const [loading, setLoading] = useState(false);
  const sent = !!msg;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email) return;
    setMsg(""); setError(""); setLoading(true);
    try {
      const res = await Auth.requestPasswordReset(email);
      setMsg(res?.message || "Si el correo existe, te enviamos un enlace para restablecer la contraseña.");
    } catch (err) {
      setError(err?.response?.data?.message || "No pudimos procesar tu solicitud.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Montserrat', sans-serif",
      background: "linear-gradient(180deg, #0e1a24 0%, #111f2c 100%)",
      justifyContent: "center",
      alignItems: "center",
      px: 3,
    }}>
      {/* Ambient glow */}
      <Box sx={{
        position: "fixed", top: "15%", left: "50%",
        transform: "translateX(-50%)",
        width: 520, height: 320,
        background: `radial-gradient(ellipse, rgba(57,123,156,0.1) 0%, transparent 70%)`,
        pointerEvents: "none",
      }}/>

      <Box sx={{ width: "100%", maxWidth: 420, position: "relative", zIndex: 1 }}>
        {/* Logo */}
        <Box sx={{ mb: 4.5 }}>
          <img src={logoColor} alt="ArtDent" style={{ height: 52, width: "auto" }} />
        </Box>

        {/* Back */}
        <Link href="/" underline="none" sx={{
          display: "inline-flex", alignItems: "center", gap: 0.75,
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "0.82rem", fontWeight: 500,
          color: "rgba(255,255,255,0.38)", mb: 3.5,
          "&:hover": { color: C.mint }, transition: "color .2s",
        }}>
          <ArrowBackIcon sx={{ fontSize: 15 }}/>
          Volver al inicio de sesión
        </Link>

        {/* Card */}
        <Box sx={{
          background: "rgba(255,255,255,0.03)",
          border: "1px solid rgba(255,255,255,0.07)",
          borderRadius: "16px",
          p: { xs: "32px 24px", sm: "40px 40px" },
        }}>
          {!sent ? (
            <>
              {/* Icon badge */}
              <Box sx={{
                width: 50, height: 50, borderRadius: "14px",
                background: `linear-gradient(135deg, rgba(57,123,156,0.18), rgba(90,173,156,0.18))`,
                border: `1px solid rgba(57,123,156,0.28)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                mb: 3,
              }}>
                <MailOutlineIcon sx={{ color: C.mint, fontSize: 22 }}/>
              </Box>

              <Typography sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700, fontSize: "1.5rem", color: "#fff",
                mb: 0.75, letterSpacing: "-0.01em",
              }}>
                Recuperar contraseña
              </Typography>
              <Typography sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "0.875rem", color: "rgba(255,255,255,0.4)",
                mb: 3.5, lineHeight: 1.7,
              }}>
                Ingresá tu correo y te enviaremos un enlace para restablecer tu contraseña.
              </Typography>

              {error && (
                <Box sx={{
                  background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.25)",
                  borderRadius: "10px", px: 2, py: 1.5, mb: 2.5,
                }}>
                  <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.85rem", color: "#ef9090" }}>
                    {error}
                  </Typography>
                </Box>
              )}

              <Box component="form" onSubmit={handleSubmit} noValidate>
                <TextField
                  fullWidth required
                  id="email" name="email" label="Correo electrónico"
                  value={email} onChange={(e) => setEmail(e.target.value)}
                  autoComplete="email" autoFocus
                  placeholder="email@artdent.com.ar"
                  InputLabelProps={{ shrink: true }}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <MailOutlineIcon sx={{ fontSize: 18, color: "rgba(255,255,255,0.35)" }}/>
                      </InputAdornment>
                    ),
                  }}
                  sx={{
                    mb: 3,
                    "& .MuiInputLabel-root": {
                      fontFamily: "'Montserrat', sans-serif", fontSize: "0.85rem",
                      color: "rgba(255,255,255,0.5)",
                      "&.Mui-focused": { color: C.mint },
                    },
                    "& .MuiInputBase-input": {
                      fontFamily: "'Montserrat', sans-serif", fontSize: "0.95rem", color: "#fff",
                      "&::placeholder": { color: "rgba(255,255,255,0.25)", opacity: 1 },
                    },
                    "& .MuiOutlinedInput-root": {
                      borderRadius: "10px",
                      "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
                      "&:hover fieldset": { borderColor: "rgba(255,255,255,0.28)" },
                      "&.Mui-focused fieldset": { borderColor: C.blueSoft, borderWidth: "1.5px" },
                      background: "rgba(255,255,255,0.04)",
                    },
                  }}
                />

                <Button
                  type="submit" fullWidth variant="contained"
                  disabled={loading || !email}
                  sx={{
                    background: email ? `linear-gradient(90deg, ${C.blue}, ${C.teal})` : "rgba(255,255,255,0.07)",
                    color: email ? "#fff" : "rgba(255,255,255,0.2)",
                    fontFamily: "'Montserrat', sans-serif",
                    fontWeight: 700, fontSize: "0.9rem",
                    letterSpacing: "0.05em", textTransform: "uppercase",
                    py: 1.5, borderRadius: "10px",
                    boxShadow: email ? `0 8px 24px rgba(57,123,156,0.3)` : "none",
                    "&:hover": {
                      background: email ? `linear-gradient(90deg, ${C.teal}, ${C.green})` : "rgba(255,255,255,0.07)",
                      boxShadow: email ? `0 8px 28px rgba(90,173,156,0.4)` : "none",
                    },
                    "&.Mui-disabled": { background: "rgba(255,255,255,0.06)", color: "rgba(255,255,255,0.18)" },
                    transition: "all .3s ease",
                  }}
                >
                  {loading ? "Enviando..." : "Enviar enlace de recuperación"}
                </Button>
              </Box>
            </>
          ) : (
            /* ── Estado de éxito ── */
            <Box sx={{ textAlign: "center", py: 2 }}>
              <Box sx={{
                width: 62, height: 62, borderRadius: "50%",
                background: `linear-gradient(135deg, rgba(90,173,156,0.14), rgba(57,123,156,0.14))`,
                border: `1px solid rgba(90,173,156,0.3)`,
                display: "flex", alignItems: "center", justifyContent: "center",
                mx: "auto", mb: 3,
              }}>
                <CheckCircleOutlineIcon sx={{ color: C.green, fontSize: 28 }}/>
              </Box>
              <Typography sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700, fontSize: "1.35rem", color: "#fff", mb: 1.5,
              }}>
                ¡Correo enviado!
              </Typography>
              <Typography sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "0.9rem", color: "rgba(255,255,255,0.45)",
                lineHeight: 1.75, mb: 3.5, maxWidth: 300, mx: "auto",
              }}>
                {msg}
              </Typography>
              <Button href="/" variant="outlined" sx={{
                color: C.mint, borderColor: "rgba(90,173,156,0.32)",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 600, fontSize: "0.88rem",
                py: 1.2, px: 4, borderRadius: "10px",
                "&:hover": { borderColor: C.mint, background: "rgba(90,173,156,0.07)" },
                transition: "all .2s ease",
              }}>
                Volver al inicio de sesión
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
}