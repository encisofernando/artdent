import { useEffect, useState } from "react";
import { Box, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header";
import { Vendors } from "../../services";

const Proveedores = () => {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await Vendors.listVendors();
      setRows((data || []).map(v => ({ id: v.idProveedor || v.id, ...v })));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const columns = [
    { field: "RazonSocial", headerName: "Razón Social", flex: 1 },
    { field: "CUIT", headerName: "CUIT", width: 150 },
    { field: "Email", headerName: "Email", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => handleEdit(params.row)} sx={{ minWidth: 0, mr: 1 }}><EditIcon fontSize="small" /></Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.idProveedor || params.row.id)} sx={{ minWidth: 0 }}><DeleteIcon fontSize="small" /></Button>
        </Box>
      ),
    },
  ];

  const handleNew = () => { window.location.href = "/proveedores/crear"; };
  const handleEdit = (row) => { window.location.href = `/proveedores/${row.idProveedor || row.id}/editar`; };
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar proveedor?")) return;
    try { await Vendors.deleteVendor(id); setRows(prev => prev.filter(r => (r.idProveedor || r.id) != id)); } catch (e) { console.error(e); }
  };

  return (
    <Box m="20px">
      <Header title="PROVEEDORES" subtitle="Lista de proveedores" />
      <Box display="flex" justifyContent="flex-end"><Button startIcon={<AddIcon />} onClick={handleNew} variant="contained" color="secondary">Nuevo proveedor</Button></Box>
      <Box m="20px 0 0 0" height="70vh">
        <DataGrid rows={rows} loading={loading} columns={columns} getRowId={(r) => r.id || r.idProveedor} components={{ Toolbar: GridToolbar }} />
      </Box>
    </Box>
  );
};
export default Proveedores;
