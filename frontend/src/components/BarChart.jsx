import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { mockBarData } from "../data/mockData";

const BarChart = ({ isDashboard = false, data = null }) => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  // Usar datos del backend si están disponibles, sino usar mock
  const chartData = data && data.length > 0 ? data : mockBarData;

  // Determinar keys dinámicamente basado en los datos
  const keys = chartData.length > 0 && chartData[0].value !== undefined
    ? ["value"] // Para datos del backend
    : ["hot dog", "burger", "sandwich", "kebab", "fries", "donut"]; // Para mock data

  const indexBy = chartData.length > 0 && chartData[0].country !== undefined
    ? "country" // Para datos del backend
    : "country"; // Para mock data (igual)

  // Colores mejorados según el tema
  const barColors = theme.palette.mode === 'dark'
    ? { scheme: "nivo" }
    : { scheme: "category10" }; // Mejor contraste para tema claro

  return (
    <ResponsiveBar
      data={chartData}
      theme={{
        axis: {
          domain: {
            line: {
              stroke: colors.grey[100],
            },
          },
          legend: {
            text: {
              fill: colors.grey[100],
            },
          },
          ticks: {
            line: {
              stroke: colors.grey[100],
              strokeWidth: 1,
            },
            text: {
              fill: colors.grey[100],
            },
          },
        },
        legends: {
          text: {
            fill: colors.grey[100],
          },
        },
        tooltip: {
          container: {
            background: theme.palette.mode === 'dark' ? '#1e293b' : '#ffffff',
            color: theme.palette.mode === 'dark' ? '#ffffff' : '#1e293b',
            fontSize: 12,
            borderRadius: 8,
            boxShadow: theme.palette.mode === 'dark' 
              ? '0 4px 6px rgba(0, 0, 0, 0.4)'
              : '0 4px 6px rgba(0, 0, 0, 0.1)',
            padding: '8px 12px',
          },
        },
      }}
      keys={keys}
      indexBy={indexBy}
      margin={{ top: 50, right: isDashboard ? 20 : 130, bottom: 50, left: 60 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      colors={barColors}
      defs={[
        {
          id: "dots",
          type: "patternDots",
          background: "inherit",
          color: "#38bcb2",
          size: 4,
          padding: 1,
          stagger: true,
        },
        {
          id: "lines",
          type: "patternLines",
          background: "inherit",
          color: "#eed312",
          rotation: -45,
          lineWidth: 6,
          spacing: 10,
        },
      ]}
      borderColor={{
        from: "color",
        modifiers: [["darker", "1.6"]],
      }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: isDashboard ? -45 : 0,
        legend: isDashboard ? undefined : "country",
        legendPosition: "middle",
        legendOffset: 32,
      }}
      axisLeft={{
        tickSize: 5,
        tickPadding: 5,
        tickRotation: 0,
        legend: isDashboard ? undefined : "food",
        legendPosition: "middle",
        legendOffset: -40,
      }}
      enableLabel={!isDashboard}
      labelSkipWidth={12}
      labelSkipHeight={12}
      labelTextColor={{
        from: "color",
        modifiers: [["darker", 1.6]],
      }}
      legends={isDashboard ? [] : [
        {
          dataFrom: "keys",
          anchor: "bottom-right",
          direction: "column",
          justify: false,
          translateX: 120,
          translateY: 0,
          itemsSpacing: 2,
          itemWidth: 100,
          itemHeight: 20,
          itemDirection: "left-to-right",
          itemOpacity: 0.85,
          symbolSize: 20,
          effects: [
            {
              on: "hover",
              style: {
                itemOpacity: 1,
              },
            },
          ],
        },
      ]}
      role="application"
      ariaLabel="Gráfico de barras"
      barAriaLabel={function (e) {
        return e.id + ": " + e.formattedValue + " in country: " + e.indexValue;
      }}
    />
  );
};

export default BarChart;