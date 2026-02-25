// src/pages/Login.jsx
//
// Assets requeridos — copiar a src/assets/:
//   logo-artdent-blanco.png   →  "logo ART DENT (blanco trans).png"
//   logo-artdent-color.png    →  "logo ART DENT.png"
//
import React, { useState, useEffect } from "react";
import {
  Box, TextField, Button, Typography, Checkbox,
  FormControlLabel, Link, InputAdornment, IconButton,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import { Auth } from "../services";

import logoBlanco from "../assets/logo-artdent-blanco.png";
import logoColor  from "../assets/logo-artdent-color.png";

/* ─── Brand tokens ─── */
const C = {
  blue:     "#397B9C",
  green:    "#5AAD9C",
  mint:     "#ACD6CE",
  teal:     "#49949C",
  blueSoft: "#7CA5C3",
};

/* ─── Shared input styles ─── */
const inputSx = (focusColor = C.blue) => ({
  "& .MuiInputLabel-root": {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "0.85rem",
    color: "rgba(255,255,255,0.55)",
    "&.Mui-focused": { color: C.mint },
  },
  "& .MuiInputBase-input": {
    fontFamily: "'Montserrat', sans-serif",
    fontSize: "0.95rem",
    color: "#fff",
    "&::placeholder": { color: "rgba(255,255,255,0.25)", opacity: 1 },
    // ── Anula el fondo azul/amarillo del autocompletado del browser ──
    "&:-webkit-autofill": {
      WebkitBoxShadow: "0 0 0 100px #1a2e3e inset !important",
      WebkitTextFillColor: "#fff !important",
      caretColor: "#fff",
      borderRadius: "10px",
    },
    "&:-webkit-autofill:hover": {
      WebkitBoxShadow: "0 0 0 100px #1a2e3e inset !important",
    },
    "&:-webkit-autofill:focus": {
      WebkitBoxShadow: "0 0 0 100px #1a3040 inset !important",
      WebkitTextFillColor: "#fff !important",
    },
  },
  "& .MuiOutlinedInput-root": {
    borderRadius: "10px",
    "& fieldset": { borderColor: "rgba(255,255,255,0.12)" },
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.3)" },
    "&.Mui-focused fieldset": {
      borderColor: focusColor === C.blue ? C.blueSoft : C.mint,
      borderWidth: "1.5px",
    },
    background: "rgba(255,255,255,0.04)",
  },
  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.35)" },
});

/* ─── Left panel decorative pattern (AD icon repeat) ─── */
const BgPattern = () => (
  <svg
    width="100%" height="100%"
    style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }}
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="adPat" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
        <ellipse cx="24" cy="18" rx="9" ry="11" fill="none" stroke="#fff" strokeWidth="2"/>
        <ellipse cx="24" cy="42" rx="9" ry="11" fill="none" stroke="#fff" strokeWidth="2"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#adPat)"/>
  </svg>
);

