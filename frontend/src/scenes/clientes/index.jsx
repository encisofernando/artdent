import { Box, Button } from "@mui/material";
import { DataGrid, GridToolbar } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { useTheme } from "@mui/material";
import { useEffect, useState } from "react"; // Importar useEffect y useState
import { getAllClientes } from "../../config/ClienteDB"; // Asegúrate de que la ruta sea correcta
import ClienteForm from "./ClienteForm"; // Asegúrate de que la ruta sea correcta

const Clientes = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [clientes, setClientes] = useState([]); // Estado para almacenar los contactos
  const [openDialog, setOpenDialog] = useState(false); // Estado para manejar el diálogo

  const columns = [

    { field: "CUIT", headerName: "CUIT" },
    {
      field: "ApellidoYNombre",
      headerName: "Apellido y Nombre",
      flex: 1,
      cellClassName: "name-column--cell",
      renderCell: (params) => (
        <span>
          {params.row.Nom1} {params.row.Nom2}
        </span>
      ),
    },
    {
      field: "CondIVA",
      headerName: "Condicion IVA",
      type: "number",
      headerAlign: "left",
      align: "left",
    },
    {
      field: "Celular",
      headerName: "Número de Teléfono",
      flex: 1,
    },
    {
      field: "Email1",
      headerName: "Correo Electrónico",
      flex: 1,
    },
    {
      field: "Direccion",
      headerName: "Dirección",
      flex: 1,
    },
    {
      field: "Localidad",
      headerName: "Ciudad",
      flex: 1,
    },
    {
      field: "Provincia",
      headerName: "Provincia",
      flex: 1,
    },
    {
      field: "CodPostal",
      headerName: "Codigo Postal",
      flex: 1,
    },
  ];

  // Obtener clientes al montar el componente
  useEffect(() => {
    const fetchClientes = async () => {
      try {
        const data = await getAllClientes(); // Llamada a la API
        setClientes(data); // Actualiza el estado con los datos obtenidos
      } catch (error) {
        console.error("Error al obtener los clientes:", error);
      }
    };

    fetchClientes(); // Llama a la función para obtener clientes
  }, []); // Ejecutar solo una vez al montar el componente

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center" mb="20px">
        <Header title="CLIENTES" subtitle="Lista de Clientes" />
        <Button
          variant="contained"
          color="primary"
          onClick={() => setOpenDialog(true)}
        >
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
  rows={clientes} // Asegúrate de pasar el estado de clientes como 'rows'
  getRowId={(row) => row.idCliente} // Asegúrate de que idCliente sea el ID único
  columns={columns}
  components={{ Toolbar: GridToolbar }}
/>
      </Box>
      <ClienteForm open={openDialog} onClose={() => setOpenDialog(false)} />
    </Box>
  );
};

export default Clientes;
