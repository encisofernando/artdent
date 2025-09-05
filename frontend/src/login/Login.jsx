import React, { useState, useEffect } from "react";
import {
  Container,
  Box,
  TextField,
  Button,
  Typography,
  Checkbox,
  FormControlLabel,
  Link,
} from "@mui/material";
import GoogleIcon from "@mui/icons-material/Google";
import { useNavigate } from "react-router-dom";
import { login } from "../config/UsuarioDB";
import { getUserPermissions } from "../config/PermisosDB";
import { jwtDecode } from "jwt-decode";

// 👇 si usás tokens/theme:
import { useTheme } from "@mui/material/styles";
import { tokens } from "../theme";
import { loginOffline } from "../auth/offline";

const ENABLE_OFFLINE = process.env.REACT_APP_ENABLE_OFFLINE_LOGIN === "true";

const Login = ({ setIsAuthenticated }) => {
  const [Email, setEmail] = useState("");
  const [Password, setPassword] = useState("");
  const [useOffline, setUseOffline] = useState(false);   // <--- NUEVO
  const [errorMessage, setErrorMessage] = useState("");
  const navigate = useNavigate();

  // 🎨 paleta ARTDENT desde el theme (con fallback HEX por si acaso)
  const theme = useTheme();
  const t = tokens(theme.palette?.mode || "light");
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

  const persistBackendLogin = async (response) => {
    const decodedToken = jwtDecode(response.token);
    const idEmpleado = decodedToken.idEmpleado;

    localStorage.setItem("token", response.token);
    localStorage.setItem("idBase", response.idBase);
    localStorage.setItem("idEmpleado", response.idEmpleado);

    // Solo backend: cargo permisos desde API
    const permisos = await getUserPermissions(idEmpleado);
    localStorage.setItem("userPermissions", JSON.stringify(permisos));

    setIsAuthenticated(true);
    navigate("/dashboard");
  };

  const doOffline = async () => {
    const res = await loginOffline(Email, Password); // guarda todo en localStorage
    setIsAuthenticated(true);
    navigate("/dashboard");
    return res;
  };

const handleSubmit = async (e) => {
  e.preventDefault();
   setErrorMessage("");

    // 1) Forzar offline por UI o por .env
    if (useOffline || ENABLE_OFFLINE) {
      try {
        await doOffline();
        return;
      } catch (e) {
        setErrorMessage("Credenciales offline inválidas");
        return;
      }
    }

  // 2) Intentar backend
    try {
      const response = await login({ Email, Password });
      if (response?.token) {
        await persistBackendLogin(response);
        return;
      }
      // 3) Si backend respondio sin token y tenés offline habilitado, probá offline
      if (ENABLE_OFFLINE) {
        try {
          await doOffline();
          return;
        } catch (e) {
          // cae al error final
        }
      }
      setErrorMessage("Usuario o contraseña incorrectos");
    } catch (error) {
      // 4) Si backend tiró error y offline está habilitado, probá offline
      if (ENABLE_OFFLINE) {
        try {
          await doOffline();
          return;
        } catch (e) {
          // credenciales offline inválidas
        }
      }
      setErrorMessage("No se pudo conectar al servidor.");
    }
  };


  return (
    <Box
      sx={{
        minHeight: "100vh",
        // 🌈 Fondo acorde al manual:
        // capa base suave (celeste + menta) + degradé corporativo azul→verde
        background: `
          radial-gradient(1200px 600px at 15% 0%, ${c.ice} 0%, transparent 60%),
          radial-gradient(1000px 500px at 90% 100%, ${c.mintSoft} 0%, transparent 55%),
          linear-gradient(135deg, ${c.blue} 0%, ${c.teal} 50%, ${c.green} 100%)
        `,
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        padding: "20px",
      }}
    >
      <Container component="main" maxWidth="xs">
        <Box
          sx={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            // 🧊 Tarjeta estilo “glass” con colores de la marca
            background: `linear-gradient(180deg, rgba(255,255,255,0.85), rgba(255,255,255,0.75))`,
            border: `1px solid ${c.ice}`,
            backdropFilter: "blur(10px)",
            padding: "40px 30px",
            borderRadius: "16px",
            boxShadow: `0 10px 30px rgba(0,0,0,0.15)`,
            width: "100%",
            transition: "transform .25s ease",
            "&:hover": { transform: "translateY(-2px)" },
          }}
        >
          <Typography
            component="h1"
            variant="h5"
            sx={{
              color: c.blue,
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

          <Box
            component="form"
            noValidate
            sx={{ mt: 2, width: "100%" }}
            onSubmit={handleSubmit}
          >
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
                "& .MuiInputBase-input": {
                  fontSize: "0.95rem",
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": { borderColor: c.ice },
                  "&:hover fieldset": { borderColor: c.blueSoft },
                  "&.Mui-focused fieldset": { borderColor: c.blue },
                },
              }}
            />

            <Link
              href="#"
              variant="body2"
              sx={{
                color: c.teal,
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
                "& .MuiInputBase-input": {
                  fontSize: "0.95rem",
                },
                "& .MuiOutlinedInput-root": {
                  borderRadius: "12px",
                  "& fieldset": { borderColor: c.ice },
                  "&:hover fieldset": { borderColor: c.mint },
                  "&.Mui-focused fieldset": { borderColor: c.green },
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
                    color: c.blue,
                    "&.Mui-checked": { color: c.green },
                  }}
                />
              }
              label={<span style={{ fontSize: "0.9rem" }}>Recordarme</span>}
              sx={{ color: "#333", mt: 1 }}
            />

            <FormControlLabel
                control={
                  <Checkbox
                    checked={useOffline}
                    onChange={(e) => setUseOffline(e.target.checked)}
                    color="primary"
                    sx={{ transform: "scale(1.0)", color: c.blue, "&.Mui-checked": { color: c.green } }}
                  />
                }
                label={<span style={{ fontSize: "0.9rem" }}>Entrar sin conexión</span>}
                sx={{ color: "#333", mt: 0.5 }}
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
                boxShadow: `0 6px 16px rgba(0,0,0,0.15)`,
                "&:hover": {
                  backgroundColor: c.teal,
                },
              }}
            >
              Iniciar sesión
            </Button>

            <Link
              href="/register"
              variant="body2"
              sx={{
                color: c.blue,
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
              color: "#333",
              mt: 3,
              mb: 2,
              textAlign: "center",
              fontSize: "1rem",
              letterSpacing: "0.02em",
            }}
          >
            o
          </Typography>

          <Button
            fullWidth
            variant="outlined"
            sx={{
              mb: 1,
              color: c.blue,
              borderColor: c.blue,
              padding: "10px 0",
              fontSize: "0.9rem",
              fontWeight: 700,
              borderRadius: "30px",
              "&:hover": {
                borderColor: c.teal,
                backgroundColor: `${c.ice}80`,
              },
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
