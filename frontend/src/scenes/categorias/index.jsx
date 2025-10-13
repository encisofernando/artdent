import { useEffect, useState } from "react";
import { Box, Button, Typography } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import AddIcon from "@mui/icons-material/Add";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import Header from "../../components/Header";
import { useTheme } from "@mui/material/styles";
import { tokens } from "../../theme";
import { Catalog } from "../../services";

const Categorias = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const columns = [
    { field: "idCategoria", headerName: "ID", width: 90 },
    { field: "Nombre", headerName: "Nombre", flex: 1 },
    { field: "Descripcion", headerName: "Descripción", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      width: 160,
      sortable: false,
      renderCell: (params) => (
        <Box>
          <Button size="small" onClick={() => handleEdit(params.row)} sx={{ minWidth: 0, mr: 1 }}><EditIcon fontSize="small" /></Button>
          <Button size="small" color="error" onClick={() => handleDelete(params.row.idCategoria)} sx={{ minWidth: 0 }}><DeleteIcon fontSize="small" /></Button>
        </Box>
      ),
    },
  ];

  const fetchData = async () => {
    setLoading(true);
    try {
      const data = await (Catalog?.listCategories ? Catalog.listCategories() : []);
      const normalized = (data || []).map((c) => ({ id: c.idCategoria || c.id, ...c }));
      setRows(normalized);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchData(); }, []);

  const handleNew = () => { window.location.href = "/categorias/crear"; };
  const handleEdit = (row) => { window.location.href = `/categorias/${row.idCategoria || row.id}/editar`; };
  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar categoría?")) return;
    try {
      if (Catalog?.deleteCategory) await Catalog.deleteCategory(id);
      setRows((prev) => prev.filter((r) => (r.idCategoria || r.id) !== id));
    } catch (e) { console.error(e); }
  };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="CATEGORÍAS" subtitle="Lista de categorías de artículos" />
        <Button startIcon={<AddIcon />} variant="contained" color="secondary" onClick={handleNew}>
          Nueva categoría
        </Button>
      </Box>
      <Box m="20px 0 0 0" height="70vh" sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
      }}>
        <DataGrid rows={rows} loading={loading} columns={columns} getRowId={(r) => r.id || r.idCategoria} components={{ Toolbar: GridToolbar }} />
      </Box>
    </Box>
  );
};
export default Categorias;
