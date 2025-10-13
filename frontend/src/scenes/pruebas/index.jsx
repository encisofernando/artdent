// src/pages/Articulos.js
import { Box, Typography, useTheme, Button } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import { getAllArticulos, getArticuloById, deleteArticulo } from '../../config/LlamadaDB';
import { useEffect, useState } from "react";
import AltaArticulo from "./alta"; // Importa el nuevo componente

const Articulos = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);
  const [rows, setRows] = useState([]);
  const [open, setOpen] = useState(false); 
  const [articuloEditando, setArticuloEditando] = useState(null); // Estado para el artículo que se está editando

  const columns = [
    { field: "CodigoBarra", headerName: "Código de Barra", flex: 1 },
    { field: "Nombre", headerName: "Nombre", flex: 1, cellClassName: "name-column--cell" },
    { field: "Stock", headerName: "Stock", flex: 1 },
    { field: "Costo", headerName: "Precio Costo", flex: 1, renderCell: (params) => <Typography color={colors.greenAccent[500]}>${params.row.Costo}</Typography> },
    { field: "PrecioPublico", headerName: "Precio Venta", flex: 1, renderCell: (params) => <Typography color={colors.greenAccent[500]}>${params.row.PrecioPublico}</Typography> },
    { field: "Iva", headerName: "IVA (%)", flex: 1 },
    {
      field: "acciones", headerName: "Acciones", flex: 1,
      renderCell: (params) => (
        <>
          <Button variant="contained" color="secondary" onClick={() => handleEdit(params.row)} sx={{ mr: 1 }}>
            Modificar
          </Button>
          <Button variant="contained" color="error" onClick={() => handleDelete(params.row.idArticulo)}> {/* Cambié params.row.id a params.row.idArticulo */}
            Eliminar
          </Button>
        </>
      ),
    },
  ];

// En Articulos.js
const handleEdit = async (articulo) => {

  try {
    // Llama a la función para obtener el artículo por su id
    const articuloCompleto = await getArticuloById(articulo.idArticulo);
    console.log('Artículo completo obtenido:', articuloCompleto); // Agrega este log
    
    // Abre el modal y establece el artículo completo para editar
    setArticuloEditando(articuloCompleto);
    setOpen(true);
  } catch (error) {
    console.error('Error al obtener los datos del artículo:', error);
    alert('Hubo un error al cargar los datos del artículo');
  }
};



  const handleDelete = async (id) => {
    if (window.confirm("¿Estás seguro de que deseas eliminar este artículo?")) {
      try {
        await deleteArticulo(id);
        setRows((prevRows) => prevRows.filter(row => row.idArticulo !== id)); // Cambié row.id a row.idArticulo
        alert('Artículo eliminado con éxito');
      } catch (error) {
        console.error('Error al eliminar artículo:', error);
        alert('Error al eliminar el artículo');
      }
    }
  };

  const fetchArticulos = async () => {
    try {
        const articulos = await getAllArticulos();
        const rowsWithIds = articulos.map(articulo => ({
            ...articulo,
            id: articulo.idArticulo // Asegúrate de que aquí se use 'idArticulo' como 'id'
        })).filter(articulo => articulo.id !== null); 

        setRows(rowsWithIds);
    } catch (error) {
        console.error('Error al obtener artículos:', error);
    }
  };

  useEffect(() => {
    fetchArticulos();
  }, []);

  const handleOpen = () => {
    // Esta función ya no necesita hacer nada más aquí
    setOpen(true);
  };
  

  const handleClose = (success = false) => {
    // Si el cierre fue exitoso (es decir, el artículo fue editado correctamente), puedes dejar el estado como está
    if (!success) {
      // Si no fue exitoso (es decir, el usuario está cancelando), restablecemos el artículo a editar
      setArticuloEditando(null);
    }
    setOpen(false);
  };

  const handleArticuloCreado = () => {
    fetchArticulos();
  };

  return (
    <Box m="20px">
      <Header title="ARTÍCULOS" subtitle="Lista de Artículos" />
      
      {/* Botón de Alta de Artículo */}
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleOpen} 
        sx={{ 
          position: 'absolute', 
          top: 100, 
          right: 20 
        }}
      >
        Alta de Artículo
      </Button>

      {/* Tabla de Artículos con estilos */}
      <Box
        m="40px 0 0 0"
        height="75vh"
        sx={{
          "& .MuiDataGrid-root": { border: "none" },
          "& .MuiDataGrid-cell": { borderBottom: "none" },
          "& .name-column--cell": { color: colors.greenAccent[300] },
          "& .MuiDataGrid-columnHeaders": { backgroundColor: colors.blueAccent[700], borderBottom: "none" },
          "& .MuiDataGrid-virtualScroller": { backgroundColor: colors.primary[400] },
          "& .MuiDataGrid-footerContainer": { borderTop: "none", backgroundColor: colors.blueAccent[700] },
          "& .MuiCheckbox-root": { color: `${colors.greenAccent[200]} !important` },
        }}
      >
        <DataGrid
          checkboxSelection
          rows={rows}
          columns={columns}
          pageSize={10}
          rowsPerPageOptions={[5, 10, 20]}
          getRowId={(row) => row.id} // Asegúrate de que este campo ahora corresponde a 'id'
        />
      </Box>

      {/* Componente de Alta de Artículo */}
      <AltaArticulo 
        open={open} 
        onClose={handleClose} 
        onArticuloCreado={handleArticuloCreado} 
        articuloEditando={articuloEditando} // Pasa el artículo que se está editando
      />
    </Box>
  );
};

export default Articulos;
