// src/components/LineChart.jsx
import React, { useMemo } from "react";
import {
  ResponsiveContainer,
  LineChart as RLineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";
import { BRAND_SERIES, BRAND } from "@/lib/brand";

// fallback simple
const fallback = [
  { x: "Ene", value: 12 },
  { x: "Feb", value: 19 },
  { x: "Mar", value: 7 },
  { x: "Abr", value: 14 },
];

function normalizeNivoToRecharts(series) {
  // series: [{id, data:[{x,y}]}]
  if (!Array.isArray(series) || series.length === 0) {
    return { rows: fallback, lines: [{ key: "value", name: "Ingresos", color: BRAND.green }] };
  }

  // Si ya viene como rows estilo recharts
  if (series[0]?.x !== undefined && (series[0]?.value !== undefined || typeof series[0]?.value === "number")) {
    return { rows: series, lines: [{ key: "value", name: "Ingresos", color: BRAND.green }] };
  }

  // Caso Nivo
  const valid = series
    .filter((s) => s && typeof s === "object" && Array.isArray(s.data))
    .map((s, i) => ({
      id: String(s.id ?? `Serie ${i + 1}`),
      color: s.color ?? BRAND_SERIES[i % BRAND_SERIES.length],
      data: s.data.filter((p) => p && p.x != null && p.y != null),
    }))
    .filter((s) => s.data.length > 0);

  if (valid.length === 0) {
    return { rows: fallback, lines: [{ key: "value", name: "Ingresos", color: BRAND.green }] };
  }

  // construir rows por x
  const xSet = new Set();
  valid.forEach((s) => s.data.forEach((p) => xSet.add(String(p.x))));
  const xs = Array.from(xSet);

  const rows = xs.map((x) => {
    const row = { x };
    valid.forEach((s) => {
      const hit = s.data.find((p) => String(p.x) === x);
      row[s.id] = hit ? Number(hit.y) : null;
    });
    return row;
  });

  const lines = valid.map((s) => ({ key: s.id, name: s.id, color: s.color }));
  return { rows, lines };
}

function CustomTooltip({ active, payload, label, isDark }) {
  if (!active || !payload?.length) return null;

  return (
    <div
      className={[
        "rounded-xl px-3 py-2 border shadow-lg",
        isDark
          ? "bg-[#172A36] text-[#E6EEF5] border-white/10"
          : "bg-white text-[#1A202C] border-black/10",
      ].join(" ")}
      style={{ fontFamily: "Montserrat, sans-serif" }}
    >
      <div className="text-xs opacity-70">{label}</div>
      <div className="mt-1 space-y-1">
        {payload.map((p) => (
          <div key={p.dataKey} className="flex items-center justify-between gap-4">
            <span className="text-xs opacity-80">{p.name}</span>
            <span className="text-sm font-extrabold" style={{ color: p.color }}>
              {Number(p.value || 0).toLocaleString("es-AR")}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function LineChart({
  isDashboard = false,
  data = null,
  isDark = true,
}) {
  const { rows, lines } = useMemo(() => normalizeNivoToRecharts(data), [data]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RLineChart
          data={rows}
          margin={{
            top: 10,
            right: isDashboard ? 10 : 18,
            bottom: isDashboard ? 28 : 36,
            left: isDashboard ? 6 : 10,
          }}
        >
          <CartesianGrid
            vertical={false}
            stroke={isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.06)"}
            strokeDasharray="4 4"
          />
          <XAxis
            dataKey="x"
            tick={{ fill: isDark ? "rgba(230,238,245,0.55)" : "rgba(26,32,44,0.55)", fontSize: 11 }}
            tickLine={false}
            axisLine={false}
            interval={0}
            angle={isDashboard ? -20 : 0}
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
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          {lines.map((l) => (
            <Line
              key={l.key}
              type="monotone"
              dataKey={l.key}
              name={l.name}
              stroke={l.color}
              strokeWidth={2}
              dot={isDashboard ? false : { r: 3 }}
              activeDot={{ r: 5 }}
              connectNulls
            />
          ))}
        </RLineChart>
      </ResponsiveContainer>
    </div>
  );
}
