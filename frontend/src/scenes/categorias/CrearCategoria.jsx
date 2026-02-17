import { useEffect, useMemo, useState } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, TextField, Stack, FormControl, InputLabel, Select, MenuItem,
  Alert
} from "@mui/material";
import * as Categories from "../../services/categoryService";

export default function CrearCategoria({ open, onClose, onCreated }) {
  const [name, setName] = useState("");
  const [parentId, setParentId] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [parents, setParents] = useState([]);

  useEffect(() => {
    if (!open) return;
    setName("");
    setParentId("");
    setError("");

    (async () => {
      try {
        const data = await Categories.listCategories({ q: "" });
        setParents(Array.isArray(data) ? data : []);
      } catch (e) {
        setParents([]);
      }
    })();
  }, [open]);

  const canSubmit = useMemo(() => name.trim().length >= 2, [name]);

  const handleSubmit = async () => {
    setLoading(true);
    setError("");
    try {
      await Categories.createCategory({
        name: name.trim(),
        parent_id: parentId ? Number(parentId) : null,
      });
      onCreated?.();
      onClose?.();
    } catch (e) {
      const msg =
        e?.response?.data?.message ||
        (e?.response?.data?.errors
          ? Object.values(e.response.data.errors).flat().join(" ")
          : "") ||
        "No se pudo crear la categoría.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onClose={loading ? undefined : onClose} fullWidth maxWidth="sm">
      <DialogTitle>Nueva Categoría</DialogTitle>

      <DialogContent dividers>
        <Stack gap={2}>
          {error && <Alert severity="error">{error}</Alert>}

          <TextField
            label="Nombre"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ej: Insumos"
            autoFocus
            fullWidth
          />

          <FormControl fullWidth>
            <InputLabel>Categoría padre (opcional)</InputLabel>
            <Select
              label="Categoría padre (opcional)"
              value={parentId}
              onChange={(e) => setParentId(e.target.value)}
            >
              <MenuItem value="">
                <em>Sin padre</em>
              </MenuItem>
              {parents.map((c) => (
                <MenuItem key={c.id} value={String(c.id)}>
                  {c.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={!canSubmit || loading}
        >
          Crear
        </Button>
      </DialogActions>
    </Dialog>
  );
}
