import { Box, useTheme, Button, IconButton, Tooltip, TextField } from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { tokens } from "../../theme";
import Header from "../../components/Header";
import CrearCategoria from './CrearCategoria';
import EditarCategoria from './EditarCategoria';
import VisibilityIcon from "@mui/icons-material/Visibility";
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import FlashOnIcon from '@mui/icons-material/FlashOn';
import FlashOffIcon from '@mui/icons-material/FlashOff';
import DeleteIcon from '@mui/icons-material/Delete';
import CloseIcon from '@mui/icons-material/Close'; // Importa el icono de cerrar
import { useState, useEffect } from "react";
import { getAllCategorias, deleteCategoria, toggleCategoria } from '../../config/CategoriaDB';

const Categorias = () => {
    const theme = useTheme();
    const colors = tokens(theme.palette.mode);
    const [rows, setRows] = useState([]);
    const [openCrear, setOpenCrear] = useState(false);
    const [openEditar, setOpenEditar] = useState(false);
    const [showFilter, setShowFilter] = useState(false);
    const [filterText, setFilterText] = useState("");

    const loadCategorias = async () => {
        try {
            const categorias = await getAllCategorias();
            setRows(categorias);
        } catch (error) {
            console.error("Error al cargar las categorías:", error.message);
        }
    };

    useEffect(() => {
        loadCategorias();
    }, []);

    const handleDelete = async (id) => {
        try {
            await deleteCategoria(id);
            loadCategorias();
        } catch (error) {
            console.error("Error al eliminar la categoría:", error.message);
        }
    };

    const handleToggle = async (id) => {
        try {
            await toggleCategoria(id);
            loadCategorias();
        } catch (error) {
            console.error("Error al cambiar el estado de la categoría:", error.message);
        }
    };

    const handleFilterToggle = () => {
        setShowFilter(!showFilter);
        if (showFilter) {
            setFilterText(""); // Limpia el filtro si se cierra
        }
    };

    const filteredRows = rows.filter(row => 
        row.Nombre.toLowerCase().includes(filterText.toLowerCase())
    );

    const columns = [
        {
            field: "Nombre",
            headerName: "Nombre",
            width: 150,
            minWidth: 180,
            headerAlign: 'center',
            align: 'center',
            cellClassName: "name-column--cell"
        },
        {
            field: "Descripcion",
            headerName: "Descripción",
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
                />
                <Button
                  color="secondary"
                  sx={{ mr: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
                >
                  <EditIcon />
                </Button>
                <Button
                  color="error"
                  sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minWidth: 48 }}
                  onClick={() => handleDelete(params.row.idCategoria)}
                >
                  <DeleteIcon/>
                </Button>
                <Tooltip title={params.row.Activo ? "Desactivar" : "Activar"}>
                    <IconButton
                        sx={{ color: colors.primary[100] }}
                        onClick={() => handleToggle(params.row.idCategoria)}
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
            <Header title="CATEGORÍAS" subtitle="Lista de categorías" />

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
                    Nueva categoría
                </Button>
                <Button
                    variant="outlined"
                    color="info"
                    onClick={handleFilterToggle}
                    sx={{ ml: 2,
                        borderRadius: '8px',
                        padding: '10px 20px',
                        fontWeight: 'bold',
                        textTransform: 'none',
                        boxShadow: '0px 3px 5px rgba(0, 0, 0, 0.2)',
                     }}
                >
                    Filtrar
                </Button>
            </Box>

            {showFilter && (
                <Box display="flex" alignItems="center" mb={2}>
                   <TextField
    label="Nombre"
    variant="outlined"
    value={filterText}
    onChange={(e) => setFilterText(e.target.value)}
    sx={{
        mr: 2,
        '& .MuiOutlinedInput-root': {
            '& fieldset': {
                borderColor: `${colors.sidebartext[500]} !important`, // Color del borde
            },
            '&.Mui-focused fieldset': {
                borderColor: `${colors.sidebartext[500]} !important`, // Color del borde al enfocar
            },
        },
        '& .MuiInputLabel-root': {
            color: `${colors.sidebartext[500]} !important`, // Color del label
        },
        '& .MuiInputLabel-root.Mui-focused': {
            color: `${colors.sidebartext[500]} !important`, // Color del label al enfocar
        },
    }}
/>

                    <Button
                        variant="outlined"
                        color="error"
                        startIcon={<CloseIcon />}
                        onClick={handleFilterToggle}
                        sx={{
                            borderRadius: '8px',
                            padding: '10px 20px',
                            fontWeight: 'bold',
                            textTransform: 'none',
                            boxShadow: '0px 3px 5px rgba(189, 0, 0, 0.247)',
                        }}
                    >
                        Cerrar
                    </Button>
                </Box>
            )}

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
                    rows={filteredRows}
                    columns={columns}
                    pageSize={10}
                    rowsPerPageOptions={[5, 10, 20]}
                    getRowId={(row) => row.idCategoria}
                    disableSelectionOnClick
                />
            </Box>
        </Box>
    );
};

export default Categorias;
