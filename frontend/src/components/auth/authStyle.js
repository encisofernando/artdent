// src/components/auth/authStyle.js
export const getAuthStyles = (brand = {}, theme) => {
  const radius = theme?.shape?.borderRadius ?? 12;

  return {
    layout: {
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      backgroundColor: brand.tertiaryIce || "#DAE6F0",
      position: "relative",
      overflow: "hidden",
      p: 2,

      "&::after": {
        content: '""',
        position: "absolute",
        width: 520,
        height: 520,
        right: -220,
        bottom: -240,
        backgroundColor: brand.tertiaryMint || "#DAEEE3",
        borderRadius: "50%",
        opacity: 0.7,
        zIndex: 0,
      },
    },

    container: { position: "relative", zIndex: 1 },

    // ✅ Scope local para AUTH: fuerza inputs claros y autofill claro siempre
    card: {
      width: "100%",
      maxWidth: 420,
      borderRadius: `${radius + 6}px`,
      overflow: "hidden",
      p: { xs: 3.5, sm: 5 },
      boxShadow: "0 12px 40px rgba(0,0,0,0.08)",
      border: "1px solid rgba(0,0,0,0.06)",
      backgroundColor: "#FFFFFF",
      color: "#1A202C",
      display: "flex",
      flexDirection: "column",

      // 🔒 IMPORTANTÍSIMO: evita estilos oscuros del navegador/UA
      colorScheme: "light",

      // Inputs dentro de la card (manual y autofill)
      "& .MuiInputBase-input": {
        color: "#1A202C",
        WebkitTextFillColor: "#1A202C",
      },

      "& .MuiInputLabel-root": {
        color: "rgba(26,32,44,0.65)",
      },
      "& .MuiInputLabel-root.Mui-focused": {
        color: brand.primaryBlue || "#397B9C",
      },

      // Fondo del input y borde suave (sin duplicar todo, solo garantizamos “claro”)
      "& .MuiOutlinedInput-root": {
        backgroundColor: "#FFFFFF",
      },

      // ✅ Autofill SIEMPRE claro (independiente del theme global)
      "& input:-webkit-autofill, & textarea:-webkit-autofill, & select:-webkit-autofill": {
        WebkitBoxShadow: "0 0 0px 1000px #FFFFFF inset",
        WebkitTextFillColor: "#1A202C",
        caretColor: "#1A202C",
        transition: "background-color 9999s ease-in-out 0s",
      },
      "& input:-webkit-autofill:hover, & textarea:-webkit-autofill:hover, & select:-webkit-autofill:hover": {
        WebkitBoxShadow: "0 0 0px 1000px #FFFFFF inset",
        WebkitTextFillColor: "#1A202C",
      },
      "& input:-webkit-autofill:focus, & textarea:-webkit-autofill:focus, & select:-webkit-autofill:focus": {
        WebkitBoxShadow: "0 0 0px 1000px #FFFFFF inset",
        WebkitTextFillColor: "#1A202C",
      },
    },

    title: {
      fontWeight: 700,
      fontSize: "1.55rem",
      color: brand.primaryBlue || "#397B9C",
      textAlign: "center",
      mb: 0.5,
    },

    subtitle: {
      fontSize: "0.95rem",
      color: "rgba(26,32,44,0.65)",
      textAlign: "center",
      mb: 3,
    },

    textField: { mt: 1, mb: 1 },

    primaryButton: { mt: 2, py: 1.2 },

    secondaryButton: { mt: 2, py: 1.2 },

    link: {
      display: "block",
      textAlign: "center",
      mt: 2,
      fontWeight: 600,
      color: brand.primaryBlue || "#397B9C",
      textDecorationColor: "rgba(57,123,156,0.35)",
      "&:hover": { textDecorationColor: brand.primaryBlue || "#397B9C" },
    },

    dividerText: {
      mt: 2.5,
      mb: 1.5,
      textAlign: "center",
      fontSize: "0.9rem",
      color: "rgba(26,32,44,0.45)",
    },

    helperError: {
      mt: 2,
      fontSize: "0.92rem",
      color: theme?.palette?.error?.main || "#D32F2F",
      textAlign: "center",
    },

    helperOk: {
      mt: 2,
      fontSize: "0.92rem",
      color: theme?.palette?.success?.main || "#2E7D32",
      textAlign: "center",
    },
  };
};