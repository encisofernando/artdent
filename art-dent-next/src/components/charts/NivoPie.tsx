"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const ResponsivePie = dynamic(
  () => import("@nivo/pie").then((m) => m.ResponsivePie),
  { ssr: false }
);

function toNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

type PieDatum = { id: string; label: string; value: number };

function normalizePieData(input: any): PieDatum[] {
  if (!input) return [];

  // Caso 1: ya viene Nivo: [{ id, label, value }]
  if (Array.isArray(input) && input.length && input[0]?.id && "value" in input[0]) {
    return input.map((d: any) => ({
      id: String(d.id),
      label: String(d.label ?? d.id),
      value: toNumber(d.value),
    }));
  }

  // Caso 2: backend típico: [{ label, value }]
  if (Array.isArray(input) && input.length && "label" in input[0] && "value" in input[0]) {
    return input.map((d: any) => ({
      id: String(d.label),
      label: String(d.label),
      value: toNumber(d.value),
    }));
  }

  return [];
}

export default function PieChart({ data }: { data?: any }) {
  const chartData = useMemo(() => normalizePieData(data), [data]);

  if (!chartData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsivePie
      data={chartData}
      margin={{ top: 16, right: 16, bottom: 16, left: 16 }}
      innerRadius={0.6}
      padAngle={0.7}
      cornerRadius={6}
      activeOuterRadiusOffset={8}
      enableArcLabels={false}
      arcLinkLabelsSkipAngle={10}
      arcLinkLabelsTextColor="hsl(var(--muted-foreground))"
      arcLinkLabelsThickness={2}
      arcLinkLabelsColor={{ from: "color" }}
      tooltip={({ datum }) => (
        <div className="rounded-md border bg-background px-3 py-2 text-xs shadow">
          <div className="font-medium">{datum.label}</div>
          <div className="text-muted-foreground">{Number(datum.value).toLocaleString("es-AR")}</div>
        </div>
      )}
      theme={{
        text: { fill: "hsl(var(--foreground))", fontSize: 12 },
        legends: { text: { fill: "hsl(var(--muted-foreground))" } },
      }}
    />
  );
}
