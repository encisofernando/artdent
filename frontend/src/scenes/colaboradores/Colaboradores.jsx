import { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Switch,
  FormControlLabel,
  Stack,
  Typography,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import Header from "../../components/Header";
import { Collaborators as CollaboratorsService } from "../../services";

const emptyForm = {
  name: "",
  document: "",
  hourly_rate: 0,
  is_active: true,
  notes: "",
};

export default function Colaboradores() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [search, setSearch] = useState("");

  // refs para manejo de foco (evitar warning aria-hidden)
  const btnNuevoRef = useRef(null);
  const nombreInputRef = useRef(null);

  const showApiError = (e, fallback = "Ocurrió un error.") => {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      fallback;
    console.error(e);
    alert(msg);
  };

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await CollaboratorsService.Collaborators.list({ search });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      showApiError(e, "Error cargando colaboradores.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // cuando abre el dialog, forzar foco dentro del modal
  useEffect(() => {
    if (!open) return;
    const t = setTimeout(() => nombreInputRef.current?.focus(), 0);
    return () => clearTimeout(t);
  }, [open]);

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      { field: "name", headerName: "Nombre", flex: 1, minWidth: 200 },
      { field: "document", headerName: "Documento", width: 160 },
      {
        field: "hourly_rate",
        headerName: "$/Hora",
        width: 130,
        valueFormatter: (p) => {
          const v = Number(p.value || 0);
          return `$ ${v.toFixed(2)}`;
        },
      },
      { field: "is_active", headerName: "Activo", width: 100, type: "boolean" },
      {
        field: "actions",
        headerName: "Acciones",
        width: 220,
        sortable: false,
        renderCell: (params) => (
          <Stack direction="row" spacing={1}>
            <Button
              size="small"
              variant="outlined"
              onClick={() => onEdit(params.row)}
            >
              Editar
            </Button>
            <Button
              size="small"
              variant="outlined"
              color="error"
              onClick={() => onDelete(params.row)}
            >
              Eliminar
            </Button>
          </Stack>
        ),
      },
    ],
    []
  );

  const closeDialog = () => {
    setOpen(false);
    // devolver foco al botón "Nuevo colaborador" cuando cierre
    setTimeout(() => btnNuevoRef.current?.focus(), 0);
  };

  const onAdd = () => {
    // IMPORTANTE: sacar foco del botón antes de abrir (evita warning)
    btnNuevoRef.current?.blur();

    setEditingId(null);
    setForm(emptyForm);
    setOpen(true);
  };

  const onEdit = (row) => {
    // también ayuda en editar (si se dispara desde un botón en el grid)
    (document.activeElement instanceof HTMLElement) && document.activeElement.blur();

    setEditingId(row.id);
    setForm({
      name: row.name || "",
      document: row.document || "",
      hourly_rate: Number(row.hourly_rate || 0),
      is_active: !!row.is_active,
      notes: row.notes || "",
    });
    setOpen(true);
  };

  const onDelete = async (row) => {
    if (!window.confirm(`Eliminar colaborador "${row.name}"?`)) return;
    try {
      await CollaboratorsService.Collaborators.remove(row.id);
      await fetchRows();
    } catch (e) {
      showApiError(e, "No se pudo eliminar el colaborador.");
    }
  };

  const onSave = async () => {
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        document: form.document.trim() || null,
        hourly_rate: Number(form.hourly_rate || 0),
        is_active: !!form.is_active,
        notes: form.notes || null,
      };

      if (!payload.name) {
        alert("El nombre es obligatorio.");
        return;
      }

      if (editingId) {
        await CollaboratorsService.Collaborators.update(editingId, payload);
      } else {
        await CollaboratorsService.Collaborators.create(payload);
      }

      closeDialog();
      await fetchRows();
    } catch (e) {
      showApiError(e, "No se pudo guardar el colaborador.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box>
      <Header
        title="Colaboradores"
        subtitle="Alta/edición y configuración de precio por hora"
      />

      <Stack direction={{ xs: "column", md: "row" }} spacing={2} mb={2}>
        <TextField
          label="Buscar"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") fetchRows();
          }}
          fullWidth
        />
        <Button variant="outlined" onClick={fetchRows}>
          Buscar
        </Button>
        <Button ref={btnNuevoRef} variant="contained" onClick={onAdd}>
          Nuevo colaborador
        </Button>
      </Stack>

      <Box sx={{ height: 560 }}>
        <DataGrid
          rows={rows}
          columns={columns}
          loading={loading}
          pageSize={10}
          rowsPerPageOptions={[10, 25, 50]}
          disableSelectionOnClick
        />
      </Box>

      <Dialog open={open} onClose={closeDialog} fullWidth maxWidth="sm">
        <DialogTitle>{editingId ? "Editar" : "Nuevo"} colaborador</DialogTitle>
        <DialogContent>
          <Stack spacing={2} mt={1}>
            <TextField
              inputRef={nombreInputRef}
              autoFocus
              label="Nombre"
              value={form.name}
              onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
              fullWidth
            />
            <TextField
              label="Documento (opcional)"
              value={form.document}
              onChange={(e) =>
                setForm((f) => ({ ...f, document: e.target.value }))
              }
              fullWidth
            />
            <TextField
              label="Precio por hora"
              type="number"
              value={form.hourly_rate}
              onChange={(e) =>
                setForm((f) => ({ ...f, hourly_rate: e.target.value }))
              }
              fullWidth
              inputProps={{ step: "0.01", min: "0" }}
            />
            <FormControlLabel
              control={
                <Switch
                  checked={!!form.is_active}
                  onChange={(e) =>
                    setForm((f) => ({ ...f, is_active: e.target.checked }))
                  }
                />
              }
              label="Activo"
            />
            <TextField
              label="Notas"
              value={form.notes}
              onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
              fullWidth
              multiline
              minRows={3}
            />
            <Typography variant="caption" sx={{ opacity: 0.8 }}>
              Sugerencia: configure aquí el precio por hora. En Asistencias, el
              sistema calcula horas e importe automáticamente.
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={closeDialog} disabled={saving}>
            Cancelar
          </Button>
          <Button onClick={onSave} variant="contained" disabled={saving}>
            Guardar
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
