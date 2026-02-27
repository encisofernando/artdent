// src/components/LineChart.jsx
import { useMemo, useRef, useState, useEffect } from "react";
import { ResponsiveLine } from "@nivo/line";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../theme";
import { mockLineData } from "../data/mockData";

/* ─── ArtDent brand palette para series ─── */
const BRAND_COLORS = [
  "#5AAD9C", // green (primario para ingresos)
  "#397B9C", // blue
  "#49949C", // teal
  "#7CA5C3", // blueSoft
  "#ACD6CE", // mint
];

const isValidPoint = (p) =>
  p && p.x !== null && p.x !== undefined && p.y !== null && p.y !== undefined;

const normalizeLineData = (incoming) => {
  if (!Array.isArray(incoming)) return [];
  return incoming
    .filter((s) => s && typeof s === "object")
    .map((s, i) => ({
      id:    s.id    ?? `Serie ${i + 1}`,
      color: s.color ?? BRAND_COLORS[i % BRAND_COLORS.length],
      data:  Array.isArray(s.data) ? s.data.filter(isValidPoint) : [],
    }))
    .filter((s) => s.data.length > 0);
};

const LineChart = ({ isCustomLineColors = false, isDashboard = false, data = null }) => {
  const theme  = useTheme();
  const colors = tokens(theme.palette.mode);
  const isDark = theme.palette.mode === "dark";

  const containerRef = useRef(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    if (!containerRef.current) return;
    const ro = new ResizeObserver(([entry]) => {
      if (entry.contentRect.width > 0) setReady(true);
    });
    ro.observe(containerRef.current);
    return () => ro.disconnect();
  }, []);

  const normalized = useMemo(() => normalizeLineData(data), [data]);
  const hasData    = normalized.length > 0;
  const chartData  = hasData ? normalized : mockLineData;

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
        stroke: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.05)",
        strokeWidth: 1,
        strokeDasharray: "4 4",
      },
    },
    crosshair: {
      line: {
        stroke: isDark ? "rgba(172,214,206,0.5)" : "rgba(57,123,156,0.4)",
        strokeWidth: 1,
        strokeDasharray: "4 4",
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

  /* ─── Color strategy ─── */
  // Si los datos tienen color propio (del backend o normalización), usarlo
  const lineColors = isCustomLineColors || hasData
    ? { datum: "color" }
    : ({ index }) => BRAND_COLORS[index % BRAND_COLORS.length];

  return (
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {ready && <ResponsiveLine
      data={chartData}
      theme={nivoTheme}
      colors={lineColors}
      margin={{
        top: isDashboard ? 16 : 50,
        right: isDashboard ? 16 : 120,
        bottom: isDashboard ? 44 : 56,
        left: isDashboard ? 48 : 64,
      }}
      xScale={{ type: "point" }}
      yScale={{
        type: "linear",
        min: "auto",
        max: "auto",
        stacked: false,   // ← false: las series no se apilan (más legible para ingresos)
        reverse: false,
      }}
      curve="catmullRom"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 0,
        tickPadding: 10,
        tickRotation: isDashboard ? -20 : 0,
        legend: isDashboard ? undefined : "período",
        legendOffset: 44,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickValues: 5,
        tickSize: 0,
        tickPadding: 10,
        tickRotation: 0,
        legend: isDashboard ? undefined : "valor",
        legendOffset: -52,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={true}
      /* ─── Area fill en modo dashboard (efecto visual limpio) ─── */
      enableArea={isDashboard}
      areaOpacity={isDark ? 0.1 : 0.06}
      /* ─── Puntos ─── */
      pointSize={isDashboard ? 4 : 8}
      pointColor={{ theme: "background" }}
      pointBorderWidth={2}
      pointBorderColor={{ from: "color", modifiers: [] }}
      /* ─── Línea ─── */
      lineWidth={2}
      useMesh
      animate
      motionConfig="gentle"
      legends={
        isDashboard
          ? []
          : [
              {
                anchor: "bottom-right",
                direction: "column",
                justify: false,
                translateX: 110,
                translateY: 0,
                itemsSpacing: 4,
                itemWidth: 90,
                itemHeight: 20,
                itemOpacity: 0.8,
                symbolSize: 10,
                symbolShape: "circle",
                symbolBorderColor: "rgba(0,0,0,.4)",
                effects: [
                  {
                    on: "hover",
                    style: { itemBackground: "rgba(0,0,0,.02)", itemOpacity: 1 },
                  },
                ],
              },
            ]
      }
    />}
    </div>
  );
};

export default LineChart;