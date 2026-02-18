"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import toast from "react-hot-toast";
import { DashboardService } from "@/services";
import { cn } from "@/lib/utils";

// shadcn
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { ToggleGroup, ToggleGroupItem } from "@/components/ui/toggle-group";
import { Input } from "@/components/ui/input";

// Icons
import {
  Download,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  DollarSign,
  ShoppingCart,
  UserPlus,
  Activity,
  Maximize2,
} from "lucide-react";

// Nivo charts
import NivoLine from "@/components/charts/NivoLine";
import NivoBar from "@/components/charts/NivoBar";
import NivoPie from "@/components/charts/NivoPie";

type DashboardPeriod = "today" | "week" | "month" | "year" | "custom";

type DashboardStats = {
  current?: {
    total_sales?: number;
    revenue?: number;
    new_customers?: number;
    avg_ticket?: number;
    tax?: number;
    items_sold?: number;
  };
  trends?: {
    sales?: number;
    revenue?: number;
    customers?: number;
    avg_ticket?: number;
  };
};

type Transaction = {
  txId: string;
  user: string;
  date: string;
  cost: number | string;
};

function formatNumber(num: number) {
  if (!num) return "0";
  if (num >= 1_000_000) return `${(num / 1_000_000).toFixed(1)}M`;
  if (num >= 1_000) return `${(num / 1_000).toFixed(1)}K`;
  return num.toLocaleString("es-AR");
}

function formatCurrency(num: number) {
  if (!num) return "$0";
  return `$${formatNumber(num)}`;
}

