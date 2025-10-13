// 📁 src/scenes/equipo/index.jsx
import { Box, Typography, Button, IconButton, Tooltip } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react";
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit";
import DeleteIcon from "@mui/icons-material/Delete";
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import RequestPageIcon from '@mui/icons-material/RequestPage';
import ManageAccountsIcon from '@mui/icons-material/ManageAccounts';
import PersonIcon from '@mui/icons-material/Person';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import Ficha from './Ficha';
import TeamFormEditar from "./TeamFormEditar";
import Permisos from "./Permisos";
import AddIcon from '@mui/icons-material/Add';
import { useNavigate } from 'react-router-dom';
import { Employees } from "../../services";

const Empleados = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openFichaEmpleado, setOpenFichaEmpleado] = useState(false);
  const [empleadoSeleccionado, setEmpleadoSeleccionado] = useState(null);
  const [rows, setRows] = useState([]);
  const [openEditar, setOpenEditar] = useState(false);
  const [empleadoEditando, setEmpleadoEditando] = useState(null);
  const [openPermisosDialog, setOpenPermisosDialog] = useState(false);
  const navigate = useNavigate();

  const handleNuevoEmpleado = () => navigate('/nuevoempleado');

  const roleMapping = {
    1: { name: "Admin", icon: <AdminPanelSettingsIcon />, color: colors.greenAccent[600] },
    2: { name: "Manager", icon: <ManageAccountsIcon />, color: colors.orange[500] },
    3: { name: "Contador", icon: <RequestPageIcon />, color: colors.yellow[500] },
    4: { name: "User", icon: <PersonIcon />, color: colors.blueAccent[500] },
  };

  const columns = [
    { field: "Nombre", headerName: "Nombre", flex: 1, cellClassName: "name-column--cell" },
    { field: "Apellido", headerName: "Apellido", flex: 1, cellClassName: "name-column--cell" },
    { field: "Email1", headerName: "Correo Electrónico", flex: 1 },
    {
      field: "idRol",
      headerName: "Nivel de Acceso",
      flex: 1,
      renderCell: ({ row: { idRol } }) => {
        const role = roleMapping[idRol] || { name: "Desconocido", icon: null, color: colors.grey[500] };
        return (
          <Box width="60%" m="0 auto" p="5px" display="flex" justifyContent="center" backgroundColor={role.color} borderRadius="4px">
            {role.icon}
            <Typography color="black" sx={{ ml: "5px" }}>{role.name}</Typography>
          </Box>
        );
      },
    },
    {
      field: "Activo",
      headerName: "Estado",
      flex: 1,
      headerAlign: 'center',
      align: 'center',
      renderCell: (params) => (
        <div style={{ color: Number(params.row.Activo) === 1 ? 'green' : 'red', fontWeight: 'bold' }}>
          {Number(params.row.Activo) === 1 ? 'Activo' : 'Inactivo'}
        </div>
      ),
    },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button onClick={() => { setEmpleadoSeleccionado(params.row); setOpenFichaEmpleado(true); }} color="info" sx={{ mr: 1, minWidth: 10 }} startIcon={<VisibilityIcon />}></Button>
          <Button color="secondary" sx={{ mr: 1, minWidth: 48 }} onClick={() => handleOpenEditar(params.row)}><EditIcon /></Button>
          <Button color="error" sx={{ minWidth: 48 }} onClick={() => handleDelete(params.row.idEmpleado)}><DeleteIcon/></Button>
          <Tooltip title={Number(params.row.Activo) ? "Desactivar" : "Activar"}>
            <IconButton sx={{ color: colors.primary[100] }} onClick={() => handleToggle(params.row.idEmpleado)}>
              {Number(params.row.Activo) ? <FlashOnIcon /> : <FlashOffIcon />}
            </IconButton>
          </Tooltip>
        </>
      ),
    }
  ];

  const fetchEmpleados = async () => {
    const empleados = await Employees.listEmployees();
    const rowsWithIds = (empleados || []).map(e => ({ ...e, id: e.idEmpleado || e.id }))
                                        .filter(e => e.id || e.idEmpleado !== null);
    setRows(rowsWithIds);
  };

  const handleOpenEditar = async (empleado) => {
    const empleadoCompleto = await Employees.getEmployee(empleado.idEmpleado || empleado.id);
    setEmpleadoEditando(empleadoCompleto);
    setOpenEditar(true);
  };
  const handleCloseEditar = () => { setEmpleadoEditando(null); setOpenEditar(false); };

  const handleDelete = async (id) => {
    if (!window.confirm("¿Eliminar este empleado?")) return;
    await Employees.deleteEmployee(id);
    setRows(prev => prev.filter(r => (r.idEmpleado || r.id) !== id));
  };

  const handleToggle = async (id) => { await Employees.toggleActive(id); fetchEmpleados(); };

  useEffect(() => { fetchEmpleados(); }, []);

  const handleEmpleadoEditado = () => { fetchEmpleados(); handleCloseEditar(); };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header title="EMPLEADOS" subtitle="Lista de Empleados" />
        <Box display="flex" alignItems="center">
          <Button startIcon={<AddIcon />} variant="contained" color="secondary" onClick={handleNuevoEmpleado}
                  sx={{ borderRadius: '8px', padding: '10px 20px', fontWeight: 'bold', textTransform: 'none', boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)' }}>
            Nuevo empleado
          </Button>
        </Box>
      </Box>
      <Box m="40px 0 0 0" height="75vh" sx={{
        "& .MuiDataGrid-root": { border: "none" },
        "& .MuiDataGrid-cell": { borderBottom: "none" },
        "& .name-column--cell": { color: colors.greenAccent[300] },
        "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
        "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
        "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
        "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        "& .MuiDataGrid-toolbarContainer .MuiButton-text": { color: `${colors.grey[100]} !important` },
      }}>
        <DataGrid rows={rows} getRowId={(row) => row.idEmpleado || row.id} columns={columns} components={{ Toolbar: GridToolbar }} />
      </Box>

      <TeamFormEditar open={openEditar} onClose={handleCloseEditar} empleadoEditando={empleadoEditando} onEmpleadoEditando={handleEmpleadoEditado} />
      <Ficha openFichaEmpleado={openFichaEmpleado} setOpenFichaEmpleado={setOpenFichaEmpleado} empleado={empleadoSeleccionado} />
      <Permisos open={openPermisosDialog} onClose={() => setOpenPermisosDialog(false)} />
    </Box>
  );
};

export default Empleados;
