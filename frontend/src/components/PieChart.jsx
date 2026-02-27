// src/components/PieChart.jsx
import { useRef, useState, useEffect } from "react";
import { ResponsivePie } from "@nivo/pie";
import { useTheme } from "@mui/material";
import { tokens } from "../theme";
import { mockPieData } from "../data/mockData";

/* ─── ArtDent brand palette para sectores ─── */
const BRAND_COLORS = [
  "#397B9C", // blue
  "#5AAD9C", // green
  "#49949C", // teal
  "#7CA5C3", // blueSoft
  "#ACD6CE", // mint
  "#DAEEE3", // tertiaryMint
];

const PieChart = ({ data = null, isDashboard = false }) => {
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

  const chartData = data && data.length > 0 ? data : mockPieData;

  /* ─── Nivo theme alineado con la UI ─── */
  const nivoTheme = {
    background: "transparent",
    text: { fontFamily: "Montserrat, sans-serif", fontSize: 11 },
    legends: {
      text: {
        fill: isDark ? "rgba(230,238,245,0.65)" : "rgba(26,32,44,0.6)",
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
    <div ref={containerRef} style={{ width: "100%", height: "100%" }}>
      {ready && <ResponsivePie
      data={chartData}
      theme={nivoTheme}
      colors={({ index }) => BRAND_COLORS[index % BRAND_COLORS.length]}
      margin={
        isDashboard
          ? { top: 16, right: 16, bottom: 48, left: 16 }
          : { top: 40, right: 80, bottom: 80, left: 80 }
      }
      /* ─── Donut style ─── */
      innerRadius={0.58}
      padAngle={1.2}
      cornerRadius={4}
      activeOuterRadiusOffset={6}
      /* ─── Sin borde ni patrones ─── */
      borderWidth={0}
      borderColor={{ from: "color", modifiers: [["darker", 0.2]] }}
      /* ─── Arc labels: desactivados (limpio) ─── */
      enableArcLabels={false}
      /* ─── Arc link labels: solo en modo completo ─── */
      arcLinkLabelsSkipAngle={isDashboard ? 999 : 10}
      arcLinkLabelsTextColor={
        isDark ? "rgba(230,238,245,0.7)" : "rgba(26,32,44,0.65)"
      }
      arcLinkLabelsThickness={1.5}
      arcLinkLabelsColor={{ from: "color" }}
      arcLinkLabelsDiagonalLength={12}
      arcLinkLabelsStraightLength={14}
      arcLinkLabelsTextOffset={4}
      /* ─── Leyenda en la parte inferior ─── */
      legends={[
        {
          anchor: "bottom",
          direction: "row",
          justify: false,
          translateX: 0,
          translateY: isDashboard ? 40 : 56,
          itemsSpacing: 6,
          itemWidth: 80,
          itemHeight: 16,
          itemTextColor: isDark ? "rgba(230,238,245,0.65)" : "rgba(26,32,44,0.6)",
          itemDirection: "left-to-right",
          itemOpacity: 1,
          symbolSize: 10,
          symbolShape: "circle",
          effects: [
            {
              on: "hover",
              style: { itemTextColor: "#5AAD9C", itemOpacity: 1 },
            },
          ],
        },
      ]}
      animate
      motionConfig="gentle"
    />}
    </div>
  );
};

export default PieChart;