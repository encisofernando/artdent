// src/components/modals/ModalVentaDetalle.jsx
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Typography, Divider, TextField, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Alert,
  Chip, Avatar, Box, IconButton, Tooltip, CircularProgress,
  useTheme, useMediaQuery,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import { useEffect, useMemo, useState, Suspense, lazy } from "react";
import { pdf } from "@react-pdf/renderer";

import CloseIcon          from "@mui/icons-material/Close";
import DownloadIcon       from "@mui/icons-material/Download";
import PrintIcon          from "@mui/icons-material/Print";
import PaymentsIcon       from "@mui/icons-material/Payments";
import SaveIcon           from "@mui/icons-material/Save";
import BlockIcon          from "@mui/icons-material/Block";
import ReceiptLongIcon    from "@mui/icons-material/ReceiptLong";
import StorefrontIcon     from "@mui/icons-material/Storefront";
import ShoppingBagIcon    from "@mui/icons-material/ShoppingBag";
import CheckCircleIcon    from "@mui/icons-material/CheckCircle";

import { getSalesHub, updateSalesHub, cancelSalesHub } from "../../services/salesHubService";
import ModalRegistrarPago from "./ModalRegistrarPago";
import RemitoDocument     from "../pdf/RemitoDocument";

// ─── Brand ───────────────────────────────────────────────────────────────────
const B = {
  blue:  "#397B9C",
  green: "#5AAD9C",
  teal:  "#49949C",
  mint:  "#ACD6CE",
};

// ─── Status configs ───────────────────────────────────────────────────────────
const STATUS_POS = [
  { value: "draft",      label: "Borrador"   },
  { value: "confirmed",  label: "Confirmada" },
  { value: "invoiced",   label: "Facturada"  },
  { value: "cancelled",  label: "Anulada"    },
];
const STATUS_ECOM = [
  { value: "pending",   label: "Pendiente" },
  { value: "paid",      label: "Pagada"    },
  { value: "shipped",   label: "Enviada"   },
  { value: "delivered", label: "Entregada" },
  { value: "cancelled", label: "Cancelada" },
];

const STATUS_COLOR = {
  cancelled:  { color: "#E63946", bg: "rgba(230,57,70,.1)"    },
  invoiced:   { color: B.green,   bg: alpha(B.green, 0.1)     },
  confirmed:  { color: B.blue,    bg: alpha(B.blue, 0.1)      },
  draft:      { color: "#64748b", bg: "rgba(100,116,139,.1)"  },
  paid:       { color: B.teal,    bg: alpha(B.teal, 0.1)      },
  partial:    { color: "#F4A261", bg: "rgba(244,162,97,.1)"   },
  shipped:    { color: B.blue,    bg: alpha(B.blue, 0.1)      },
  delivered:  { color: B.green,   bg: alpha(B.green, 0.1)     },
  pending:    { color: "#F4A261", bg: "rgba(244,162,97,.1)"   },
};

function StatusBadge({ value }) {
  const v   = String(value || "").toLowerCase();
  const cfg = STATUS_COLOR[v] || { color: "#64748b", bg: "rgba(100,116,139,.1)" };
  const label = [...STATUS_POS, ...STATUS_ECOM].find((s) => s.value === v)?.label ?? value ?? "—";
  return (
    <Box sx={{
      display: "inline-flex", alignItems: "center",
      px: 1.25, py: 0.4, borderRadius: "7px",
      bgcolor: cfg.bg,
      border: `1px solid ${alpha(cfg.color, 0.3)}`,
    }}>
      <Typography sx={{ fontSize: 11.5, fontWeight: 700, color: cfg.color, fontFamily: "Montserrat, sans-serif" }}>
        {label}
      </Typography>
    </Box>
  );
}

const fmt = (n) =>
  Number(n || 0).toLocaleString("es-AR", { style: "currency", currency: "ARS" });

const fmtDate = (d) =>
  d ? new Date(d).toLocaleDateString("es-AR", { day: "2-digit", month: "2-digit", year: "numeric" }) : "—";

// ─── Empresa config — ajustá estos datos a los reales ────────────────────────
const EMPRESA = {
  nombre:    "ARTDENT",
  slogan:    "Laboratorio Dental",
  direccion: "Av. Corrientes 1234, Piso 3",
  ciudad:    "Buenos Aires, CABA, C1043",
  pais:      "Argentina",
  telefono:  "+54 11 4321-5678",
  email:     "ventas@artdent.com.ar",
  cuit:      "30-71234567-8",
};

