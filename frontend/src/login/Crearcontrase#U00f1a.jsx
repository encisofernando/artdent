// src/pages/ForgotPassword.jsx
import React, { useState } from "react";
import { Container, Box, TextField, Button, Typography } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import { Auth } from "../services"; // debe exponer requestPasswordReset(email)

const BG = "https://artdent.com.ar/static/lab/25.jpeg";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [msg, setMsg] = useState("");
  const [error, setError] = useState("");

  const theme = useTheme();
  const t = tokens?.(theme.palette?.mode || "dark") || {};
  const brand = t?.brand || {};
  const c = {
    blue: brand.primaryBlue || "#397B9C",
    green: brand.primaryGreen || "#5AAD9C",
    mint: brand.secondaryMint || "#ACD6CE",
    blueSoft: brand.tertiaryBlue || "#7CA5C3",
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMsg(""); setError("");
    try {
      // Debe devolver { message: "..."} si fue OK
      const res = await Auth.requestPasswordReset(email);
      setMsg(res?.message || "Si el correo existe, te enviamos un enlace para restablecer la contraseña.");
    } catch (err) {
      const m = err?.response?.data?.message || "No pudimos procesar tu solicitud.";
      setError(m);
    }
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
          content: '""', position: "absolute", inset: 0, bgcolor: "rgba(0,0,0,.45)", zIndex: 0,
        },
      }}
    >
      <Container component="main" maxWidth="xs" sx={{ position: "relative", zIndex: 1 }}>
        <Box
          sx={{
            display: "flex", flexDirection: "column", alignItems: "center",
            background: "rgba(255,255,255,0.15)",
            border: "1px solid rgba(255,255,255,0.25)",
            backdropFilter: "blur(12px)",
            p: "40px 30px", borderRadius: "20px",
            boxShadow: "0 10px 30px rgba(0,0,0,.35)",
            width: "100%", transition: "transform .25s ease",
            "&:hover": { transform: "translateY(-2px)" },
          }}
        >
          <Typography component="h1" variant="h5" sx={{ color: "#fff", fontWeight: 700, fontSize: "1.8rem" }}>
            Recuperar contraseña
          </Typography>

          {error && <Typography color="error" sx={{ mt: 2 }}>{error}</Typography>}
          {msg && <Typography sx={{ mt: 2, color: "#c8facc" }}>{msg}</Typography>}

          <Box component="form" onSubmit={handleSubmit} noValidate sx={{ mt: 2, width: "100%" }}>
            <TextField
              margin="normal" required fullWidth id="email" name="email" label="Correo electrónico"
              value={email} onChange={(e) => setEmail(e.target.value)} autoComplete="email"
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
            <Button
              type="submit" fullWidth variant="contained"
              sx={{ mt: 3, color: "#fff", backgroundColor: c.blue, py: 1.2, fontWeight: 700, borderRadius: "30px",
                "&:hover": { backgroundColor: "#3c98a2" } }}
            >
              Enviar enlace de recuperación
            </Button>
            <Button
              href="/" fullWidth variant="text"
              sx={{ mt: 1.5, color: "#fff", textDecoration: "underline" }}
            >
              Volver a Iniciar sesión
            </Button>
          </Box>
        </Box>
      </Container>
    </Box>
  );
}
