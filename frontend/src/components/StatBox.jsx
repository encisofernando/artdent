import { Box, Typography, useTheme, Stack, Avatar, LinearProgress } from "@mui/material";
import { tokens } from "../theme";
import { TrendingUp as TrendingUpIcon, TrendingDown as TrendingDownIcon } from "@mui/icons-material";

const StatBox = ({ title, subtitle, icon, progress, increase }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const progressValue = parseFloat(progress) || 0;
  const increaseValue = parseFloat(increase?.replace('%', '').replace('+', '')) || 0;
  const isPositive = increaseValue >= 0;

  return (
    <Box 
      width="100%" 
      sx={{ 
        p: 2.5,
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Círculo de fondo decorativo */}
      <Box
        sx={{
          position: 'absolute',
          top: -30,
          right: -30,
          width: 120,
          height: 120,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${colors.greenAccent[500]}15 0%, transparent 70%)`,
        }}
      />

      <Stack spacing={2} position="relative">
        {/* Header con icono */}
        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
          <Box>
            <Avatar
              sx={{
                width: 48,
                height: 48,
                bgcolor: `${colors.greenAccent[500]}20`,
                mb: 1.5,
              }}
            >
              {icon}
            </Avatar>
            
            <Typography
              variant="h3"
              fontWeight={700}
              sx={{ color: colors.grey[100], mb: 0.5 }}
            >
              {title}
            </Typography>
            
            <Typography 
              variant="body2" 
              sx={{ color: colors.greenAccent[500], fontWeight: 600 }}
            >
              {subtitle}
            </Typography>
          </Box>
        </Stack>

        {/* Progress bar */}
        <Box>
          <LinearProgress
            variant="determinate"
            value={progressValue * 100}
            sx={{
              height: 8,
              borderRadius: 4,
              bgcolor: theme.palette.mode === 'dark' ? colors.primary[500] : '#e2e8f0',
              '& .MuiLinearProgress-bar': {
                bgcolor: colors.greenAccent[500],
                borderRadius: 4,
              },
            }}
          />
        </Box>

        {/* Trend indicator */}
        <Stack direction="row" alignItems="center" spacing={1}>
          {isPositive ? (
            <TrendingUpIcon sx={{ fontSize: 18, color: colors.greenAccent[500] }} />
          ) : (
            <TrendingDownIcon sx={{ fontSize: 18, color: '#f87171' }} />
          )}
          <Typography
            variant="body2"
            fontWeight={600}
            sx={{ 
              color: isPositive ? colors.greenAccent[500] : '#f87171',
            }}
          >
            {increase}
          </Typography>
          <Typography
            variant="caption"
            sx={{ color: colors.grey[300] }}
          >
            vs último periodo
          </Typography>
        </Stack>
      </Stack>
    </Box>
  );
};

export default StatBox;
