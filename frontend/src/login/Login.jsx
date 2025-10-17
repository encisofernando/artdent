// src/pages/Login.jsx
import React, { useState, useEffect } from "react";
import {
  Container, Box, TextField, Button, Typography,
  Checkbox, FormControlLabel, Link,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import { Auth } from "../services";

import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";

const BG = "https://artdent.com.ar/static/lab/25.jpeg";

const Login = ({ setIsAuthenticated }) => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  const theme = useTheme();
  const t = tokens?.(theme.palette?.mode || "dark") || {};
  const brand = t?.brand || {};
  const c = {
    blue: brand.primaryBlue || "#397B9C",
    green: brand.primaryGreen || "#5AAD9C",
    mint: brand.secondaryMint || "#ACD6CE",
    teal: brand.secondaryTeal || "#49949C",
    ice: brand.tertiaryIce || "#DAE6F0",
    mintSoft: brand.tertiaryMint || "#DAEEE3",
    blueSoft: brand.tertiaryBlue || "#7CA5C3",
  };

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (token) navigate("/dashboard");
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
      navigate("/dashboard");
    } catch (error) {
      const data = error?.response?.data;
      const msg =
        (Array.isArray(data?.errors?.email) && data.errors.email[0]) ||
        data?.message || error?.message || "No se pudo iniciar sesión.";
      setErrorMessage(msg);
      console.error(error);
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
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: "#fff",
              fontWeight: 700,
              fontSize: "1.8rem",
              letterSpacing: "0.02em",
              fontFamily: "Montserrat, sans-serif",
              textAlign: "center",
            }}
          >
            Iniciar sesión
          </Typography>

          {errorMessage && (
            <Typography color="error" sx={{ mt: 2, textAlign: "center" }}>
              {errorMessage}
            </Typography>
          )}

          <Box component="form" noValidate sx={{ mt: 2, width: "100%" }} onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Correo electrónico"
              name="email"
              autoComplete="email"
              autoFocus
              value={Email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="email@artdent.com.ar"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputBase-input": { fontSize: "0.95rem", color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "rgba(255,255,255,.35)" },
                  "&:hover fieldset": { borderColor: c.blueSoft },
                  "&.Mui-focused fieldset": { borderColor: c.blue },
                  backdropFilter: "blur(2px)",
                },
              }}
            />

            <Link
              href="/forgot"
              variant="body2"
              sx={{
                color: "#fff",
                opacity: 0.9,
                fontSize: "0.9rem",
                mt: 1,
                display: "block",
                textAlign: "right",
                textDecorationColor: c.mint,
              }}
            >
              ¿Olvidaste tu contraseña?
            </Link>

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              autoComplete="current-password"
              value={Password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="*******"
              InputLabelProps={{ shrink: true }}
              sx={{
                "& .MuiInputBase-input": { fontSize: "0.95rem", color: "#fff" },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": { borderColor: "rgba(255,255,255,.35)" },
                  "&:hover fieldset": { borderColor: c.mint },
                  "&.Mui-focused fieldset": { borderColor: c.green },
                  backdropFilter: "blur(2px)",
                },
              }}
            />

            <FormControlLabel
              control={
                <Checkbox
                  value="remember"
                  color="primary"
                  sx={{
                    transform: "scale(1.0)",
                    color: "#fff",
                    "&.Mui-checked": { color: c.green },
                  }}
                />
              }
              label={<span style={{ color: "#fff", fontSize: "0.9rem" }}>Recordarme</span>}
              sx={{ mt: 1 }}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{
                mt: 3,
                color: "#fff",
                backgroundColor: c.blue,
                padding: "10px 0",
                fontSize: "0.95rem",
                fontWeight: 700,
                borderRadius: "30px",
                boxShadow: `0 6px 16px rgba(0,0,0,0.25)`,
                "&:hover": { backgroundColor: c.teal },
              }}
            >
              Iniciar sesión
            </Button>

            <Link
              href="/register"
              variant="body2"
              sx={{
                color: "#fff",
                fontSize: "0.95rem",
                mt: 2,
                display: "block",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              ¿No tienes cuenta? Regístrate.
            </Link>
          </Box>

          <Typography
            variant="body1"
            sx={{
              color: "#fff",
              mt: 3,
              mb: 2,
              textAlign: "center",
              fontSize: "1rem",
              letterSpacing: "0.02em",
              opacity: 0.9,
            }}
          >
            o
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              mb: 1,
              color: "#fff",
              borderColor: "rgba(255,255,255,.7)",
              padding: "10px 0",
              fontSize: "0.9rem",
              fontWeight: 700,
              borderRadius: "30px",
              "&:hover": { borderColor: "#fff", backgroundColor: "rgba(255,255,255,.08)" },
            }}
            startIcon={<GoogleIcon />}
          >
            Iniciar sesión con Google
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Login;
