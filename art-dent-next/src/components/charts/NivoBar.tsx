"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const ResponsiveBar = dynamic(
  () => import("@nivo/bar").then((m) => m.ResponsiveBar),
  { ssr: false }
);

function toNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

type BarDatum = { name: string; value: number };

function normalizeBarData(input: any): BarDatum[] {
  if (!input) return [];

  // Caso 1: ya viene como Nivo (array de objetos) con keys numéricas
  // -> si detectamos { name, value } lo usamos directo
  if (Array.isArray(input) && input.length && typeof input[0] === "object") {
    if ("name" in input[0] && "value" in input[0]) {
      return input.map((d: any) => ({ name: String(d.name), value: toNumber(d.value) }));
    }

    // Caso 2: backend típico: [{ label, value }]
    if ("label" in input[0] && "value" in input[0]) {
      return input.map((d: any) => ({ name: String(d.label), value: toNumber(d.value) }));
    }

    // Caso 3: [{ x, y }]
    if ("x" in input[0] && "y" in input[0]) {
      return input.map((d: any) => ({ name: String(d.x), value: toNumber(d.y) }));
    }
  }

  return [];
}

export default function BarChart({
  data,
  isDashboard = false,
}: {
  data?: any;
  isDashboard?: boolean;
}) {
  const chartData = useMemo(() => normalizeBarData(data), [data]);

  if (!chartData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveBar
      data={chartData}
      keys={["value"]}
      indexBy="name"
      margin={{ top: 16, right: 16, bottom: 56, left: 56 }}
      padding={0.3}
      valueScale={{ type: "linear" }}
      indexScale={{ type: "band", round: true }}
      enableGridY={true}
      enableLabel={false}
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 0,
        tickPadding: 10,
        tickRotation: -20,
        legend: isDashboard ? undefined : "",
        legendOffset: 46,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickSize: 0,
        tickPadding: 10,
        tickValues: 5,
        legend: isDashboard ? undefined : "",
        legendOffset: -48,
        legendPosition: "middle",
      }}
      tooltip={({ indexValue, value }) => (
        <div className="rounded-md border bg-background px-3 py-2 text-xs shadow">
          <div className="font-medium">{String(indexValue)}</div>
          <div className="text-muted-foreground">{Number(value).toLocaleString("es-AR")}</div>
        </div>
      )}
      theme={{
        text: { fill: "hsl(var(--foreground))", fontSize: 12 },
        axis: {
          ticks: { text: { fill: "hsl(var(--muted-foreground))" } },
          legend: { text: { fill: "hsl(var(--muted-foreground))" } },
        },
        grid: { line: { stroke: "hsl(var(--border))", strokeWidth: 1 } },
      }}
    />
  );
}
