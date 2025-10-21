import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
  Paper,
  InputAdornment,
  Tooltip,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { DataGrid } from "@mui/x-data-grid";
import AddCircleIcon from "@mui/icons-material/AddCircle";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";
import RefreshIcon from "@mui/icons-material/Refresh";
import { tokens } from "../../theme.js";

// Diálogos ya existentes
import ClienteForm from "./ClienteForm";
import ClienteFormEdit from "./ClienteFormEdit";

// Service
import * as Customers from "../../services/customerService";

// === Helpers layout fijo bajo topbar + sidebar ===
const TOPBAR_HEIGHT = (theme) =>
  theme.mixins?.toolbar?.minHeight ? Number(theme.mixins.toolbar.minHeight) : 64;

export default function ClientesIndex() {
  const theme = useTheme();
  const c = tokens(theme.palette.mode);
  const appbarH = TOPBAR_HEIGHT(theme);
  const [sidebarW, setSidebarW] = useState(0);
  useEffect(() => {
    const el = document.querySelector(".pro-sidebar");
    const sideBox = el?.closest('[style*="position: fixed"]') || el?.parentElement;
    if (!sideBox) {
      setSidebarW(0);
      return;
    }
    const setW = () => setSidebarW(sideBox.offsetWidth || 0);
    setW();
    const ro = new ResizeObserver(setW);
    ro.observe(sideBox);
    window.addEventListener("resize", setW);
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", setW);
    };
  }, []);

  // === Estado ===
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);
  const [q, setQ] = useState("");
  const [selection, setSelection] = useState([]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selection[0]) || null,
    [rows, selection]
  );

  // === Fetch ===
  const fetchClientes = useCallback(async () => {
    setLoading(true);
    try {
      let data;
      if (Customers.getCustomers) {
        const res = await Customers.getCustomers({ q });
        data = res?.data || res;
      } else if (Customers.listCustomers) {
        const res = await Customers.listCustomers({ q });
        data = res?.data || res;
      } else {
        const res = await fetch(`/api/customers?q=${encodeURIComponent(q)}`);
        data = await res.json();
      }
      const list = (data?.data || data || []).map((c) => ({
        id: c.id,
        codigo: c.code || c.codigo || "",
        nombre: c.name || c.razon_social || c.nombre || "",
        doc: c.cuit || c.cuil || c.document || "",
        iva: c.iva_condition || c.cond_iva || "",
        email: c.email || "",
        telefono: c.phone || c.telefono || "",
        direccion: c.address || c.direccion || "",
        ciudad: c.city || c.ciudad || "",
        provincia: c.state || c.provincia || "",
        cp: c.zip || c.cp || "",
        limite_cc: Number(c.credit_limit || c.limite_cc || 0),
        activo: Boolean(c.active ?? c.activo ?? true),
        usuario: c.user?.name || c.usuario || "",
        created_at: c.created_at || c.fecha_alta || "",
      }));
      setRows(list);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }, [q]);

  useEffect(() => {
    fetchClientes();
  }, []); // carga inicial

  // === CRUD ===
  const [openCreate, setOpenCreate] = useState(false);
  const [openEdit, setOpenEdit] = useState(false);

  const handleDelete = async (rowOverride) => {
    const target = rowOverride || selected;
    if (!target) return;
    if (!confirm(`¿Eliminar cliente "${target.nombre}"?`)) return;
    try {
      setLoading(true);
      if (Customers.deleteCustomer) {
        await Customers.deleteCustomer(target.id);
      } else {
        await fetch(`/api/customers/${target.id}`, { method: "DELETE" });
      }
      await fetchClientes();
      setSelection([]);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // === Columnas ===
  const columns = [
    {
      field: "acciones",
      headerName: "",
      sortable: false,
      filterable: false,
      width: 96,
      renderCell: (params) => (
        <Stack direction="row" spacing={0.5}>
          <Tooltip title="Editar">
            <IconButton
              size="small"
              onClick={() => {
                setSelection([params.row.id]);
                setOpenEdit(true);
              }}
            >
              <EditIcon fontSize="small" />
            </IconButton>
          </Tooltip>
          <Tooltip title="Eliminar">
            <IconButton
              size="small"
              color="error"
              onClick={() => handleDelete(params.row)}
            >
              <DeleteIcon fontSize="small" />
            </IconButton>
          </Tooltip>
        </Stack>
      ),
    },
    { field: "codigo", headerName: "Código", flex: 0.7, minWidth: 100 },
    { field: "nombre", headerName: "Nombre / Razón Social", flex: 1.4, minWidth: 220 },
    { field: "doc", headerName: "CUIT/CUIL", flex: 0.9, minWidth: 140 },
    { field: "iva", headerName: "Cond. IVA", flex: 0.8, minWidth: 120 },
    { field: "email", headerName: "Email", flex: 1.2, minWidth: 180 },
    { field: "telefono", headerName: "Teléfono", flex: 0.9, minWidth: 130 },
    { field: "direccion", headerName: "Dirección", flex: 1.2, minWidth: 200 },
    { field: "ciudad", headerName: "Ciudad", flex: 0.9, minWidth: 130 },
    { field: "provincia", headerName: "Provincia", flex: 0.9, minWidth: 130 },
    { field: "cp", headerName: "CP", flex: 0.5, minWidth: 80 },
    {
      field: "limite_cc",
      headerName: "Límite CC",
      flex: 0.7,
      minWidth: 110,
      valueFormatter: ({ value }) =>
        new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS" }).format(
          Number(value || 0)
        ),
    },
    { field: "activo", headerName: "Activo", flex: 0.5, minWidth: 90, type: "boolean" },
    { field: "usuario", headerName: "Usuario", flex: 0.8, minWidth: 120 },
  ];

  // altura del TextField small (≈40px). Forzamos misma altura en botones.
  const searchButtonSx = { height: 40, borderRadius: 2 };

  return (
    <Box
      sx={{
        position: "fixed",
        top: appbarH,
        left: sidebarW,
        right: 0,
        bottom: 0,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        p: 2,
        overflow: "hidden",
      }}
    >
      {/* Toolbar superior */}
      <Stack
        direction={{ xs: "column", sm: "row" }}
        spacing={1}
        alignItems={{ xs: "stretch", sm: "center" }}
      >
        <Typography variant="h4" sx={{ fontWeight: 700, flex: 1 }}>
          Clientes
        </Typography>
        <Stack direction="row" spacing={1}>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddCircleIcon />}
            onClick={() => setOpenCreate(true)}
          >
            Nuevo Cliente
          </Button>
          <Button
            variant="outlined"
            startIcon={<EditIcon />}
            disabled={!selected}
            onClick={() => setOpenEdit(true)}
          >
            Editar
          </Button>
          <Button
            variant="outlined"
            color="error"
            startIcon={<DeleteIcon />}
            disabled={!selected}
            onClick={() => handleDelete()}
          >
            Eliminar
          </Button>
        </Stack>
      </Stack>

      {/* Filtros + búsqueda */}
      <Paper
        variant="outlined"
        sx={{ p: 2, borderRadius: 3, border: `1px solid ${c.blueAccent[100]}` }}
      >
        <Stack direction={{ xs: "column", sm: "row" }} spacing={1} alignItems="stretch">
          <TextField
            fullWidth
            size="small"
            placeholder="Buscar por nombre, documento, email..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
            InputProps={{
              endAdornment: (
                <InputAdornment position="end">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
          />
          <Button
            variant="contained"
            startIcon={<SearchIcon />}
            onClick={fetchClientes}
            sx={searchButtonSx}
          >
            Buscar
          </Button>
          <Button
            variant="contained"
            color="warning"
            startIcon={<RefreshIcon />}
            onClick={() => {
              setQ("");
              fetchClientes();
            }}
            sx={searchButtonSx}
          >
            Mostrar Todo
          </Button>
        </Stack>
      </Paper>

      {/* Tabla */}
      <Paper
        variant="outlined"
        sx={{
          flex: 1,
          minHeight: 0,
          display: "flex",
          flexDirection: "column",
          p: 2,
          borderRadius: 3,
          border: `1px solid ${c.blueAccent[100]}`,
        }}
      >
        <Box sx={{ flex: 1, minHeight: 0 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            checkboxSelection
            onRowSelectionModelChange={(m) => setSelection(m)}
            rowSelectionModel={selection}
            // Selecciona fila con un solo click para habilitar Edit/Eliminar
            onRowClick={(p) => setSelection([p.id])}
            // Doble click abre el modal de edición
            onRowDoubleClick={(p) => {
              setSelection([p.id]);
              setOpenEdit(true);
            }}
            disableRowSelectionOnClick
            density="compact"
            pageSizeOptions={[10, 25, 50, 100]}
            initialState={{ pagination: { paginationModel: { pageSize: 25 } } }}
            sx={{
              height: "100%",
              width: "100%",
              borderRadius: 2,
              border: `1px solid ${c.blueAccent[100]}`,
              "& .MuiDataGrid-virtualScroller": {
                overflowY: "auto",
                overflowX: "hidden",
              },
              "& .MuiDataGrid-main": { overflow: "hidden" },
            }}
          />
        </Box>
      </Paper>

      {/* Diálogo: Crear */}
      <ClienteForm
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={async () => {
          setOpenCreate(false);
          await fetchClientes();
        }}
      />

      {/* Diálogo: Editar */}
      {selected && (
        <ClienteFormEdit
          open={openEdit}
          onClose={() => setOpenEdit(false)}
          cliente={selected}
          onUpdated={async () => {
            setOpenEdit(false);
            await fetchClientes();
          }}
        />
      )}
    </Box>
  );
}
