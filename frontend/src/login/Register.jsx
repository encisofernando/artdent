// src/pages/Register.jsx
//
// Assets requeridos — copiar a src/assets/:
//   logo-artdent-blanco.png   →  "logo ART DENT (blanco trans).png"
//   logo-artdent-color.png    →  "logo ART DENT.png"
//
import React, { useState } from "react";
import {
  Box, TextField, Button, Typography, Link,
  InputAdornment, IconButton,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import PersonOutlineIcon from "@mui/icons-material/PersonOutline";
import MailOutlineIcon from "@mui/icons-material/MailOutline";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import Visibility from "@mui/icons-material/Visibility";
import VisibilityOff from "@mui/icons-material/VisibilityOff";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

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

const inputSx = (focusColor = C.blue) => ({
  "& .MuiInputLabel-root": {
    fontFamily: "'Montserrat', sans-serif", fontSize: "0.85rem",
    color: "rgba(255,255,255,0.5)",
    "&.Mui-focused": { color: C.mint },
    "&.Mui-error": { color: "#ef9090" },
  },
  "& .MuiInputBase-input": {
    fontFamily: "'Montserrat', sans-serif", fontSize: "0.95rem", color: "#fff",
    "&::placeholder": { color: "rgba(255,255,255,0.25)", opacity: 1 },
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
    "&:hover fieldset": { borderColor: "rgba(255,255,255,0.28)" },
    "&.Mui-focused fieldset": {
      borderColor: focusColor === C.blue ? C.blueSoft : C.mint, borderWidth: "1.5px",
    },
    "&.Mui-error fieldset": { borderColor: "rgba(239,144,144,0.45)" },
    background: "rgba(255,255,255,0.04)",
  },
  "& .MuiSvgIcon-root": { color: "rgba(255,255,255,0.35)" },
  "& .MuiFormHelperText-root": {
    fontFamily: "'Montserrat', sans-serif", fontSize: "0.75rem",
    color: "#ef9090", mx: 0,
  },
});

const BgPattern = () => (
  <svg width="100%" height="100%"
    style={{ position: "absolute", inset: 0, opacity: 0.06, pointerEvents: "none" }}
    preserveAspectRatio="xMidYMid slice">
    <defs>
      <pattern id="adReg" x="0" y="0" width="64" height="64" patternUnits="userSpaceOnUse">
        <ellipse cx="24" cy="18" rx="9" ry="11" fill="none" stroke="#fff" strokeWidth="2"/>
        <ellipse cx="24" cy="42" rx="9" ry="11" fill="none" stroke="#fff" strokeWidth="2"/>
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#adReg)"/>
  </svg>
);

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [errors, setErrors]   = useState({});
  const [showPwd,  setShowPwd]  = useState(false);
  const [showPwd2, setShowPwd2] = useState(false);

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setErrorGlobal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGlobal(null); setErrors({});
    if (!form.name || !form.email || !form.password) {
      setErrorGlobal("Completá todos los campos obligatorios."); return;
    }
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ["Las contraseñas no coinciden."] }); return;
    }
    try {
      const res = await authService.register(form);
      if (res?.token) nav("/");
      else setErrorGlobal("No se recibió token.");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setErrors(data.errors);
      if (data?.message && !data?.errors) setErrorGlobal(data.message);
      if (!data) setErrorGlobal("No se pudo registrar. Intentalo de nuevo.");
    }
  };

  const firstError = (field) => {
    const e = errors?.[field];
    return Array.isArray(e) ? e[0] : e;
  };

  return (
    <Box sx={{
      minHeight: "100vh", display: "flex",
      fontFamily: "'Montserrat', sans-serif",
      background: "#0e1a24",
    }}>

      {/* ══ Panel izquierdo (branding) ══ */}
      <Box sx={{
        display: { xs: "none", md: "flex" },
        flexDirection: "column",
        justifyContent: "space-between",
        width: "42%", minWidth: 380,
        background: `linear-gradient(145deg, ${C.green} 0%, ${C.teal} 55%, ${C.blue} 100%)`,
        p: "52px 48px", position: "relative", overflow: "hidden",
      }}>
        <BgPattern />
        <Box sx={{ position: "relative", zIndex: 1 }}>
          <img
            src={logoBlanco}
            alt="ArtDent Laboratorio Odontológico"
            style={{ height: 68, width: "auto", filter: "brightness(0) invert(1)" }}
          />
        </Box>

        <Box sx={{ position: "relative", zIndex: 1 }}>
          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 800, fontSize: "2.4rem", lineHeight: 1.15, color: "#fff", mb: 2,
          }}>
            El arte<br />
            <span style={{ color: "rgba(255,255,255,0.72)" }}>de crear</span><br />
            para toda la vida.
          </Typography>
          <Box sx={{ width: 48, height: 3, background: "rgba(255,255,255,0.35)", borderRadius: 2, mb: 2.5 }}/>
          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "0.9rem", color: "rgba(255,255,255,0.6)", lineHeight: 1.75, maxWidth: 290,
          }}>
            Creá tu cuenta y comenzá a gestionar el laboratorio con todas las herramientas que necesitás.
          </Typography>
        </Box>

        <Typography sx={{
          fontFamily: "'Montserrat', sans-serif",
          fontSize: "0.72rem", color: "rgba(255,255,255,0.35)",
          letterSpacing: "0.1em", textTransform: "uppercase",
          position: "relative", zIndex: 1,
        }}>
          artdent.com.ar
        </Typography>
      </Box>

      {/* ══ Panel derecho (formulario) ══ */}
      <Box sx={{
        flex: 1, display: "flex", flexDirection: "column",
        justifyContent: "center", alignItems: "center",
        px: { xs: 3, sm: 6 }, py: 6,
        background: "linear-gradient(180deg, #0e1a24 0%, #111f2c 100%)",
        overflowY: "auto",
      }}>
        <Box sx={{ display: { xs: "flex", md: "none" }, mb: 5 }}>
          <img src={logoColor} alt="ArtDent" style={{ height: 52, width: "auto" }} />
        </Box>

        <Box sx={{ width: "100%", maxWidth: 400 }}>
          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontWeight: 700, fontSize: "1.65rem", color: "#fff",
            mb: 0.75, letterSpacing: "-0.01em",
          }}>
            Crear cuenta
          </Typography>
          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "0.875rem", color: "rgba(255,255,255,0.4)", mb: 4,
          }}>
            Completá tus datos para registrarte
          </Typography>

          {errorGlobal && (
            <Box sx={{
              background: "rgba(239,83,80,0.1)", border: "1px solid rgba(239,83,80,0.28)",
              borderRadius: "10px", px: 2, py: 1.5, mb: 2.5,
            }}>
              <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.85rem", color: "#ef9090" }}>
                {errorGlobal}
              </Typography>
            </Box>
          )}

          <Box component="form" noValidate onSubmit={handleSubmit}>
            {[
              {
                id: "name", label: "Nombre completo", type: "text",
                icon: <PersonOutlineIcon sx={{ fontSize: 18 }}/>,
                focus: C.blue, show: null, toggle: null,
              },
              {
                id: "email", label: "Correo electrónico", type: "email",
                icon: <MailOutlineIcon sx={{ fontSize: 18 }}/>,
                focus: C.blue, show: null, toggle: null,
              },
              {
                id: "password", label: "Contraseña",
                type: showPwd ? "text" : "password",
                icon: <LockOutlinedIcon sx={{ fontSize: 18 }}/>,
                focus: C.green, show: showPwd, toggle: () => setShowPwd(v => !v),
              },
              {
                id: "password_confirmation", label: "Confirmar contraseña",
                type: showPwd2 ? "text" : "password",
                icon: <LockOutlinedIcon sx={{ fontSize: 18 }}/>,
                focus: C.green, show: showPwd2, toggle: () => setShowPwd2(v => !v),
              },
            ].map(({ id, label, type, icon, focus, show, toggle }) => (
              <TextField
                key={id}
                fullWidth required margin="dense"
                id={id} name={id} label={label} type={type}
                value={form[id]} onChange={onChange}
                error={!!firstError(id)} helperText={firstError(id)}
                InputLabelProps={{ shrink: true }}
                InputProps={{
                  startAdornment: <InputAdornment position="start">{icon}</InputAdornment>,
                  endAdornment: toggle ? (
                    <InputAdornment position="end">
                      <IconButton onClick={toggle} edge="end"
                        sx={{ color: "rgba(255,255,255,0.3)", "&:hover": { color: "rgba(255,255,255,0.6)" } }}>
                        {show ? <VisibilityOff sx={{ fontSize: 18 }}/> : <Visibility sx={{ fontSize: 18 }}/>}
                      </IconButton>
                    </InputAdornment>
                  ) : undefined,
                }}
                sx={{ mb: 1.5, ...inputSx(focus) }}
              />
            ))}

            <Button
              type="submit" fullWidth variant="contained"
              sx={{
                mt: 1.5,
                background: `linear-gradient(90deg, ${C.green}, ${C.teal})`,
                color: "#fff",
                fontFamily: "'Montserrat', sans-serif",
                fontWeight: 700, fontSize: "0.9rem",
                letterSpacing: "0.05em", textTransform: "uppercase",
                py: 1.5, borderRadius: "10px",
                boxShadow: `0 8px 24px rgba(90,173,156,0.35)`,
                "&:hover": {
                  background: `linear-gradient(90deg, ${C.teal}, ${C.blue})`,
                  boxShadow: `0 8px 28px rgba(57,123,156,0.4)`,
                },
                transition: "all .3s ease",
              }}
            >
              Crear cuenta
            </Button>
          </Box>

          <Box sx={{ display: "flex", alignItems: "center", my: 3 }}>
            <Box sx={{ flex: 1, height: "1px", background: "rgba(255,255,255,0.07)" }}/>
            <Typography sx={{ fontFamily: "'Montserrat', sans-serif", fontSize: "0.78rem", color: "rgba(255,255,255,0.28)", mx: 2 }}>
              o registrate con
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
            Registrarse con Google
          </Button>

          <Typography sx={{
            fontFamily: "'Montserrat', sans-serif",
            fontSize: "0.85rem", color: "rgba(255,255,255,0.38)",
            textAlign: "center", mt: 3.5,
          }}>
            ¿Ya tenés cuenta?{" "}
            <Link href="/" underline="none" sx={{
              color: C.mint, fontWeight: 600,
              "&:hover": { color: C.green }, transition: "color .2s",
            }}>
              Iniciá sesión
            </Link>
          </Typography>
        </Box>
      </Box>
    </Box>
  );
}