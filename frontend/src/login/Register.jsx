import React, { useState } from "react";
import { Container, Box, TextField, Button, Typography, Link } from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import authService from "../services/authService";

export default function Register() {
  const nav = useNavigate();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
    password_confirmation: "",
  });
  const [errorGlobal, setErrorGlobal] = useState(null);
  const [errors, setErrors] = useState({}); // <- aquí guardamos los errores por campo

  const onChange = (e) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }));
    setErrors((prev) => ({ ...prev, [e.target.name]: undefined })); // limpia error del campo al tipear
    setErrorGlobal(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorGlobal(null);
    setErrors({});

    // validación mínima del lado cliente (opcional)
    if (!form.name || !form.email || !form.password) {
      setErrorGlobal("Completá todos los campos obligatorios.");
      return;
    }
    if (form.password !== form.password_confirmation) {
      setErrors({ password_confirmation: ["Las contraseñas no coinciden."] });
      return;
    }

    try {
      const res = await authService.register(form); // { token, user }
      if (res?.token) {
        nav("/"); // redirigí donde quieras
      } else {
        setErrorGlobal("No se recibió token.");
      }
    } catch (err) {
      const data = err?.response?.data;
      // Capturar errores de validación de Laravel
      if (data?.errors) setErrors(data.errors);
      if (data?.message && !data?.errors) setErrorGlobal(data.message);
      if (!data) setErrorGlobal("No se pudo registrar. Intentalo de nuevo.");
      console.error(err);
    }
  };

  // helper: toma el primer error del campo
  const firstError = (field) => {
    const entry = errors?.[field];
    return Array.isArray(entry) ? entry[0] : entry;
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        background: "linear-gradient(135deg, #0f1327, #2e3844, #143f52)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        p: 2,
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            backgroundColor: "rgba(6, 21, 41, 0.945)",
            backdropFilter: "blur(10px)",
            p: "40px 30px",
            borderRadius: "15px",
            boxShadow: "0 8px 30px rgb(0, 0, 0)",
            width: "100%",
            transition: "all 0.3s ease-in-out",
            "&:hover": { transform: "scale(1.02)" },
          }}
        >
          <Typography component="h1" variant="h5" sx={{ color: "#fff", fontWeight: "bold", fontSize: "1.8rem", letterSpacing: "0.05em" }}>
            Crear cuenta
          </Typography>

          <Box component="form" noValidate sx={{ mt: 2, width: "100%" }} onSubmit={handleSubmit}>
            <TextField
              margin="normal"
              required
              fullWidth
              id="name"
              label="Nombre"
              name="name"
              value={form.name}
              onChange={onChange}
              error={!!firstError("name")}
              helperText={firstError("name")}
              InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
              sx={{ input: { color: "#fff" } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email"
              name="email"
              autoComplete="email"
              value={form.email}
              onChange={onChange}
              error={!!firstError("email")}
              helperText={firstError("email")}
              InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
              sx={{ input: { color: "#fff" } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Contraseña"
              type="password"
              id="password"
              value={form.password}
              onChange={onChange}
              error={!!firstError("password")}
              helperText={firstError("password")}
              InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
              sx={{ input: { color: "#fff" } }}
            />
            <TextField
              margin="normal"
              required
              fullWidth
              name="password_confirmation"
              label="Confirmar contraseña"
              type="password"
              id="password_confirmation"
              value={form.password_confirmation}
              onChange={onChange}
              error={!!firstError("password_confirmation")}
              helperText={firstError("password_confirmation")}
              InputLabelProps={{ style: { color: "#fff" }, shrink: true }}
              sx={{ input: { color: "#fff" } }}
            />

            {errorGlobal && (
              <Typography sx={{ color: "#ff6b6b", mt: 1, fontSize: "0.9rem" }}>
                {errorGlobal}
              </Typography>
            )}

            <Button type="submit" fullWidth variant="contained" sx={{ mt: 3 }}>
              Crear cuenta
            </Button>

            <Link href="/" variant="body2" sx={{ color: "#ffffff", fontSize: "0.9rem", mt: 2, display: "block", textAlign: "center" }}>
              ¿Ya tenés cuenta? Iniciar sesión
            </Link>
          </Box>

          <Typography variant="body1" sx={{ color: "#fff", mt: 3, mb: 2, textAlign: "center", fontSize: "1rem", letterSpacing: "0.05em" }}>
            o
          </Typography>
          <Button fullWidth variant="contained" startIcon={<GoogleIcon />}>
            Registrarse con Google
          </Button>
        </Box>
      </Container>
    </Box>
  );
}
