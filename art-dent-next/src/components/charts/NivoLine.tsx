"use client";

import dynamic from "next/dynamic";
import React, { useMemo } from "react";

const ResponsiveLine = dynamic(
  () => import("@nivo/line").then((m) => m.ResponsiveLine),
  { ssr: false }
);

type Point = { x: string | number; y: number };
type Serie = { id: string; data: Point[] };

function toNumber(v: unknown): number {
  const n = typeof v === "number" ? v : Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeLineData(input: any): Serie[] {
  if (!input) return [];

  // Caso 1: ya viene en formato Nivo: [{ id, data:[{x,y}] }]
  if (Array.isArray(input) && input.length && input[0]?.id && Array.isArray(input[0]?.data)) {
    return input.map((s: any) => ({
      id: String(s.id),
      data: (s.data ?? []).map((p: any) => ({
        x: p?.x ?? "",
        y: toNumber(p?.y),
      })),
    }));
  }

  // Caso 2: lista simple de puntos: [{x,y}] o [{label,value}]
  if (Array.isArray(input) && input.length && typeof input[0] === "object") {
    const looksLikePoints = "x" in input[0] || ("label" in input[0] && "value" in input[0]);
    if (looksLikePoints) {
      const data: Point[] = input.map((p: any) => ({
        x: p?.x ?? p?.label ?? "",
        y: toNumber(p?.y ?? p?.value),
      }));
      return [{ id: "Serie", data }];
    }
  }

  return [];
}

export default function LineChart({
  data,
  isDashboard = false,
}: {
  data?: any;
  isDashboard?: boolean;
}) {
  const chartData = useMemo(() => normalizeLineData(data), [data]);

  if (!chartData.length) {
    return (
      <div className="h-full w-full flex items-center justify-center text-sm text-muted-foreground">
        Sin datos para mostrar
      </div>
    );
  }

  return (
    <ResponsiveLine
      data={chartData}
      margin={{ top: 24, right: 24, bottom: 48, left: 56 }}
      xScale={{ type: "point" }}
      yScale={{ type: "linear", min: "auto", max: "auto", stacked: false, reverse: false }}
      curve="monotoneX"
      axisTop={null}
      axisRight={null}
      axisBottom={{
        tickSize: 0,
        tickPadding: 10,
        tickRotation: 0,
        legend: isDashboard ? undefined : "",
        legendOffset: 36,
        legendPosition: "middle",
      }}
      axisLeft={{
        tickValues: 5,
        tickSize: 0,
        tickPadding: 10,
        legend: isDashboard ? undefined : "",
        legendOffset: -46,
        legendPosition: "middle",
      }}
      enableGridX={false}
      enableGridY={true}
      pointSize={8}
      pointBorderWidth={2}
      pointLabelYOffset={-12}
      useMesh={true}
      legends={isDashboard ? [] : [
        {
          anchor: "bottom-right",
          direction: "column",
          translateX: 8,
          translateY: 0,
          itemWidth: 90,
          itemHeight: 20,
          symbolSize: 10,
          symbolShape: "circle",
        },
      ]}
      tooltip={({ point }) => (
        <div className="rounded-md border bg-background px-3 py-2 text-xs shadow">
          <div className="font-medium">{String(point.data.xFormatted ?? point.data.x)}</div>
          <div className="text-muted-foreground">
            {Number(point.data.yFormatted ?? point.data.y).toLocaleString("es-AR")}
          </div>
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
