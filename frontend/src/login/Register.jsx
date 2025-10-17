// src/pages/Register.jsx
import React, { useState } from "react";
import { Container, Box, TextField, Button, Typography, Link } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

const BG = "https://artdent.com.ar/static/lab/25.jpeg";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({ name: "", email: "", password: "", password_confirmation: "" });
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [errors, setErrors] = useState({});

  const theme = useTheme();
  const t = tokens?.(theme.palette?.mode || "dark") || {};
  const brand = t?.brand || {};
  const c = {
    blue: brand.primaryBlue || "#397B9C",
    green: brand.primaryGreen || "#5AAD9C",
    mint: brand.secondaryMint || "#ACD6CE",
    blueSoft: brand.tertiaryBlue || "#7CA5C3",
  };

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined }));
    setErrorGlobal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGlobal(null);
    setErrors({});
    if (!form.name || !form.email || !form.password) { setErrorGlobal("Completá todos los campos obligatorios."); return; }
    if (form.password !== form.password_confirmation) { setErrors({ password_confirmation: ["Las contraseñas no coinciden."] }); return; }

    try {
      const res = await authService.register(form); // { token, user }
      if (res?.token) nav("/");
      else setErrorGlobal("No se recibió token.");
    } catch (err) {
      const data = err?.response?.data;
      if (data?.errors) setErrors(data.errors);
      if (data?.message && !data?.errors) setErrorGlobal(data.message);
      if (!data) setErrorGlobal("No se pudo registrar. Intentalo de nuevo.");
      console.error(err);
    }
  };

  const firstError = (field) => {
    const entry = errors?.[field];
    return Array.isArray(entry) ? entry[0] : entry;
  };

  return (
    <Box
      sx={{
        position: "relative",
        minHeight: "100vh",
        backgroundImage: `url(${BG})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
        "&::before": {
          content: '""',
          position: "absolute",
          inset: 0,
          bgcolor: "rgba(0,0,0,.45)",
          zIndex: 0,
        },
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(12px)",
            p: "40px 30px",
            borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,.35)",
            width: "100%",
            transition: "transform .25s ease",
            "&:hover": { transform: "translateY(-2px)" },
          }}
        >
          <Typography component="h1" variant="h5" sx={{ color: "#fff", fontWeight: 700, fontSize: "1.8rem", letterSpacing: "0.02em" }}>
            Crear cuenta
          </Typography>

          <Box component="form" noValidate sx={{ mt: 2, width: "100%" }} onSubmit={handleSubmit}>
            <TextField
              margin="normal" required fullWidth id="name" label="Nombre" name="name"
              value={form.name} onChange={onChange}
              error={!!firstError("name")} helperText={firstError("name")}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "rgba(255,255,255,.35)" },
                  "&:hover fieldset": { borderColor: c.blueSoft },
                  "&.Mui-focused fieldset": { borderColor: c.blue },
                },
              }}
            />
            <TextField
              margin="normal" required fullWidth id="email" label="Email" name="email" autoComplete="email"
              value={form.email} onChange={onChange}
              error={!!firstError("email")} helperText={firstError("email")}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "rgba(255,255,255,.35)" },
                  "&:hover fieldset": { borderColor: c.blueSoft },
                  "&.Mui-focused fieldset": { borderColor: c.blue },
                },
              }}
            />
            <TextField
              margin="normal" required fullWidth name="password" label="Contraseña" type="password" id="password"
              value={form.password} onChange={onChange}
              error={!!firstError("password")} helperText={firstError("password")}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "rgba(255,255,255,.35)" },
                  "&:hover fieldset": { borderColor: c.mint },
                  "&.Mui-focused fieldset": { borderColor: c.green },
                },
              }}
            />
            <TextField
              margin="normal" required fullWidth name="password_confirmation" label="Confirmar contraseña" type="password" id="password_confirmation"
              value={form.password_confirmation} onChange={onChange}
              error={!!firstError("password_confirmation")} helperText={firstError("password_confirmation")}
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputBase-input": { color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "rgba(255,255,255,.35)" },
                  "&:hover fieldset": { borderColor: c.mint },
                  "&.Mui-focused fieldset": { borderColor: c.green },
                },
              }}
            />

            {errorGlobal && (
              <Typography sx={{ color: "#ffb3b3", mt: 1, fontSize: "0.9rem" }}>
                {errorGlobal}
              </Typography>
            )}

            <Button
              type="submit" fullWidth variant="contained" sx={{
                mt: 3, color: "#fff", backgroundColor: c.blue, borderRadius: "30px", py: 1.2,
                "&:hover": { backgroundColor: "#3c98a2" },
              }}
            >
              Crear cuenta
            </Button>

            <Link href="/" variant="body2" sx={{ color: "#fff", fontSize: "0.9rem", mt: 2, display: "block", textAlign: "center" }}>
              ¿Ya tenés cuenta? Iniciar sesión
            </Link>
          </Box>

          <Typography variant="body1" sx={{ color: "#fff", mt: 3, mb: 2, textAlign: "center", fontSize: "1rem", letterSpacing: "0.02em", opacity: 0.9 }}>
            o
          </Typography>
          <Button fullWidth variant="outlined" startIcon={<GoogleIcon />} sx={{ color: "#fff", borderColor: "rgba(255,255,255,.7)", borderRadius: "30px", py: 1.2, "&:hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,.08)" } }}>
            Registrarse con Google
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
