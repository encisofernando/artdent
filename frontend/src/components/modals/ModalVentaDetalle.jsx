import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, Stack, Typography, Divider, TextField, MenuItem,
  Table, TableBody, TableCell, TableHead, TableRow, Alert
} from "@mui/material";
import { useEffect, useMemo, useState } from "react";
import { getSalesHub, updateSalesHub, cancelSalesHub } from "../../services/salesHubService";

const STATUS_POS = [
  { value: "draft", label: "Borrador" },
  { value: "confirmed", label: "Confirmada" },
  { value: "invoiced", label: "Facturada" },
  { value: "cancelled", label: "Anulada" },
];
const STATUS_ECOM = [
  { value: "pending", label: "Pendiente" },
  { value: "paid", label: "Pagada" },
  { value: "shipped", label: "Enviada" },
  { value: "delivered", label: "Entregada" },
  { value: "cancelled", label: "Cancelada" },
];

export default function ModalVentaDetalle({ open, onClose, source, id, onChanged }) {
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [data, setData] = useState(null);

  const entity = source === "pos" ? data?.sale : data?.order;
  const statuses = useMemo(() => (source === "pos" ? STATUS_POS : STATUS_ECOM), [source]);

  const [form, setForm] = useState({
    status: "",
    observations: "",
    shipping_address: "",
    notes: "",
  });

  const load = async () => {
    if (!open || !source || !id) return;
    setLoading(true);
    try {
      setError(null);
      const res = await getSalesHub(source, id);
      setData(res);
    } catch (e) {
      setError(e?.response?.data?.message ?? "No se pudo cargar el detalle");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, source, id]);

  useEffect(() => {
    if (!open || !entity) return;
    setForm({
      status: entity?.status ?? "",
      observations: entity?.observations ?? "",
      shipping_address: entity?.shipping_address ?? "",
      notes: entity?.notes ?? "",
    });
  }, [open, entity]);

  const handleSave = async () => {
    if (!entity) return;
    try {
      setSaving(true);
      setError(null);
      const payload = source === "pos"
        ? { status: form.status, observations: form.observations }
        : { status: form.status, shipping_address: form.shipping_address, notes: form.notes };
      await updateSalesHub(source, entity.id, payload);
      onChanged?.();
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message ?? "No se pudo guardar");
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = async () => {
    if (!entity) return;
    try {
      setSaving(true);
      setError(null);
      await cancelSalesHub(source, entity.id);
      onChanged?.();
      onClose?.();
    } catch (e) {
      setError(e?.response?.data?.message ?? "No se pudo anular");
    } finally {
      setSaving(false);
    }
  };

  const items = entity?.items ?? [];
  const receipts = data?.receipts ?? [];

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="md">
      <DialogTitle>
        Detalle de venta ({source === "pos" ? "CRM / POS" : "E-commerce"})
      </DialogTitle>

      <DialogContent dividers>
        {loading && <Typography>Cargando…</Typography>}
        {!loading && !entity && <Typography>Sin datos.</Typography>}

        {entity && (
          <Stack spacing={2}>
            {error && <Alert severity="error">{error}</Alert>}

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                select
                fullWidth
                label="Estado"
                value={form.status}
                onChange={(e) => setForm((p) => ({ ...p, status: e.target.value }))}
              >
                {statuses.map((s) => (
                  <MenuItem key={s.value} value={s.value}>{s.label}</MenuItem>
                ))}
              </TextField>

              <TextField
                fullWidth
                label="Código"
                value={source === "pos" ? (entity.number ?? entity.id) : entity.code}
                InputProps={{ readOnly: true }}
              />

              <TextField
                fullWidth
                label="Total"
                value={Number(entity.total ?? 0).toFixed(2)}
                InputProps={{ readOnly: true }}
              />
            </Stack>

            <Divider />

            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                fullWidth
                label="Cliente"
                value={source === "pos"
                  ? (entity?.customer?.name ?? "Consumidor Final")
                  : (entity?.customer_name ?? "")}
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Email"
                value={source === "pos"
                  ? (entity?.customer?.email ?? "")
                  : (entity?.customer_email ?? "")}
                InputProps={{ readOnly: true }}
              />
              <TextField
                fullWidth
                label="Teléfono"
                value={source === "pos"
                  ? (entity?.customer?.phone ?? "")
                  : (entity?.customer_phone ?? "")}
                InputProps={{ readOnly: true }}
              />
            </Stack>

            {source === "pos" ? (
              <TextField
                label="Observaciones"
                value={form.observations}
                onChange={(e) => setForm((p) => ({ ...p, observations: e.target.value }))}
                fullWidth
                multiline
                minRows={2}
              />
            ) : (
              <>
                <TextField
                  label="Dirección de envío"
                  value={form.shipping_address}
                  onChange={(e) => setForm((p) => ({ ...p, shipping_address: e.target.value }))}
                  fullWidth
                  multiline
                  minRows={2}
                />
                <TextField
                  label="Notas"
                  value={form.notes}
                  onChange={(e) => setForm((p) => ({ ...p, notes: e.target.value }))}
                  fullWidth
                  multiline
                  minRows={2}
                />
              </>
            )}

            <Divider />

            <Typography variant="h6">Productos</Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Producto</TableCell>
                  <TableCell align="right">Cantidad</TableCell>
                  <TableCell align="right">Precio</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {items.map((it) => (
                  <TableRow key={it.id ?? `${it.product_id}-${it.sku}`}> 
                    <TableCell>
                      {it?.product?.name ?? it?.name ?? it?.description ?? ""}
                    </TableCell>
                    <TableCell align="right">{Number(it.qty ?? 0).toFixed(3)}</TableCell>
                    <TableCell align="right">{Number(it.unit_price ?? 0).toFixed(2)}</TableCell>
                    <TableCell align="right">{Number(it.line_total ?? 0).toFixed(2)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>

            <Divider />

            <Typography variant="h6">Pagos / Recibos</Typography>
            {receipts.length ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>Comprobante</TableCell>
                    <TableCell>Fecha</TableCell>
                    <TableCell align="right">Importe</TableCell>
                    <TableCell>Referencia</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {receipts.map((rc) => (
                    <TableRow key={rc.id}>
                      <TableCell>{rc.receipt_number ?? rc.id}</TableCell>
                      <TableCell>{String(rc.receipt_date ?? "").slice(0, 10)}</TableCell>
                      <TableCell align="right">{Number(rc.amount ?? 0).toFixed(2)}</TableCell>
                      <TableCell>{rc.reference ?? ""}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography color="text.secondary">Sin pagos registrados.</Typography>
            )}
          </Stack>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={saving}>Cerrar</Button>
        {entity && form.status !== "cancelled" && (
          <Button color="error" onClick={handleCancel} disabled={saving}>
            Anular
          </Button>
        )}
        <Button variant="contained" onClick={handleSave} disabled={saving || !entity}>
          Guardar
        </Button>
      </DialogActions>
    </Dialog>
  );
}