// ─── Main Component ───────────────────────────────────────────────────────────
export default function ModalVentaDetalle({ open, onClose, source, id, onChanged }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";
  const smDown = useMediaQuery(theme.breakpoints.down("sm"));

  // Palette
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.06)";
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const surfaceBg = isDark ? "#0F1F2A" : "#F7FAFC";
  const cardBg    = isDark ? "#172A36" : "#fff";
  const inputSx   = {
    "& .MuiOutlinedInput-root": { borderRadius: "10px", bgcolor: cardBg, fontSize: 13, color: textCol },
    "& .MuiInputLabel-root": { fontSize: 13, color: mutedCol },
    "& .MuiOutlinedInput-notchedOutline": { borderColor: borderCol },
    "& .MuiSelect-icon": { color: mutedCol },
  };

  // State
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving,  setSaving]  = useState(false);
  const [error,   setError]   = useState(null);
  const [pdfBusy, setPdfBusy] = useState(false);

  const [openPago, setOpenPago] = useState(false);

  const entity   = source === "pos" ? data?.sale   : data?.order;
  const receipts = data?.receipts ?? [];
  const statuses = useMemo(() => source === "pos" ? STATUS_POS : STATUS_ECOM, [source]);

  const [form, setForm] = useState({
    status:           "",
    observations:     "",
    shipping_address: "",
    notes:            "",
  });

  // ── Load ────────────────────────────────────────────────────────────────────
  const load = async () => {
    if (!open || !source || !id) return;
    setLoading(true);
    setError(null);
    try {
      const res = await getSalesHub(source, id);
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.message ?? "No se pudo cargar el detalle.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { load(); }, [open, source, id]);

  useEffect(() => {
    if (!open || !entity) return;
    setForm({
      status:           entity?.status           ?? "",
      observations:     entity?.observations     ?? "",
      shipping_address: entity?.shipping_address ?? "",
      notes:            entity?.notes            ?? "",
    });
  }, [open, entity]);

  // ── Computed ────────────────────────────────────────────────────────────────
  const total   = Number(entity?.total         ?? 0);
  const paid    = Number(receipts.reduce((s, r) => s + Number(r.amount ?? 0), 0));
  const pending = Math.max(total - paid, 0);
  const items   = entity?.items ?? [];

  const isPos       = source === "pos";
  const isCancelled = entity?.status === "cancelled";
  const numero      = entity?.number ?? entity?.code ?? entity?.id ?? "—";

  // ── PDF helpers ─────────────────────────────────────────────────────────────
  const buildPdfDoc = () => (
    <RemitoDocument
      entity={entity}
      source={source}
      receipts={receipts}
      empresa={EMPRESA}
    />
  );

  const handleDownload = async () => {
    if (!entity) return;
    setPdfBusy(true);
    try {
      const blob = await pdf(buildPdfDoc()).toBlob();
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `remito-${numero}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    } finally {
      setPdfBusy(false);
    }
  };

  const handlePrint = async () => {
    if (!entity) return;
    setPdfBusy(true);
    try {
      const blob = await pdf(buildPdfDoc()).toBlob();
      const url  = URL.createObjectURL(blob);
      const win  = window.open(url, "_blank");
      if (win) {
        win.addEventListener("load", () => win.print());
      }
    } finally {
      setPdfBusy(false);
    }
  };

  // ── Save / Cancel ───────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!entity) return;
    setSaving(true);
    setError(null);
    try {
      const payload = isPos
        ? { status: form.status, observations: form.observations }
        : { status: form.status, shipping_address: form.shipping_address, notes: form.notes };
      await updateSalesHub(source, entity.id, payload);
      onChanged?.();
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message ?? "No se pudo guardar.");
    } finally {
      setSaving(false);
    }
  };

  const handleAnular = async () => {
    if (!entity) return;
    setSaving(true);
    setError(null);
    try {
      await cancelSalesHub(source, entity.id);
      onChanged?.();
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message ?? "No se pudo anular.");
    } finally {
      setSaving(false);
    }
  };

  // ────────────────────────────────────────────────────────────────────────────
  return (
    <>
      <Dialog
        open={open}
        onClose={saving || pdfBusy ? undefined : onClose}
        fullWidth
        maxWidth="md"
        fullScreen={smDown}
        PaperProps={{
          sx: {
            borderRadius: smDown ? 0 : "18px",
            overflow: "hidden",
            bgcolor: surfaceBg,
            boxShadow: `0 24px 80px ${alpha(B.blue, 0.18)}`,
          },
        }}
      >
        {/* ── Header ────────────────────────────────────────────────────── */}
        <Box sx={{
          background: `linear-gradient(135deg, ${B.blue}, ${B.teal})`,
          px: 3, py: 2,
        }}>
          <Stack direction="row" alignItems="flex-start" justifyContent="space-between">
            <Stack direction="row" spacing={1.5} alignItems="flex-start">
              <Box sx={{
                width: 38, height: 38, borderRadius: "10px",
                bgcolor: "rgba(255,255,255,0.15)",
                display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0,
              }}>
                {isPos
                  ? <StorefrontIcon sx={{ fontSize: 18, color: "#fff" }} />
                  : <ShoppingBagIcon sx={{ fontSize: 18, color: "#fff" }} />
                }
              </Box>
              <Box>
                <Typography sx={{ fontSize: 15, fontWeight: 800, color: "#fff", fontFamily: "Montserrat, sans-serif", lineHeight: 1.15 }}>
                  {isPos ? "Venta POS" : "Pedido E-commerce"} #{numero}
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center" mt={0.4}>
                  <Typography sx={{ fontSize: 11, color: "rgba(255,255,255,0.7)" }}>
                    {fmtDate(entity?.sale_date ?? entity?.created_at)}
                  </Typography>
                  {entity?.status && (
                    <Box sx={{
                      px: 1, py: 0.2, borderRadius: "5px",
                      bgcolor: "rgba(255,255,255,0.2)",
                    }}>
                      <Typography sx={{ fontSize: 10.5, fontWeight: 700, color: "#fff" }}>
                        {statuses.find((s) => s.value === entity.status)?.label ?? entity.status}
                      </Typography>
                    </Box>
                  )}
                </Stack>
              </Box>
            </Stack>

            <Stack direction="row" spacing={0.75} alignItems="center">
              {/* PDF Buttons — only show when data loaded */}
              {entity && !loading && (
                <>
                  <Tooltip title="Descargar PDF" arrow>
                    <span>
                      <IconButton
                        onClick={handleDownload}
                        disabled={pdfBusy}
                        size="small"
                        sx={{
                          width: 34, height: 34, borderRadius: "9px",
                          bgcolor: "rgba(255,255,255,0.15)",
                          color: "#fff",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                          "&.Mui-disabled": { opacity: 0.4, color: "#fff" },
                        }}
                      >
                        {pdfBusy
                          ? <CircularProgress size={15} sx={{ color: "#fff" }} />
                          : <DownloadIcon sx={{ fontSize: 17 }} />
                        }
                      </IconButton>
                    </span>
                  </Tooltip>

                  <Tooltip title="Imprimir remito" arrow>
                    <span>
                      <IconButton
                        onClick={handlePrint}
                        disabled={pdfBusy}
                        size="small"
                        sx={{
                          width: 34, height: 34, borderRadius: "9px",
                          bgcolor: "rgba(255,255,255,0.15)",
                          color: "#fff",
                          "&:hover": { bgcolor: "rgba(255,255,255,0.25)" },
                          "&.Mui-disabled": { opacity: 0.4, color: "#fff" },
                        }}
                      >
                        <PrintIcon sx={{ fontSize: 17 }} />
                      </IconButton>
                    </span>
                  </Tooltip>
                </>
              )}

              <IconButton
                onClick={onClose}
                disabled={saving || pdfBusy}
                size="small"
                sx={{
                  width: 34, height: 34, borderRadius: "9px",
                  color: "rgba(255,255,255,0.7)",
                  "&:hover": { color: "#fff", bgcolor: "rgba(255,255,255,0.1)" },
                }}
              >
                <CloseIcon sx={{ fontSize: 18 }} />
              </IconButton>
            </Stack>
          </Stack>
        </Box>

        {/* ── Content ───────────────────────────────────────────────────── */}
        <DialogContent sx={{ p: 0, overflow: "auto" }}>

          {loading && (
            <Stack alignItems="center" justifyContent="center" height={200}>
              <CircularProgress size={28} sx={{ color: B.blue }} />
            </Stack>
          )}

          {!loading && !entity && (
            <Stack alignItems="center" justifyContent="center" height={200} spacing={1}>
              <ReceiptLongIcon sx={{ fontSize: 40, color: mutedCol, opacity: 0.4 }} />
              <Typography sx={{ fontSize: 14, color: mutedCol }}>Sin datos disponibles.</Typography>
            </Stack>
          )}

          {entity && (
            <Box sx={{ p: { xs: 2, md: 3 } }}>
              <Stack spacing={3}>

                {error && (
                  <Alert severity="error" sx={{ borderRadius: "10px", fontSize: 12.5 }}>
                    {error}
                  </Alert>
                )}

                {/* ── Totals strip ────────────────────────────────────── */}
                <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                  {[
                    { label: "Total",      value: fmt(total),   color: B.blue  },
                    { label: "Cobrado",    value: fmt(paid),    color: B.green },
                    { label: "Pendiente",  value: fmt(pending), color: pending > 0 ? "#E63946" : mutedCol },
                  ].map(({ label, value, color }) => (
                    <Box key={label} sx={{
                      flex: 1, p: 1.75, borderRadius: "12px",
                      bgcolor: cardBg, border: `1px solid ${borderCol}`,
                    }}>
                      <Typography sx={{ fontSize: 10.5, color: mutedCol, fontWeight: 700, textTransform: "uppercase", letterSpacing: "0.04em", mb: 0.4 }}>
                        {label}
                      </Typography>
                      <Typography sx={{ fontSize: 18, fontWeight: 800, color, fontFamily: "Montserrat, sans-serif", letterSpacing: "-0.02em" }}>
                        {value}
                      </Typography>
                    </Box>
                  ))}
                </Stack>

                {/* ── Editable fields ──────────────────────────────────── */}
                <Box sx={{ p: 2.5, borderRadius: "14px", bgcolor: cardBg, border: `1px solid ${borderCol}` }}>
                  <Typography sx={{ fontSize: 11, fontWeight: 700, color: mutedCol, textTransform: "uppercase", letterSpacing: "0.04em", mb: 2 }}>
                    Datos de la operación
                  </Typography>

                  <Stack spacing={2}>
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <TextField
                        select fullWidth label="Estado" size="small"
                        value={form.status}
                        onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
                        sx={inputSx}
                      >
                        {statuses.map((s) => (
                          <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                        ))}
                      </TextField>

                      <TextField
                        fullWidth label="Código / Nro." size="small"
                        value={numero} InputProps={{ readOnly: true }} sx={inputSx}
                      />

                      <TextField
                        fullWidth label="Fecha" size="small"
                        value={fmtDate(entity?.sale_date ?? entity?.created_at)}
                        InputProps={{ readOnly: true }} sx={inputSx}
                      />
                    </Stack>

                    {/* Customer info */}
                    <Stack direction={{ xs: "column", sm: "row" }} spacing={1.5}>
                      <TextField
                        fullWidth label="Cliente" size="small"
                        value={isPos ? (entity?.customer?.name ?? "Consumidor Final") : (entity?.customer_name ?? "")}
                        InputProps={{ readOnly: true }} sx={inputSx}
                      />
                      <TextField
                        fullWidth label="Email" size="small"
                        value={isPos ? (entity?.customer?.email ?? "") : (entity?.customer_email ?? "")}
                        InputProps={{ readOnly: true }} sx={inputSx}
                      />
                      <TextField
                        fullWidth label="Teléfono" size="small"
                        value={isPos ? (entity?.customer?.phone ?? "") : (entity?.customer_phone ?? "")}
                        InputProps={{ readOnly: true }} sx={inputSx}
                      />
                    </Stack>

                    {/* Observations */}
                    {isPos ? (
                      <TextField
                        label="Observaciones" fullWidth multiline minRows={2} size="small"
                        value={form.observations}
                        onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))}
                        sx={inputSx}
                      />
                    ) : (
                      <Stack spacing={1.5}>
                        <TextField
                          label="Dirección de envío" fullWidth multiline minRows={2} size="small"
                          value={form.shipping_address}
                          onChange={(e) => setForm((p) => ({ ...p, shipping_address: e.target.value }))}
                          sx={inputSx}
                        />
                        <TextField
                          label="Notas" fullWidth multiline minRows={2} size="small"
                          value={form.notes}
                          onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                          sx={inputSx}
                        />
                      </Stack>
                    )}
                  </Stack>
                </Box>

                {/* ── Items table ──────────────────────────────────────── */}
                <Box sx={{ borderRadius: "14px", bgcolor: cardBg, border: `1px solid ${borderCol}`, overflow: "hidden" }}>
                  <Box sx={{ px: 2.5, py: 1.75, borderBottom: `1px solid ${borderCol}` }}>
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: mutedCol, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Productos — {items.length} {items.length === 1 ? "ítem" : "ítems"}
                    </Typography>
                  </Box>

                  <Table size="small">
                    <TableHead>
                      <TableRow sx={{ bgcolor: isDark ? "#0D1B24" : "#EEF3F8" }}>
                        {["Producto", "Cantidad", "Precio unit.", "Total"].map((h, i) => (
                          <TableCell key={h}
                            align={i === 0 ? "left" : "right"}
                            sx={{ fontSize: 10.5, fontWeight: 700, color: mutedCol, textTransform: "uppercase", letterSpacing: "0.04em", py: 1.2, border: "none" }}
                          >
                            {h}
                          </TableCell>
                        ))}
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {items.map((it, idx) => (
                        <TableRow key={it.id ?? `${it.product_id}-${idx}`}
                          sx={{
                            bgcolor: idx % 2 === 0 ? "transparent" : (isDark ? alpha("#fff", 0.015) : alpha("#000", 0.012)),
                            "&:last-child td": { border: "none" },
                          }}
                        >
                          <TableCell sx={{ fontSize: 13, color: textCol, py: 1.5, borderColor: borderCol }}>
                            <Typography sx={{ fontSize: 12.5, fontWeight: 600, color: textCol, lineHeight: 1.3 }}>
                              {it?.product?.name ?? it?.name ?? it?.description ?? "—"}
                            </Typography>
                            {(it?.product?.sku ?? it?.sku) && (
                              <Typography sx={{ fontSize: 10.5, color: mutedCol }}>
                                SKU: {it?.product?.sku ?? it?.sku}
                              </Typography>
                            )}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: 12.5, color: textCol, py: 1.5, borderColor: borderCol }}>
                            {Number(it.qty ?? 0).toFixed(0)}
                          </TableCell>
                          <TableCell align="right" sx={{ fontSize: 12.5, color: mutedCol, py: 1.5, borderColor: borderCol }}>
                            {fmt(it.unit_price ?? 0)}
                          </TableCell>
                          <TableCell align="right" sx={{ py: 1.5, borderColor: borderCol }}>
                            <Typography sx={{ fontSize: 13, fontWeight: 800, color: B.blue, fontFamily: "Montserrat, sans-serif" }}>
                              {fmt(it.line_total ?? 0)}
                            </Typography>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Box>

                {/* ── Receipts ─────────────────────────────────────────── */}
                <Box sx={{ borderRadius: "14px", bgcolor: cardBg, border: `1px solid ${borderCol}`, overflow: "hidden" }}>
                  <Stack
                    direction="row" alignItems="center" justifyContent="space-between"
                    sx={{ px: 2.5, py: 1.75, borderBottom: receipts.length ? `1px solid ${borderCol}` : "none" }}
                  >
                    <Typography sx={{ fontSize: 11, fontWeight: 700, color: mutedCol, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                      Pagos / Recibos
                    </Typography>

                    {/* Register payment button — only POS, only not cancelled */}
                    {isPos && !isCancelled && (
                      <Button
                        size="small"
                        startIcon={<PaymentsIcon sx={{ fontSize: 15 }} />}
                        onClick={() => setOpenPago(true)}
                        sx={{
                          borderRadius: "8px", textTransform: "none",
                          fontWeight: 700, fontSize: 12,
                          fontFamily: "Montserrat, sans-serif",
                          color: B.blue, border: `1px solid ${alpha(B.blue, 0.35)}`,
                          px: 1.5, py: 0.5,
                          "&:hover": {
                            bgcolor: alpha(B.blue, 0.07),
                            border: `1px solid ${alpha(B.blue, 0.6)}`,
                          },
                        }}
                      >
                        Registrar pago
                      </Button>
                    )}
                  </Stack>

                  {receipts.length > 0 ? (
                    <Table size="small">
                      <TableHead>
                        <TableRow sx={{ bgcolor: isDark ? "#0D1B24" : "#EEF3F8" }}>
                          {["Comprobante", "Fecha", "Método", "Importe", "Referencia"].map((h, i) => (
                            <TableCell key={h}
                              align={i === 3 ? "right" : "left"}
                              sx={{ fontSize: 10.5, fontWeight: 700, color: mutedCol, textTransform: "uppercase", letterSpacing: "0.04em", py: 1.2, border: "none" }}
                            >
                              {h}
                            </TableCell>
                          ))}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {receipts.map((rc, idx) => (
                          <TableRow key={rc.id}
                            sx={{
                              bgcolor: idx % 2 === 0 ? "transparent" : (isDark ? alpha("#fff", 0.015) : alpha("#000", 0.012)),
                              "&:last-child td": { border: "none" },
                            }}
                          >
                            <TableCell sx={{ fontSize: 12.5, color: textCol, py: 1.5, borderColor: borderCol, fontWeight: 600 }}>
                              {rc.receipt_number ?? `#${rc.id}`}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12, color: mutedCol, py: 1.5, borderColor: borderCol }}>
                              {String(rc.receipt_date ?? "").slice(0, 10)}
                            </TableCell>
                            <TableCell sx={{ fontSize: 12, color: textCol, py: 1.5, borderColor: borderCol }}>
                              {rc.payment_method?.name ?? rc.payment_method_id ?? "—"}
                            </TableCell>
                            <TableCell align="right" sx={{ py: 1.5, borderColor: borderCol }}>
                              <Typography sx={{ fontSize: 13, fontWeight: 700, color: B.green, fontFamily: "Montserrat, sans-serif" }}>
                                {fmt(rc.amount)}
                              </Typography>
                            </TableCell>
                            <TableCell sx={{ fontSize: 12, color: mutedCol, py: 1.5, borderColor: borderCol }}>
                              {rc.reference ?? "—"}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  ) : (
                    <Stack alignItems="center" justifyContent="center" py={3} spacing={0.75}>
                      <PaymentsIcon sx={{ fontSize: 32, color: mutedCol, opacity: 0.35 }} />
                      <Typography sx={{ fontSize: 12.5, color: mutedCol }}>
                        Sin pagos registrados
                      </Typography>
                    </Stack>
                  )}
                </Box>

              </Stack>
            </Box>
          )}
        </DialogContent>

        {/* ── Footer Actions ────────────────────────────────────────────── */}
        {entity && (
          <Box sx={{
            px: 3, py: 2,
            borderTop: `1px solid ${borderCol}`,
            bgcolor: cardBg,
          }}>
            <Stack direction="row" spacing={1.25} justifyContent="flex-end">
              <Button
                onClick={onClose}
                disabled={saving}
                sx={{
                  borderRadius: "9px", textTransform: "none", fontWeight: 700,
                  borderColor: borderCol, color: mutedCol,
                  "&:hover": { borderColor: B.blue, color: B.blue, bgcolor: alpha(B.blue, 0.05) },
                }}
                variant="outlined"
              >
                Cerrar
              </Button>

              {!isCancelled && (
                <Button
                  startIcon={<BlockIcon sx={{ fontSize: 15 }} />}
                  onClick={handleAnular}
                  disabled={saving}
                  color="error"
                  variant="outlined"
                  sx={{
                    borderRadius: "9px", textTransform: "none", fontWeight: 700, fontSize: 12.5,
                    "&:hover": { bgcolor: alpha("#E63946", 0.07) },
                  }}
                >
                  Anular
                </Button>
              )}

              <Button
                startIcon={saving ? <CircularProgress size={14} sx={{ color: "#fff" }} /> : <SaveIcon sx={{ fontSize: 16 }} />}
                variant="contained"
                onClick={handleSave}
                disabled={saving || !entity}
                sx={{
                  borderRadius: "9px", textTransform: "none",
                  fontWeight: 800, fontFamily: "Montserrat, sans-serif",
                  px: 2.5,
                  background: `linear-gradient(90deg, ${B.blue}, ${B.teal})`,
                  boxShadow: `0 4px 12px ${alpha(B.blue, 0.3)}`,
                  "&.Mui-disabled": { opacity: 0.5 },
                }}
              >
                Guardar
              </Button>
            </Stack>
          </Box>
        )}
      </Dialog>

      {/* ── Payment modal ────────────────────────────────────────────────── */}
      {isPos && (
        <ModalRegistrarPago
          open={openPago}
          onClose={() => setOpenPago(false)}
          saleId={entity?.id}
          pendingAmount={pending}
          onSuccess={() => {
            setOpenPago(false);
            load(); // re-fetch to show new receipt
            onChanged?.();
          }}
        />
      )}
    </>
  );
}