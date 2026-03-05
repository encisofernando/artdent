// src/components/PieChart.jsx
import React, { useMemo } from "react";
import { ResponsiveContainer, PieChart as RPieChart, Pie, Cell, Tooltip, Legend } from "recharts";
import { BRAND_SERIES } from "@/lib/brand";

const fallback = [
  { name: "A", value: 30 },
  { name: "B", value: 22 },
  { name: "C", value: 18 },
  { name: "D", value: 12 },
];

function normalizePieData(data) {
  if (!Array.isArray(data) || data.length === 0) return fallback;
  if (data[0]?.name !== undefined && data[0]?.value !== undefined) return data;

  // Caso Nivo: [{ id, value }]
  if (data[0]?.id !== undefined && data[0]?.value !== undefined) {
    return data.map((d) => ({ name: String(d.id), value: Number(d.value || 0) }));
  }

  return fallback;
}

function CustomTooltip({ active, payload, isDark }) {
  if (!active || !payload?.length) return null;
  const p = payload[0];
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
      <div className="text-xs opacity-70">{p.name}</div>
      <div className="text-sm font-extrabold mt-0.5">
        {Number(p.value || 0).toLocaleString("es-AR")}
      </div>
    </div>
  );
}

export default function PieChart({ data = null, isDashboard = false, isDark = true }) {
  const chartData = useMemo(() => normalizePieData(data), [data]);

  return (
    <div style={{ width: "100%", height: "100%" }}>
      <ResponsiveContainer width="100%" height="100%">
        <RPieChart>
          <Tooltip content={<CustomTooltip isDark={isDark} />} />
          {!isDashboard && (
            <Legend
              verticalAlign="bottom"
              height={36}
              wrapperStyle={{
                fontFamily: "Montserrat, sans-serif",
                fontSize: 12,
                opacity: isDark ? 0.75 : 0.7,
              }}
            />
          )}
          <Pie
            data={chartData}
            dataKey="value"
            nameKey="name"
            cx="50%"
            cy="48%"
            innerRadius={isDashboard ? "55%" : "58%"}
            outerRadius={isDashboard ? "78%" : "82%"}
            paddingAngle={2}
            cornerRadius={6}
            stroke="transparent"
          >
            {chartData.map((_, i) => (
              <Cell key={i} fill={BRAND_SERIES[i % BRAND_SERIES.length]} />
            ))}
          </Pie>
        </RPieChart>
      </ResponsiveContainer>
    </div>
  );
}