/* ═══════════════════════════════════ */
const Login = ({ setIsAuthenticated }) => {
  const [Email, setEmail]       = useState("");
  const [Password, setPassword] = useState("");
  const [showPwd, setShowPwd]   = useState(false);
  const [remember, setRemember] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/");
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMessage("");
    try {
      const { token, user } = await Auth.login(Email, Password);
      if (!token) { setErrorMessage("Usuario o contraseña incorrectos"); return; }
      localStorage.setItem("token", token);
      if (user) localStorage.setItem("user", JSON.stringify(user));
      if (typeof setIsAuthenticated === "function") setIsAuthenticated(true);
      navigate("/");
    } catch (error) {
      const data = error?.response?.data;
      const msg =
        (Array.isArray(data?.errors?.email) && data.errors.email[0]) ||
        data?.message || error?.message || "No se pudo iniciar sesión.";
      setErrorMessage(msg);
    }
  };

  return (
    <Box sx={{
      minHeight: "100vh",
      display: "flex",
      fontFamily: "'Montserrat', sans-serif",
      background: "#0e1a24",
    }}>

      {/* ══ Panel izquierdo (branding) ══ */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        width: "42%",
        minWidth: 380,
        background: `linear-gradient(145deg, ${C.blue} 0%, ${C.teal} 55%, ${C.green} 100%)`,
        p: "52px 48px",
        position: "relative",
        overflow: "hidden",
      }}>
        <BgPattern />

        {/* Logo blanco — filter para que sea blanco puro sobre gradiente */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <img
            src={logoBlanco}
            alt="ArtDent Laboratorio Odontológico"
            style={{
              height: 68,
              width: "auto",
              filter: "brightness(0) invert(1)",
            }}
          />
        </Box>

        {/* Hero copy */}
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800, fontSize: "2.5rem", lineHeight: 1.15,
            color: "#fff", mb: 2,
          }}>
            Tu sonrisa,<br />
            <span style={{ color: "rgba(255,255,255,0.72)" }}>es nuestra</span><br />
            prioridad.
          </Typography>
          <Box sx={{ width: 48, height: 3, background: "rgba(255,255,255,0.35)", borderRadius: 2, mb: 2.5 }}/>
          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 400, fontSize: "0.9rem",
            color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 290,
          }}>
            Sistema de gestión para el laboratorio odontológico. Accedé con tu cuenta para continuar.
          </Typography>
        </Box>

        <Typography sx={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "0.72rem", color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.1em", textTransform: "uppercase",
          position: "relative", zIndex: 1,
        }}>
          El arte de crear para toda la vida
        </Typography>
      </Box>

      {/* ══ Panel derecho (formulario) ══ */}
      <Box sx={{
        flex: 1,
        display: "flex",
        flexDirection: "column",
        justifyContent: "center",
        alignItems: "center",
        px: { xs: 3, sm: 6 },
        py: 6,
        background: "linear-gradient(180deg, #0e1a24 0%, #111f2c 100%)",
      }}>
        {/* Mobile logo */}
        <Box sx={{ display: { xs: "flex", md: "none" }, mb: 5 }}>
          <img src={logoColor} alt="ArtDent" style={{ height: 52, width: "auto" }} />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700, fontSize: "1.65rem", color: "#fff",
            mb: 0.75, letterSpacing: "-0.01em",
          }}>
            Iniciar sesión
          </Typography>
          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", mb: 4,
          }}>
            Ingresá tus credenciales para continuar
          </Typography>

          {errorMessage && (
            <Box sx={{
              background: "rgba(239,83,80,0.1)",
              border: "1px solid rgba(239,83,80,0.28)",
              borderRadius: "10px", px: 2, py: 1.5, mb: 2.5,
            }}>
              <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.85rem", color: "#ef9090" }}>
                {errorMessage}
              </Typography>
            </Box>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            <TextField
              fullWidth required
              id="email" name="email" label="Correo electrónico"
              autoComplete="email" autoFocus
              value={Email} onChange={(e) => setEmail(e.target.value)}
              placeholder="email@artdent.com.ar"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <MailOutlineIcon sx={{ fontSize: 18 }}/>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 2, ...inputSx(C.blue) }}
            />

            <TextField
              fullWidth required
              id="password" name="password" label="Contraseña"
              type={showPwd ? "text" : "password"}
              autoComplete="current-password"
              value={Password} onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              InputLabelProps={{ shrink: true }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <LockOutlinedIcon sx={{ fontSize: 18 }}/>
                  </InputAdornment>
                ),
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={() => setShowPwd((v) => !v)} edge="end"
                      sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "rgba(255,255,255,0.6)" } }}
                    >
                      {showPwd ? <VisibilityOff sx={{ fontSize: 18 }}/> : <Visibility sx={{ fontSize: 18 }}/>}
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 0.5, ...inputSx(C.green) }}
            />

            <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 3.5 }}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={remember} onChange={(e) => setRemember(e.target.checked)}
                    size="small"
                    sx={{ color: "rgba(255,255,255,0.2)", "&.Mui-checked": { color: C.green }, p: "6px" }}
                  />
                }
                label={
                  <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.82rem", color: "rgba(255,255,255,0.45)" }}>
                    Recordarme
                  </Typography>
                }
              />
              <Link href="/forgot" underline="none" sx={{
                fontFamily: "'Montserrat', sans-serif",
                fontSize: "0.82rem", fontWeight: 500, color: C.mint, opacity: 0.85,
                "&:hover": { opacity: 1 }, transition: "opacity .2s",
              }}>
                ¿Olvidaste tu contraseña?
              </Link>
            </Box>

            <Button
              type="submit" fullWidth variant="contained"
              sx={{
                background: `linear-gradient(90deg, ${C.blue}, ${C.teal})`,
                color: "#fff",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700, fontSize: "0.9rem",
                letterSpacing: "0.05em", textTransform: "uppercase",
                py: 1.5, borderRadius: "10px",
                boxShadow: `0 8px 24px rgba(57,123,156,0.35)`,
                "&:hover": {
                  background: `linear-gradient(90deg, ${C.teal}, ${C.green})`,
                  boxShadow: `0 8px 28px rgba(90,173,156,0.4)`,
                },
                transition: "all .3s ease",
              }}
            >
              Iniciar sesión
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
            <Box sx={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }}/>
            <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", mx: 2 }}>
              o continuá con
            </Typography>
            <Box sx={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }}/>
          </Box>

          <Button
            fullWidth variant="outlined"
            startIcon={<GoogleIcon sx={{ fontSize: "18px !important" }}/>}
            sx={{
              color: "rgba(255,255,255,0.7)", borderColor: "rgba(255,255,255,0.13)",
              fontFamily: "'Montserrat', sans-serif",
              fontWeight: 600, fontSize: "0.88rem", py: 1.35, borderRadius: "10px",
              background: "rgba(255,255,255,0.02)",
              "&:hover": { borderColor: "rgba(255,255,255,0.3)", background: "rgba(255,255,255,0.06)" },
              transition: "all .2s ease",
            }}
          >
            Iniciar sesión con Google
          </Button>

          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "0.85rem", color: "rgba(255,255,255,0.38)",
            textAlign: "center", mt: 3.5,
          }}>
            ¿No tenés cuenta?{" "}
            <Link href="/register" underline="none" sx={{
              color: C.mint, fontWeight: 600,
              "&:hover": { color: C.green }, transition: "color .2s",
            }}>
              Registrate
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default Login;