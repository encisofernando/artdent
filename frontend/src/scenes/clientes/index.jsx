import { Box, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react"; // Importar useEffect y useState
import { deleteCliente, getAllClientes, getClienteById } from "../../config/ClienteDB"; // Asegúrate de que la ruta sea correcta
import ClienteForm from "./ClienteForm"; // Asegúrate de que la ruta sea correcta
import VisibilityIcon from "@mui/icons-material/Visibility";
import EditIcon from "@mui/icons-material/Edit"; // Importa el ícono de editar
import DeleteIcon from "@mui/icons-material/Delete"; // Importa el ícono de eliminar
import ClienteFormEdit from "./ClienteFormEdit";
import Ficha from "./Ficha";

const Clientes = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [openDialog, setOpenDialog] = useState(false); // Estado para manejar el diálogo
  const [rows, setRows] = useState([]);
  const [openCrear, setOpenCrear] = useState(false);
  const [openEditar, setOpenEditar] = useState(false);
  const [clienteEditando, setClienteEditando] = useState(null);
  const [clienteSeleccionado, setClienteSeleccionado] = useState(null);
  const [openFichaCliente, setOpenFichaCliente] = useState(false);



  // Definir las columnas, incluyendo la columna de acciones
  const columns = [
    { field: "CUIT", headerName: "CUIT" },
    {
      field: "ApellidoYNombre",
      headerName: "Apellido y Nombre",
      flex: 1,
      renderCell: (params) => (
        <span>
          {params.row.Nom1} {params.row.Nom2}
        </span>
      ),
    },
    { field: "CondIVA", headerName: "Condicion IVA", align: "left" },
    { field: "Celular", headerName: "Número de Teléfono", flex: 1 },
    { field: "Email1", headerName: "Correo Electrónico", flex: 1 },
    { field: "Direccion", headerName: "Dirección", flex: 1 },
    { field: "Localidad", headerName: "Ciudad", flex: 1 },
    { field: "Provincia", headerName: "Provincia", flex: 1 },
    { field: "CodPostal", headerName: "Codigo Postal", flex: 1 },
    {
      field: "acciones",
      headerName: "Acciones",
      flex: 1,
      renderCell: (params) => (
        <>
          <Button
            onClick={() => {
              handleClienteSeleccionado(params.row); // Establecer el cliente seleccionado
              setOpenFichaCliente(true); // Abrir el diálogo
            }}
            variant="contained"
            color="info"
            sx={{ mr: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
            
          >
          <VisibilityIcon />
          </Button>
          <Button
            variant="contained"
            color="secondary"
            sx={{ mr: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
            onClick={() => handleOpenEditar(params.row)}
          >
            <EditIcon />
          </Button>
          <Button
            variant="contained"
            color="error"
            sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
            onClick={() => handleDelete(params.row.idCliente)}
          >
            <DeleteIcon/>
          </Button>
        </>
      ),
    }
    
  ];

  const handleCloseCrear = () => setOpenCrear(false);

  const fetchClientes = async () => {
    try {
     
      const clientes = await getAllClientes(); // Pasar idBase a tu función

      const rowsWithIds = clientes.map(cliente => ({
        ...cliente,
        id: cliente.idCliente
      })).filter(cliente => cliente.id !== null);

      setRows(rowsWithIds);
    } catch (error) {
      console.error('Error al obtener clientes:', error);
    }
  };

 

  const handleOpenEditar = async (cliente) => {
    try {
      const clienteCompleto = await getClienteById(cliente.idCliente);
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
    if (window.confirm("¿Estás seguro de que deseas eliminar este cliente?")) {
      try {
        await deleteCliente(id);
        setRows((prevRows) => prevRows.filter(row => row.idCliente !== id));
        alert('cliente eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar cliente:', error);
        alert('Error al eliminar el cliente');
      }
    }
  };

  useEffect(() => {
    fetchClientes();
  }, []);

  
  const handleClienteSeleccionado = (cliente) => {
    setClienteSeleccionado(cliente);
};

  const handleClienteCreado = () => {
    fetchClientes();
    handleCloseCrear();
  };

  const handleClienteEditado = () => {
    fetchClientes();
    handleCloseEditar();
  };

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
          "& .MuiDataGrid-root": {
            border: "none",
          },
          "& .MuiDataGrid-cell": {
            borderBottom: "none",
          },
          "& .name-column--cell": {
            color: colors.greenAccent[300],
          },
          "& .MuiDataGrid-columnHeaders": {
            backgroundColor: colors.blueAccent[700],
            borderBottom: "none",
          },
          "& .MuiDataGrid-virtualScroller": {
            backgroundColor: colors.primary[400],
          },
          "& .MuiDataGrid-footerContainer": {
            borderTop: "none",
            backgroundColor: colors.blueAccent[700],
          },
          "& .MuiCheckbox-root": {
            color: `${colors.greenAccent[200]} !important`,
          },
          "& .MuiDataGrid-toolbarContainer .MuiButton-text": {
            color: `${colors.grey[100]} !important`,
          },
        }}
      >
        <DataGrid
          rows={rows}
          getRowId={(row) => row.idCliente}
          columns={columns}
          components={{ Toolbar: GridToolbar }}
        />
      </Box>
      <ClienteForm open={openDialog} onCreate={handleClienteCreado} onClose={() => setOpenDialog(false)} />
      {clienteEditando && (
        <ClienteFormEdit
          open={openEditar}
          clienteEditado={clienteEditando}
          onClienteEditado={handleClienteEditado}
          onClose={handleCloseEditar}
        />
      )}
         <Ficha
                openFichaCliente={openFichaCliente}
                setOpenFichaCliente={setOpenFichaCliente}
                cliente={clienteSeleccionado}
            />
    </Box>
  );
};

export default Clientes;
