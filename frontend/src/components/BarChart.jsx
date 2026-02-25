// src/components/BarChart.jsx
import { useTheme } from "@mui/material";
import { ResponsiveBar } from "@nivo/bar";
import { tokens } from "../theme";
import { mockBarData } from "../data/mockData";

/* ─── ArtDent brand palette para series ─── */
const BRAND_COLORS = [
  "#397B9C", // blue
  "#5AAD9C", // green
  "#49949C", // teal
  "#7CA5C3", // blueSoft
  "#ACD6CE", // mint
  "#DAEEE3", // tertiaryMint
];

const BarChart = ({ isDashboard = false, data = null }) => {
  const theme  = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";

  const chartData = data && data.length > 0 ? data : mockBarData;

  const keys =
    chartData.length > 0 && chartData[0].value !== undefined
      ? ["value"]
      : ["hot dog", "burger", "sandwich", "kebab", "fries", "donut"];

  const indexBy = "country";

  /* ─── Nivo theme alineado con la UI ─── */
  const nivoTheme = {
    background: "transparent",
    text: { fontFamily: "Montserrat, sans-serif", fontSize: 11 },
    axis: {
      domain: { line: { stroke: "transparent" } },
      legend: {
        text: {
          fill: isDark ? "rgba(230,238,245,0.5)" : "rgba(26,32,44,0.5)",
          fontSize: 11,
          fontFamily: "Montserrat, sans-serif",
        },
      },
      ticks: {
        line: {
          stroke: isDark ? "rgba(255,255,255,0.08)" : "rgba(0,0,0,0.06)",
          strokeWidth: 1,
        },
        text: {
          fill: isDark ? "rgba(230,238,245,0.55)" : "rgba(26,32,44,0.55)",
          fontSize: 11,
          fontFamily: "Montserrat, sans-serif",
        },
      },
    },
    grid: {
      line: {
        stroke: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)",
        strokeWidth: 1,
      },
    },
    legends: {
      text: {
        fill: isDark ? "rgba(230,238,245,0.65)" : "rgba(26,32,44,0.65)",
        fontSize: 11,
        fontFamily: "Montserrat, sans-serif",
      },
    },
    tooltip: {
      container: {
        background: isDark ? "#172A36" : "#ffffff",
        color: isDark ? "#E6EEF5" : "#1A202C",
        fontSize: 12,
        fontFamily: "Montserrat, sans-serif",
        fontWeight: 600,
        borderRadius: 10,
        border: `1px solid ${isDark ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"}`,
        boxShadow: isDark
          ? "0 8px 24px rgba(0,0,0,0.45)"
          : "0 8px 24px rgba(0,0,0,0.12)",
        padding: "8px 14px",
      },
    },
  };

  return (
    <ResponsiveBar
      data={chartData}
      theme={nivoTheme}
      keys={keys}
      indexBy={indexBy}
      colors={({ index }) => BRAND_COLORS[index % BRAND_COLORS.length]}
      margin={{
        top: 16,
        right: isDashboard ? 8 : 130,
        bottom: isDashboard ? 44 : 50,
        left: isDashboard ? 44 : 60,
      }}
      padding={0.36}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      borderRadius={4}
      borderWidth={0}
      borderColor={{ from: "color", modifiers: [["darker", 1.4]] }}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 0,
        tickPadding: 10,
        tickRotation: isDashboard ? -28 : 0,
        legend: isDashboard ? undefined : "categoría",
        legendPosition: "middle",
        legendOffset: 38,
      }}
      axisLeft={{
        tickSize: 0,
        tickPadding: 8,
        tickValues: 4,
        tickRotation: 0,
        legend: isDashboard ? undefined : "cantidad",
        legendPosition: "middle",
        legendOffset: -48,
      }}
      enableGridX={false}
      enableGridY={true}
      enableLabel={false}
      isInteractive
      animate
      motionConfig="gentle"
      legends={
        isDashboard
          ? []
          : [
              {
                dataFrom: "keys",
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 120,
                translateY: 0,
                itemsSpacing: 4,
                itemWidth: 110,
                itemHeight: 20,
                itemDirection: "left-to-right",
                itemOpacity: 0.85,
                symbolSize: 10,
                symbolShape: "circle",
                effects: [{ on: "hover", style: { itemOpacity: 1 } }],
              },
            ]
      }
      role="application"
      ariaLabel="Gráfico de barras ArtDent"
    />
  );
};

export default BarChart;