function StatCard(props: {
  title: string;
  value: string;
  subtitle: string;
  icon: React.ReactNode;
  trend?: number;
  progress?: number; // 0..1
  loading?: boolean;
}) {
  const { title, value, subtitle, icon, trend, progress, loading } = props;

  return (
    <Card className="relative overflow-hidden">
      <CardContent className="p-5">
        {loading ? (
          <div className="space-y-3">
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-10 w-40" />
            <Skeleton className="h-4 w-48" />
            <Skeleton className="h-2 w-full" />
          </div>
        ) : (
          <div className="space-y-3">
            <div className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <div className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {title}
                </div>
                <div className="mt-1 text-3xl font-extrabold leading-tight">
                  {value}
                </div>
                <div className="mt-1 text-sm text-muted-foreground">
                  {subtitle}
                </div>
              </div>

              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                {icon}
              </div>
            </div>

            {typeof progress === "number" && (
              <div className="h-2 w-full rounded-full bg-muted">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.max(0, Math.min(1, progress)) * 100}%` }}
                />
              </div>
            )}

            {typeof trend === "number" && (
              <div className="flex items-center gap-2 text-xs font-semibold">
                {trend >= 0 ? (
                  <TrendingUp className="h-4 w-4 text-emerald-500" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-rose-500" />
                )}
                <span className={cn(trend >= 0 ? "text-emerald-500" : "text-rose-500")}>
                  {trend >= 0 ? "+" : ""}
                  {trend}% vs anterior
                </span>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function TransactionItem({ transaction }: { transaction: Transaction }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-xl border p-3 transition hover:bg-muted/50">
      <div className="flex min-w-0 items-center gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold">
          {(transaction.user?.[0] || "?").toUpperCase()}
        </div>

        <div className="min-w-0">
          <div className="truncate text-sm font-semibold">{transaction.txId}</div>
          <div className="truncate text-xs text-muted-foreground">
            {transaction.user}
          </div>
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <Badge className="font-bold">
          ${typeof transaction.cost === "string" ? transaction.cost : transaction.cost}
        </Badge>
        <div className="text-[10px] text-muted-foreground whitespace-nowrap">
          {transaction.date}
        </div>
      </div>
    </div>
  );
}

function FullscreenChartModal(props: {
  open: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}) {
  const { open, onClose, title, children } = props;

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-[1100px]">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">{title}</DialogTitle>
        </DialogHeader>
        <div className="h-[70vh]">{children}</div>
      </DialogContent>
    </Dialog>
  );
}

export default function DashboardPage() {
  const [period, setPeriod] = useState<DashboardPeriod>("month");
  const [customDates, setCustomDates] = useState({ start: "", end: "" });

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [revenueData, setRevenueData] = useState<any[]>([]);
  const [salesData, setSalesData] = useState<any[]>([]);
  const [categoryData, setCategoryData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const [fullscreenChart, setFullscreenChart] = useState<
    null | "revenue" | "sales" | "categories"
  >(null);

  const params = useMemo(() => {
    if (period === "custom" && customDates.start && customDates.end) {
      return {
        period,
        start_date: customDates.start,
        end_date: customDates.end,
      };
    }
    return { period };
  }, [period, customDates]);

  const fetchDashboardData = useCallback(async () => {
    setLoading(true);
    try {
      const [statsResponse, transactionsResponse, revenueResponse, salesResponse, catResponse] =
        await Promise.all([
          DashboardService.getStats<DashboardStats>(params),
          DashboardService.getRecentTransactions<Transaction[]>(10),
          DashboardService.getChartData<any[]>("revenue", period),
          DashboardService.getChartData<any[]>("sales", period),
          DashboardService.getChartData<any[]>("products", period), // o "categories" si tu API lo soporta
        ]);

      setStats(statsResponse);
      setTransactions(transactionsResponse || []);
      setRevenueData(revenueResponse || []);
      setSalesData(salesResponse || []);
      setCategoryData(catResponse || []);

      toast.success("Dashboard actualizado");
    } catch (error) {
      console.error("Error loading dashboard:", error);
      toast.error("Error al cargar datos del dashboard");
    } finally {
      setLoading(false);
    }
  }, [params, period]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  useEffect(() => {
    const interval = setInterval(fetchDashboardData, 30000);
    return () => clearInterval(interval);
  }, [fetchDashboardData]);

  const handleExportPDF = async () => {
    try {
      const blob = await DashboardService.exportPDF(params);
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `dashboard_${Date.now()}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);

      toast.success("PDF descargado exitosamente");
    } catch (error) {
      console.error("Error exporting PDF:", error);
      toast.error("Error al exportar PDF");
    }
  };

  const current = stats?.current ?? {};
  const trends = stats?.trends ?? {};

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div className="min-w-0">
            <h1 className="text-2xl font-extrabold tracking-tight">Panel de Control</h1>
            <p className="text-sm text-muted-foreground">
              Análisis en tiempo real de tu negocio
            </p>
          </div>

          <div className="flex w-full flex-col gap-2 sm:w-auto sm:items-end">
              {/* Period selector responsive (SIN scroll) */}
              <div className="w-full sm:w-auto">
                {/* Mobile: select */}
                <div className="sm:hidden">
                  <select
                    value={period}
                    onChange={(e) => setPeriod(e.target.value as DashboardPeriod)}
                    className="h-10 w-full rounded-md border bg-background px-3 text-sm"
                  >
                    <option value="today">Hoy</option>
                    <option value="week">Semana</option>
                    <option value="month">Mes</option>
                    <option value="year">Año</option>
                    <option value="custom">Personalizado</option>
                  </select>
                </div>

                {/* Desktop: ToggleGroup */}
                <div className="hidden sm:block">
                  <ToggleGroup
                    type="single"
                    value={period}
                    onValueChange={(v) => v && setPeriod(v as DashboardPeriod)}
                    className="flex flex-wrap gap-1"
                  >
                    <ToggleGroupItem value="today">Hoy</ToggleGroupItem>
                    <ToggleGroupItem value="week">Semana</ToggleGroupItem>
                    <ToggleGroupItem value="month">Mes</ToggleGroupItem>
                    <ToggleGroupItem value="year">Año</ToggleGroupItem>
                    <ToggleGroupItem value="custom">Personalizado</ToggleGroupItem>
                  </ToggleGroup>
                </div>
              </div>


            {/* Custom dates: en mobile 2 columnas */}
            {period === "custom" && (
              <div className="grid grid-cols-2 gap-2 sm:flex sm:items-center sm:justify-end">
                <Input
                  type="date"
                  value={customDates.start}
                  onChange={(e) => setCustomDates((p) => ({ ...p, start: e.target.value }))}
                />
                <Input
                  type="date"
                  value={customDates.end}
                  onChange={(e) => setCustomDates((p) => ({ ...p, end: e.target.value }))}
                />
              </div>
            )}

            {/* Acciones: en mobile solo iconos */}
            <div className="flex items-center justify-start gap-2 sm:justify-end">
              <Button
                variant="outline"
                onClick={fetchDashboardData}
                disabled={loading}
                size="icon"
                className="sm:hidden"
                aria-label="Actualizar"
                title="Actualizar"
              >
                <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
              </Button>

              <Button
                variant="outline"
                onClick={fetchDashboardData}
                disabled={loading}
                className="hidden sm:inline-flex"
              >
                <RefreshCw className={cn("mr-2 h-4 w-4", loading && "animate-spin")} />
                Actualizar
              </Button>

              <Button
                onClick={handleExportPDF}
                size="icon"
                className="sm:hidden"
                aria-label="Exportar PDF"
                title="Exportar PDF"
              >
                <Download className="h-4 w-4" />
              </Button>

              <Button onClick={handleExportPDF} className="hidden sm:inline-flex">
                <Download className="mr-2 h-4 w-4" />
                Exportar PDF
              </Button>
            </div>
          </div>
        </div>


      {/* Stats */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Ventas"
          value={formatNumber(Number(current.total_sales || 0))}
          subtitle={`${formatNumber(Number(current.total_sales || 0))} operaciones`}
          icon={<ShoppingCart className="h-6 w-6" />}
          trend={typeof trends.sales === "number" ? trends.sales : undefined}
          progress={0.75}
          loading={loading}
        />
        <StatCard
          title="Ingresos"
          value={formatCurrency(Number(current.revenue || 0))}
          subtitle="Total del período"
          icon={<DollarSign className="h-6 w-6" />}
          trend={typeof trends.revenue === "number" ? trends.revenue : undefined}
          progress={0.65}
          loading={loading}
        />
        <StatCard
          title="Nuevos Clientes"
          value={formatNumber(Number(current.new_customers || 0))}
          subtitle="Este período"
          icon={<UserPlus className="h-6 w-6" />}
          trend={typeof trends.customers === "number" ? trends.customers : undefined}
          progress={0.45}
          loading={loading}
        />
        <StatCard
          title="Ticket Promedio"
          value={formatCurrency(Number(current.avg_ticket || 0))}
          subtitle="Por operación"
          icon={<Activity className="h-6 w-6" />}
          trend={typeof trends.avg_ticket === "number" ? trends.avg_ticket : undefined}
          progress={0.55}
          loading={loading}
        />
      </div>

      {/* Main row */}
      <div className="grid grid-cols-1 gap-3 lg:grid-cols-12">
        {/* Revenue chart */}
        <Card className="lg:col-span-8">
          <CardHeader className="flex flex-row items-start justify-between gap-4">
            <div>
              <CardTitle className="text-lg font-bold">Ingresos Generados</CardTitle>
              <div className="mt-2 flex items-center gap-2">
                <div className="text-3xl font-extrabold text-emerald-500">
                  {formatCurrency(Number(current.revenue || 0))}
                </div>
                {typeof trends.revenue === "number" && (
                  <Badge variant={trends.revenue >= 0 ? "default" : "destructive"}>
                    {trends.revenue >= 0 ? "+" : ""}
                    {trends.revenue}%
                  </Badge>
                )}
              </div>
            </div>

          {/* Desktop/tablet */}
          <Button
            variant="outline"
            className="hidden sm:inline-flex"
            onClick={() => setFullscreenChart("revenue")}
          >
            <Maximize2 className="mr-2 h-4 w-4" />
            Pantalla completa
          </Button>

          {/* Mobile */}
          <Button
            variant="outline"
            size="icon"
            className="sm:hidden"
            onClick={() => setFullscreenChart("revenue")}
            aria-label="Pantalla completa"
            title="Pantalla completa"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>

          </CardHeader>

          <CardContent>
            <div className="h-[360px]">
              {loading ? <Skeleton className="h-full w-full" /> : <NivoLine data={revenueData} />}
            </div>
          </CardContent>
        </Card>

        {/* Transactions */}
        <Card className="lg:col-span-4">
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Transacciones Recientes</CardTitle>
            <Badge variant="outline">{transactions.length}</Badge>
          </CardHeader>

          <CardContent>
            <div className="max-h-[360px] space-y-2 overflow-auto pr-1">
              {loading ? (
                <div className="space-y-2">
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                  <Skeleton className="h-14 w-full" />
                </div>
              ) : transactions.length === 0 ? (
                <div className="py-10 text-center text-sm text-muted-foreground">
                  No hay transacciones en este período
                </div>
              ) : (
                transactions.map((t, i) => (
                  <TransactionItem key={`${t.txId}-${i}`} transaction={t} />
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bottom row */}
      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg font-bold">Resumen del Período</CardTitle>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="space-y-3">
                <Skeleton className="h-40 w-40 rounded-full mx-auto" />
                <Skeleton className="h-6 w-32 mx-auto" />
                <Skeleton className="h-4 w-40 mx-auto" />
              </div>
            ) : (
              <div className="flex flex-col items-center gap-2 py-4">
                {(() => {
                  const revenue = Number(current.revenue || 0);
                  const tax = Number(current.tax || 0);
                  const denom = revenue + tax || 1;
                  const pct = Math.round((revenue / denom) * 100);
                  const deg = (revenue / denom) * 360;

                  return (
                    <>
                      <div
                        className="relative h-40 w-40 rounded-full"
                        style={{
                          background: `conic-gradient(hsl(var(--primary)) 0deg ${deg}deg, hsl(var(--muted)) ${deg}deg 360deg)`,
                        }}
                      >
                        <div className="absolute inset-6 rounded-full bg-background flex flex-col items-center justify-center">
                          <div className="text-3xl font-extrabold text-primary">{pct}%</div>
                          <div className="text-xs text-muted-foreground">Completado</div>
                        </div>
                      </div>

                      <div className="text-xl font-extrabold text-emerald-500">
                        {formatCurrency(revenue)}
                      </div>
                      <div className="text-sm text-muted-foreground">Ingresos generados</div>
                      <div className="text-xs text-muted-foreground">
                        {formatNumber(Number(current.items_sold || 0))} items vendidos
                      </div>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Top Productos</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setFullscreenChart("sales")}>
              <Maximize2 className="mr-2 h-4 w-4" />
              Ver
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {loading ? <Skeleton className="h-full w-full" /> : <NivoBar data={salesData} />}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle className="text-lg font-bold">Por Categoría</CardTitle>
            <Button variant="outline" size="sm" onClick={() => setFullscreenChart("categories")}>
              <Maximize2 className="mr-2 h-4 w-4" />
              Ver
            </Button>
          </CardHeader>
          <CardContent>
            <div className="h-[280px]">
              {loading ? <Skeleton className="h-full w-full" /> : <NivoPie data={categoryData} />}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Fullscreen modals */}
      <FullscreenChartModal
        open={fullscreenChart === "revenue"}
        onClose={() => setFullscreenChart(null)}
        title="Ingresos Generados - Vista Completa"
      >
        <NivoLine data={revenueData} />
      </FullscreenChartModal>

      <FullscreenChartModal
        open={fullscreenChart === "sales"}
        onClose={() => setFullscreenChart(null)}
        title="Top Productos - Vista Completa"
      >
        <NivoBar data={salesData} />
      </FullscreenChartModal>

      <FullscreenChartModal
        open={fullscreenChart === "categories"}
        onClose={() => setFullscreenChart(null)}
        title="Distribución por Categorías - Vista Completa"
      >
        <NivoPie data={categoryData} />
      </FullscreenChartModal>
    </div>
  );
}
