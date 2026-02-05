import { useEffect, useMemo, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Stack,
  TextField,
} from "@mui/material";
import { DataGrid } from "@mui/x-data-grid";
import { DatePicker, TimePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import Header from "../../components/Header";
import { Collaborators as CollaboratorsService, CollaboratorAttendances as AttendancesService } from "../../services";
import { format } from "date-fns";

const toYmd = (d) => (d ? format(d, "yyyy-MM-dd") : null);
const toHm = (d) => (d ? format(d, "HH:mm") : null);

export default function Asistencias() {
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorId, setCollaboratorId] = useState("");

  const [workDate, setWorkDate] = useState(new Date());
  const [timeIn, setTimeIn] = useState(null);
  const [timeOut, setTimeOut] = useState(null);
  const [notes, setNotes] = useState("");

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(false);

  const [from, setFrom] = useState(null);
  const [to, setTo] = useState(null);

  const showApiError = (e, fallback = "Ocurrió un error.") => {
    const msg =
      e?.response?.data?.message ||
      e?.response?.data?.error ||
      e?.message ||
      fallback;
    console.error(e);
    alert(msg);
  };

  const loadCollaborators = async () => {
    try {
      const data = await CollaboratorsService.Collaborators.list({ active: true });
      setCollaborators(Array.isArray(data) ? data : []);
    } catch (e) {
      showApiError(e, "Error cargando colaboradores.");
    }
  };

  const fetchRows = async () => {
    setLoading(true);
    try {
      const data = await AttendancesService.CollaboratorAttendances.list({
        collaborator_id: collaboratorId || undefined,
        from: toYmd(from) || undefined,
        to: toYmd(to) || undefined,
      });
      setRows(Array.isArray(data) ? data : []);
    } catch (e) {
      showApiError(e, "Error cargando asistencias.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCollaborators();
    fetchRows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const columns = useMemo(
    () => [
      { field: "id", headerName: "ID", width: 80 },
      {
        field: "collaborator",
        headerName: "Colaborador",
        flex: 1,
        minWidth: 220,
        valueGetter: (p) => p.row?.collaborator?.name || "",
      },
      {
        field: "work_date",
        headerName: "Fecha",
        width: 130,
        valueFormatter: (p) => (p.value ? format(new Date(p.value), "dd/MM/yyyy") : ""),
      },
      { field: "time_in", headerName: "Entrada", width: 110 },
      { field: "time_out", headerName: "Salida", width: 110 },
      {
        field: "hours",
        headerName: "Horas",
        width: 110,
        valueFormatter: (p) => Number(p.value || 0).toFixed(2),
      },
      {
        field: "amount",
        headerName: "Importe",
        width: 130,
        valueFormatter: (p) => `$ ${Number(p.value || 0).toFixed(2)}`,
      },
      {
        field: "actions",
        headerName: "Acciones",
        width: 150,
        sortable: false,
        renderCell: (params) => (
          <Button
            size="small"
            color="error"
            variant="outlined"
            onClick={() => onDelete(params.row)}
          >
            Eliminar
          </Button>
        ),
      },
    ],
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [rows]
  );

  const onCreate = async () => {
    if (!collaboratorId) {
      alert("Seleccione un colaborador.");
      return;
    }

    try {
      await AttendancesService.CollaboratorAttendances.create({
        collaborator_id: Number(collaboratorId),
        work_date: toYmd(workDate),
        time_in: toHm(timeIn),
        time_out: toHm(timeOut),
        notes: notes || null,
      });

      setTimeIn(null);
      setTimeOut(null);
      setNotes("");
      await fetchRows();
    } catch (e) {
      showApiError(e, "No se pudo guardar la asistencia.");
    }
  };

  const onDelete = async (row) => {
    if (!window.confirm("Eliminar registro de asistencia?")) return;
    try {
      await AttendancesService.CollaboratorAttendances.remove(row.id);
      await fetchRows();
    } catch (e) {
      showApiError(e, "No se pudo eliminar la asistencia.");
    }
  };

  return (
    <Box>
      <Header
        title="Asistencias"
        subtitle="Registro de ingreso/egreso y cálculo de horas"
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={2} mb={2}>
          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              select
              label="Colaborador"
              value={collaboratorId}
              onChange={(e) => setCollaboratorId(e.target.value)}
              fullWidth
            >
              {collaborators.map((c) => (
                <MenuItem key={c.id} value={c.id}>
                  {c.name}
                </MenuItem>
              ))}
            </TextField>
            <DatePicker
              label="Fecha"
              value={workDate}
              onChange={setWorkDate}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Entrada"
              value={timeIn}
              onChange={setTimeIn}
              ampm={false}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <TimePicker
              label="Salida"
              value={timeOut}
              onChange={setTimeOut}
              ampm={false}
              slotProps={{ textField: { fullWidth: true } }}
            />
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <TextField
              label="Observaciones (opcional)"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              fullWidth
            />
            <Button variant="contained" onClick={onCreate}>
              Guardar
            </Button>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <DatePicker
              label="Desde"
              value={from}
              onChange={setFrom}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <DatePicker
              label="Hasta"
              value={to}
              onChange={setTo}
              slotProps={{ textField: { fullWidth: true } }}
            />
            <Button variant="outlined" onClick={fetchRows}>
              Filtrar
            </Button>
          </Stack>
        </Stack>

        <Box sx={{ height: 560 }}>
          <DataGrid
            rows={rows}
            columns={columns}
            loading={loading}
            pageSize={10}
            rowsPerPageOptions={[10, 25, 50]}
            disableSelectionOnClick
          />
        </Box>
      </LocalizationProvider>
    </Box>
  );
}
