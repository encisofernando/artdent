import { Box, Button } from '@mui/material';
import { DataGrid, GridToolbar } from '@mui/x-data-grid';
import { tokens } from '../../theme';
import Header from '../../components/Header';
import { useTheme } from '@mui/material';
import { useEffect, useState } from 'react';
import { Customers } from '../../services';
import ClienteForm from './ClienteForm';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import ClienteFormEdit from './ClienteFormEdit';
import Ficha from './Ficha';

const Clientes = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openDialog, setOpenDialog] = useState(false);
  const [rows, setRows] = useState([]);
  const [openEditar, setOpenEditar] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [openFichaCliente, setOpenFichaCliente] = useState(false);

  const columns = [
    { field: 'code', headerName: 'Código', width: 120 },
    { field: 'name', headerName: 'Nombre', flex: 1 },
    { field: 'tax_id', headerName: 'CUIT/CUIL', width: 150 },
    { field: 'tax_condition', headerName: 'Cond. IVA', width: 140 },
    { field: 'email', headerName: 'Email', flex: 1 },
    { field: 'phone', headerName: 'Teléfono', width: 140 },
    { field: 'address', headerName: 'Dirección', flex: 1 },
    { field: 'city', headerName: 'Ciudad', width: 140 },
    { field: 'state', headerName: 'Provincia', width: 140 },
    { field: 'zip', headerName: 'CP', width: 100 },
    { field: 'credit_limit', headerName: 'Límite CC', width: 130, valueFormatter: ({ value }) => (value != null ? Number(value).toFixed(2) : "0.00") },
    { field: 'is_active', headerName: 'Activo', width: 100, type: 'boolean' },
    {
      field: 'acciones',
      headerName: 'Acciones',
      width: 200,
      renderCell: (params) => (
        <>
          <Button
            onClick={() => {
              handleClienteSeleccionado(params.row);
              setOpenFichaCliente(true);
            }}
            variant="contained"
            color="info"
            sx={{ mr: 1, minWidth: 48 }}
          >
            <VisibilityIcon />
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mr: 1, minWidth: 48 }}
            onClick={() => handleOpenEditar(params.row)}
          >
            <EditIcon />
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ minWidth: 48 }}
            onClick={() => handleDelete(params.row.id)}
          >
            <DeleteIcon />
          </Button>
        </>
      ),
    },
  ];

  const fetchClientes = async () => {
    try {
      const clientes = await Customers.listCustomers();
      const rowsWithIds = (clientes || []).map((c) => ({ ...c, id: c.id })).filter((c) => c.id != null);
      setRows(rowsWithIds);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

  const handleOpenEditar = async (cliente) => {
    try {
      const clienteCompleto = await Customers.getCustomer(cliente.id);
      setClienteEditando(clienteCompleto);
      setOpenEditar(true);
    } catch (error) {
      console.error('Error al obtener los datos del cliente:', error);
      alert('Hubo un error al cargar los datos del cliente');
    }
  };

  const handleCloseEditar = () => {
    setClienteEditando(null);
    setOpenEditar(false);
  };

  const handleDelete = async (id) => {
    if (window.confirm('¿Estás seguro de que deseas eliminar este cliente?')) {
      try {
        await Customers.deleteCustomer(id);
        setRows((prevRows) => prevRows.filter((row) => row.id !== id));
        alert('Cliente eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  useEffect(() => { fetchClientes(); }, []);

  const handleClienteSeleccionado = (cliente) => setClienteSeleccionado(cliente);

  const handleClienteCreado = () => { fetchClientes(); setOpenDialog(false); };

  const handleClienteEditado = () => { fetchClientes(); handleCloseEditar(); };

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header title="CLIENTES" subtitle="Lista de Clientes" />
        <Button variant="contained" color="primary" onClick={() => setOpenDialog(true)}>
          Alta de Cliente
        </Button>
      </Box>
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          '& .MuiDataGrid-root': { border: 'none' },
          '& .MuiDataGrid-cell': { borderBottom: 'none' },
          '& .name-column--cell': { color: colors.greenAccent[300] },
          '& .MuiDataGrid-columnHeaders': { backgroundColor: colors.blueAccent[700], borderBottom: 'none' },
          '& .MuiDataGrid-virtualScroller': { backgroundColor: colors.primary[400] },
          '& .MuiDataGrid-footerContainer': { borderTop: 'none', backgroundColor: colors.blueAccent[700] },
          '& .MuiCheckbox-root': { color: `${colors.greenAccent[200]} !important` },
          '& .MuiDataGrid-toolbarContainer .MuiButton-text': { color: `${colors.grey[100]} !important` },
        }}
      >
        <DataGrid rows={rows} getRowId={(row) => row.id} columns={columns} components={{ Toolbar: GridToolbar }} />
      </Box>

      <ClienteForm open={openDialog} onCreate={handleClienteCreado} onClose={() => setOpenDialog(false)} />
      {clienteEditando && (
        <ClienteFormEdit open={openEditar} clienteEditado={clienteEditando} onClienteEditado={handleClienteEditado} onClose={handleCloseEditar} />
      )}
      <Ficha openFichaCliente={openFichaCliente} setOpenFichaCliente={setOpenFichaCliente} cliente={clienteSeleccionado} />
    </Box>
  );
};

export default Clientes;
