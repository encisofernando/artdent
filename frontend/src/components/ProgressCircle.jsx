import { Box, useTheme } from "@mui/material";
import { tokens } from "../theme";

const ProgressCircle = ({ progress = "0.75", size = "40" }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  
  const progressValue = parseFloat(progress) || 0;
  const angle = progressValue * 360;
  const numericSize = parseInt(size);
  
  return (
    <Box
      sx={{
        position: 'relative',
        width: `${numericSize}px`,
        height: `${numericSize}px`,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Círculo de fondo */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: theme.palette.mode === 'dark' 
            ? colors.primary[500]
            : '#e2e8f0',
        }}
      />
      
      {/* Círculo de progreso */}
      <Box
        sx={{
          position: 'absolute',
          width: '100%',
          height: '100%',
          borderRadius: '50%',
          background: `conic-gradient(
            ${colors.greenAccent[500]} 0deg ${angle}deg,
            transparent ${angle}deg 360deg
          )`,
          transition: 'all 0.6s cubic-bezier(0.4, 0, 0.2, 1)',
        }}
      />
      
      {/* Círculo interno (vacío) */}
      <Box
        sx={{
          position: 'absolute',
          width: `${numericSize * 0.65}px`,
          height: `${numericSize * 0.65}px`,
          borderRadius: '50%',
          bgcolor: theme.palette.background.paper,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontWeight: 700,
          fontSize: `${numericSize * 0.25}px`,
          color: colors.greenAccent[500],
        }}
      >
        {Math.round(progressValue * 100)}%
      </Box>
    </Box>
  );
};

export default ProgressCircle;
