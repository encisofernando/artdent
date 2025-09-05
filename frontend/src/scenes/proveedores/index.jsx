import { Box, useTheme, Button, IconButton, Tooltip } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff'; // Importa el icono de desactivación
import DeleteIcon from '@mui/icons-material/Delete';

import { useState, useEffect } from "react";
import { getAllProveedores, deleteProveedor, toggleProveedor } from '../../config/ProveedorDB'; // Asegúrate de implementar la función toggleCategoria

const Proveedores = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [rows, setRows] = useState([]);
    const [openCrear, setOpenCrear] = useState(false);
    const [openEditar, setOpenEditar] = useState(false);

    const loadProveedores = async () => {
        try {
            const proveedores = await getAllProveedores();
            setRows(proveedores);
        } catch (error) {
            console.error("Error al cargar las proveedores:", error.message);
        }
    };

    useEffect(() => {
        loadProveedores();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteProveedor(id);
            loadProveedores();
        } catch (error) {
            console.error("Error al eliminar la proveedores:", error.message);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleProveedor(id); // Llama a la función para cambiar el estado
            loadProveedores(); // Recarga las categorías para reflejar el cambio
        } catch (error) {
            console.error("Error al cambiar el estado de la proveedores:", error.message);
        }
    };

    const columns = [
        {
            field: "RazonSocial",
            headerName: "Nombre",
            width: 150,
            minWidth: 180,
            headerAlign: 'center',
            align: 'center',
            cellClassName: "name-column--cell"
        },
        {
            field: "CUIT",
            headerName: "Identificacion",
            flex: 1,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: "Tel1",
            headerName: "Telefono",
            flex: 1,
            headerAlign: 'center',
            align: 'center'
        },
        {
            field: "acciones",
            headerName: "Acciones",
            width: 150,
            minWidth: 180,
            renderCell: (params) => (
              <>
                <Button
                  color="info"
                  sx={{ mr: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 10 }}
                  startIcon={<VisibilityIcon />}
                >
                </Button>
                <Button
                  color="secondary"
                  sx={{ mr: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
                >
                  <EditIcon />
                </Button>
                <Button
                  color="error"
                  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
                  onClick={() => handleDelete(params.row.idProveedor)}
                >
                  <DeleteIcon/>
                </Button>
                <Tooltip title={params.row.Activo ? "Desactivar" : "Activar"}>
                                  <IconButton
                                      sx={{ color: colors.primary[100] }}
                                      onClick={() => handleToggle(params.row.idProveedor)} // Usar la función aquí
                                  >
                                      {params.row.Activo ? <FlashOnIcon /> : <FlashOffIcon />}
                                  </IconButton>
                              </Tooltip>
              </>
            ),
          }
    ];

    return (
        <Box m="30px">
            <Header title="PROVEEDORES" subtitle="Lista de proveedores" />

            <Box display="flex" justifyContent="flex-end" mb={2}>
                <Button
                    startIcon={<AddIcon />}
                    variant="contained"
                    color="secondary"
                    onClick={() => setOpenCrear(true)}
                    sx={{
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
                    }}
                >
                    Nuevo proveedor
                </Button>
            </Box>

            <Box
                height="70vh"
                width="100%"
                sx={{
                    "& .MuiDataGrid-root": {
                        border: "none",
                        borderRadius: '8px',
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.05)",
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-cell": {
                        borderBottom: "1px solid",
                        borderBottomColor: colors.grey[200],
                        padding: '10px',
                        textAlign: 'center',
                    },
                    "& .name-column--cell": {
                        color: colors.greenAccent[300],
                        fontWeight: 'bold',
                    },
                    "& .MuiDataGrid-columnHeaders": {
                        backgroundColor: colors.blueAccent[700],
                        borderBottom: "2px solid",
                        borderBottomColor: colors.primary[300],
                        color: colors.grey[100],
                        fontSize: '16px',
                        fontWeight: 'bold',
                        textAlign: 'center',
                    },
                    "& .MuiDataGrid-virtualScroller": {
                        backgroundColor: colors.primary[400],
                    },
                    "& .MuiDataGrid-footerContainer": {
                        borderTop: "2px solid",
                        borderTopColor: colors.primary[300],
                        backgroundColor: colors.blueAccent[700],
                    },
                    "& .MuiCheckbox-root": {
                        color: `${colors.greenAccent[200]} !important`,
                    },
                    "& .MuiDataGrid-row:hover": {
                        backgroundColor: colors.primary[500],
                    },
                }}
            >
                <DataGrid
                    rows={rows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    getRowId={(row) => row.idProveedor}
                    disableSelectionOnClick
                />
            </Box>

      
        </Box>
    );
};

export default Proveedores;
