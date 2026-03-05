// src/components/BarChart.jsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  BarChart as RBarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BRAND, BRAND_SERIES } from "@/lib/brand";

// fallback (si querés, reemplazalo por tu mockBarData)
const fallback = [
  { name: "A", value: 12 },
  { name: "B", value: 19 },
  { name: "C", value: 7 },
  { name: "D", value: 14 },
];

function normalizeBarData(data) {
  if (!Array.isArray(data) || data.length === 0) return fallback;

  // Caso ideal: [{ name, value }]
  if (data[0]?.name !== undefined && data[0]?.value !== undefined) return data;

  // Caso Nivo típico: [{ country: "AR", value: 10 }]
  if (data[0]?.country !== undefined && data[0]?.value !== undefined) {
    return data.map((d) => ({ name: String(d.country), value: Number(d.value || 0) }));
  }

  // Caso "Top productos": [{ label: "Producto", qty: 10 }]
  const keys = Object.keys(data[0] || {});
  const valueKey = keys.find((k) => typeof data[0][k] === "number") || "value";
  const nameKey = keys.find((k) => k !== valueKey) || "name";
  return data.map((d) => ({ name: String(d[nameKey] ?? ""), value: Number(d[valueKey] || 0) }));
}

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;
  const v = payload[0]?.value ?? 0;

  return (
    <div
      className={[
        "rounded-xl px-3 py-2 border shadow-lg",
        "font-semibold text-sm",
        isDark
          ? "bg-[#172A36] text-[#E6EEF5] border-white/10"
          : "bg-white text-[#1A202C] border-black/10",
      ].join(" ")}
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-0.5" style={{ color: BRAND.green }}>
        {Number(v).toLocaleString("es-AR")}
      </div>
    </div>
  );
}

export default function BarChart({ isDashboard = false, data = null, isDark = true }) {
  const chartData = useMemo(() => normalizeBarData(data), [data]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RBarChart
          data={chartData}
          margin={{
            top: 10,
            right: isDashboard ? 10 : 18,
            bottom: isDashboard ? 28 : 36,
            left: isDashboard ? 6 : 10,
          }}
          barCategoryGap={isDashboard ? 18 : 14}
        >
          <CartesianGrid
            vertical={false}
            stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="name"
            tick={{ fill: isDark ? "rgba(230,238,245,0.55)" : "rgba(26,32,44,0.55)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={isDashboard ? -24 : 0}
            textAnchor={isDashboard ? "end" : "middle"}
            height={isDashboard ? 44 : 32}
            style={{ fontFamily: "Montserrat, sans-serif" }}
          />
          <YAxis
            tick={{ fill: isDark ? "rgba(230,238,245,0.55)" : "rgba(26,32,44,0.55)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            width={isDashboard ? 34 : 42}
            style={{ fontFamily: "Montserrat, sans-serif" }}
          />
          <Tooltip
            cursor={{ fill: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)" }}
            content={<CustomTooltip isDark={isDark} />}
          />
          <Bar
            dataKey="value"
            radius={[6, 6, 6, 6]}
            fill={BRAND_SERIES[0]}
          />
        </RBarChart>
      </ResponsiveContainer>
    </div>
  );
}
