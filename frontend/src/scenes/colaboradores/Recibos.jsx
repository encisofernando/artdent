import { useEffect, useState } from "react";
import {
  Box,
  Button,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { format } from "date-fns";
import Header from "../../components/Header";
import { Collaborators as CollaboratorsService, CollaboratorReceipts as ReceiptsService } from "../../services";

const toYmd = (d) => (d ? format(d, "yyyy-MM-dd") : null);

export default function Recibos() {
  const [collaborators, setCollaborators] = useState([]);
  const [collaboratorId, setCollaboratorId] = useState("");
  const [from, setFrom] = useState(new Date());
  const [to, setTo] = useState(new Date());
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Encabezado opcional para el recibo (se envía por headers)
  const [companyName, setCompanyName] = useState(
    localStorage.getItem("companyName") || ""
  );
  const [companyTaxId, setCompanyTaxId] = useState(
    localStorage.getItem("companyTaxId") || ""
  );
  const [companyAddress, setCompanyAddress] = useState(
    localStorage.getItem("companyAddress") || ""
  );

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

  useEffect(() => {
    loadCollaborators();
  }, []);

  const onGenerate = async () => {
    if (!collaboratorId) {
      alert("Seleccione un colaborador.");
      return;
    }
    setLoading(true);
    try {
      const headers = {};
      if (companyName.trim()) headers["X-Company-Name"] = companyName.trim();
      if (companyTaxId.trim()) headers["X-Company-Tax-Id"] = companyTaxId.trim();
      if (companyAddress.trim()) headers["X-Company-Address"] = companyAddress.trim();

      // Persistir para próximas veces
      localStorage.setItem("companyName", companyName);
      localStorage.setItem("companyTaxId", companyTaxId);
      localStorage.setItem("companyAddress", companyAddress);

      const data = await ReceiptsService.CollaboratorReceipts.generate(
        {
          collaborator_id: Number(collaboratorId),
          period_from: toYmd(from),
          period_to: toYmd(to),
        },
        headers
      );
      setResult(data);
    } catch (e) {
      showApiError(e, "No se pudo generar el recibo.");
    } finally {
      setLoading(false);
    }
  };

  const openPrint = (html) => {
    const w = window.open("", "_blank");
    if (!w) return;
    w.document.open();
    w.document.write(html);
    w.document.close();
    w.focus();
  };

  const r = result?.data?.receipt;

  return (
    <Box>
      <Header
        title="Recibos"
        subtitle="Generación de comprobantes de pago por período"
      />

      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <Stack spacing={2} mb={2}>
          <Paper sx={{ p: 2 }} variant="outlined">
            <Typography variant="subtitle1" fontWeight={700} mb={1}>
              Datos del encabezado (opcional)
            </Typography>
            <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
              <TextField
                label="Empresa"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                fullWidth
              />
              <TextField
                label="CUIT"
                value={companyTaxId}
                onChange={(e) => setCompanyTaxId(e.target.value)}
                fullWidth
              />
              <TextField
                label="Domicilio"
                value={companyAddress}
                onChange={(e) => setCompanyAddress(e.target.value)}
                fullWidth
              />
            </Stack>
          </Paper>
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
            <Button variant="contained" onClick={onGenerate} disabled={loading}>
              Generar
            </Button>
          </Stack>
        </Stack>
      </LocalizationProvider>

      {r && (
        <Paper sx={{ p: 2 }}>
          <Typography variant="h6" fontWeight={700} mb={1}>
            Resumen
          </Typography>
          <Stack direction={{ xs: "column", md: "row" }} spacing={3} mb={2}>
            <Box>
              <Typography variant="body2">Horas</Typography>
              <Typography variant="h6">{Number(r.hours || 0).toFixed(2)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2">Bruto</Typography>
              <Typography variant="h6">$ {Number(r.gross || 0).toFixed(2)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2">Extras</Typography>
              <Typography variant="h6">$ {Number(r.extras_total || 0).toFixed(2)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2">Descuentos</Typography>
              <Typography variant="h6">$ {Number(r.discounts_total || 0).toFixed(2)}</Typography>
            </Box>
            <Box>
              <Typography variant="body2">Neto</Typography>
              <Typography variant="h6" fontWeight={800}>
                $ {Number(r.net || 0).toFixed(2)}
              </Typography>
            </Box>
          </Stack>

          <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
            <Button
              variant="outlined"
              onClick={() => openPrint(result.html_ticket_80)}
            >
              Imprimir Ticket 80mm
            </Button>
            <Button variant="outlined" onClick={() => openPrint(result.html_a5)}>
              Imprimir/Guardar A5
            </Button>
          </Stack>

          <Typography variant="caption" sx={{ opacity: 0.8, mt: 2, display: "block" }}>
            Nota: para que el encabezado (Empresa/CUIT/Domicilio) salga igual que en tu planilla,
            el backend permite enviarlo por headers: X-Company-Name, X-Company-Tax-Id, X-Company-Address.
          </Typography>
        </Paper>
      )}
    </Box>
  );
}
