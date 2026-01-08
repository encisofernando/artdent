import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  Stack,
  TextField,
  Typography,
  InputAdornment,
  Tooltip,
  Divider,
  Card,
  CardHeader,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";

import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/DeleteOutline";
import SearchIcon from "@mui/icons-material/Search";

import ClienteForm from "./ClienteForm";
import ClienteFormEdit from "./ClienteFormEdit";
import * as Customers from "../../services/customerService";

export default function ClientesIndex() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState("");
  const [selection, setSelection] = useState([]);

  const selected = useMemo(
    () => rows.find((r) => r.id === selection[0]) || null,
    [rows, selection]
  );

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
  }, [fetchClientes]);

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

  return (
    <Box p={2}>
      <Card>
        <CardHeader
          title={<Typography variant="h3">Clientes</Typography>}
          action={
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenCreate(true)}
            >
              Nuevo
            </Button>
          }
        />
        <Divider />
        <CardContent>
          <Stack direction={{ xs: "column", sm: "row" }} gap={2} mb={2}>
            <TextField
              placeholder="Buscar por nombre / documento / email"
              value={q}
              onChange={(e) => setQ(e.target.value)}
              fullWidth
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") fetchClientes();
              }}
            />
            <Button variant="outlined" onClick={fetchClientes}>
              Buscar
            </Button>
          </Stack>

          {loading ? (
            <Box display="flex" justifyContent="center" py={6}>
              <CircularProgress />
            </Box>
          ) : (
            <Box
              sx={{
                borderRadius: 2,
                overflow: "hidden",
                border: (t) => `1px solid ${t.palette.divider}`,
                height: "calc(100vh - 320px)", // ajustá si querés más/menos alto
                minHeight: 360,
              }}
            >
              <DataGrid
                rows={rows}
                columns={columns}
                checkboxSelection
                onRowSelectionModelChange={(m) => setSelection(m)}
                rowSelectionModel={selection}
                onRowClick={(p) => setSelection([p.id])}
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
                  border: "none", // el borde lo pone el Box wrapper como en Artículos
                  "& .MuiDataGrid-columnHeaders": {
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                    minHeight: 44,
                  },
                  "& .MuiDataGrid-cell": {
                    borderBottom: (t) => `1px solid ${t.palette.divider}`,
                  },
                  "& .MuiDataGrid-row:hover": {
                    backgroundColor: "action.hover",
                  },
                  "& .MuiDataGrid-virtualScroller": {
                    overflowX: "hidden",
                  },
                }}
              />
            </Box>
          )}
        </CardContent>
      </Card>

      <ClienteForm
        open={openCreate}
        onClose={() => setOpenCreate(false)}
        onCreate={async () => {
          setOpenCreate(false);
          await fetchClientes();
        }}
      />

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
