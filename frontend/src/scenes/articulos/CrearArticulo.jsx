// src/scenes/articulos/CrearArticulo.jsx
import { useEffect, useMemo, useState, useCallback } from "react";
import {
  Alert, Box, Button, DialogActions, DialogContent, DialogTitle,
  FormControl, FormControlLabel, Grid, InputLabel, MenuItem,
  Select, Switch, TextField, Typography, IconButton, Chip,
  Card, CardMedia, CardContent, LinearProgress, Stack,
  Tab, Tabs, useTheme,
} from "@mui/material";
import { alpha } from "@mui/material/styles";
import AddIcon         from "@mui/icons-material/Add";
import DeleteIcon      from "@mui/icons-material/Delete";
import CloudUploadIcon from "@mui/icons-material/CloudUpload";
import ImageIcon       from "@mui/icons-material/Image";
import StarIcon        from "@mui/icons-material/Star";
import StarBorderIcon  from "@mui/icons-material/StarBorder";
import CloseIcon       from "@mui/icons-material/Close";

import * as Products from "../../services/productService";
import { B, toNumber, TabPanel, SectionLabel } from "./_shared";

/* ══════════════════════════════════════════════
   CREAR ARTICULO
   ══════════════════════════════════════════════ */
export default function CrearArticulo({ onClose, onArticuloCreado }) {
  const theme  = useTheme();
  const isDark = theme.palette.mode === "dark";

  const [saving, setSaving]               = useState(false);
  const [err, setErr]                     = useState("");
  const [activeTab, setActiveTab]         = useState(0);
  const [categories, setCategories]       = useState([]);
  const [taxes, setTaxes]                 = useState([]);
  const [images, setImages]               = useState([]);
  const [uploadingImage, setUploadingImage] = useState(false);

  const [form, setForm] = useState({
    name: "", sku: "", barcode: "", category_id: "",
    description: "", unit: "UN",
    cost: "", price: "", tax_id: "", tax_rate: 21,
    is_active: true, track_stock: true, min_stock: 0, initial_stock: 0,
  });

  /* ── colors ── */
  const textCol   = isDark ? "#E6EEF5" : "#1A202C";
  const mutedCol  = isDark ? "rgba(230,238,245,0.45)" : "rgba(26,32,44,0.45)";
  const borderCol = isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.07)";
  const inputBg   = isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.025)";

  /* ── shared input sx ── */
  const inputSx = {
    "& .MuiOutlinedInput-root": {
      borderRadius: "10px",
      bgcolor: inputBg,
      fontSize: 13.5,
    },
    "& .MuiInputLabel-root": { fontSize: 13.5 },
  };

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        const [cats, txs] = await Promise.all([
          Products.listCategories?.() ?? Promise.resolve([]),
          Products.listTaxes?.()      ?? Promise.resolve([]),
        ]);
        if (!alive) return;
        setCategories(Array.isArray(cats) ? cats : (cats?.data ?? []));
        setTaxes(Array.isArray(txs) ? txs : (txs?.data ?? []));
        const def = (Array.isArray(txs) ? txs : (txs?.data ?? [])).find((t) => t.is_default);
        if (def) setForm((p) => ({ ...p, tax_id: String(def.id), tax_rate: toNumber(def.rate, 0) }));
      } catch (e) { console.error(e); }
    })();
    return () => { alive = false; };
  }, []);

  const canSave = useMemo(() => form.name.trim() !== "" && String(form.price).trim() !== "", [form.name, form.price]);
  const setField = (k) => (e) => setForm((p) => ({ ...p, [k]: e?.target?.value ?? e }));

  const handleImageUpload = useCallback((e) => {
    const files = Array.from(e.target.files || []);
    files.forEach((file) => {
      if (!file.type.startsWith("image/")) return;
      const reader = new FileReader();
      reader.onload = (evt) => {
        setImages((prev) => [...prev, {
          id: Date.now() + Math.random(),
          file, preview: evt.target.result,
          is_primary: prev.length === 0,
          alt: "", sort_order: prev.length,
        }]);
      };
      reader.readAsDataURL(file);
    });
    e.target.value = "";
  }, []);

  const handleDeleteImage = useCallback((id) => {
    setImages((prev) => {
      const f = prev.filter((img) => img.id !== id);
      if (f.length > 0 && !f.some((img) => img.is_primary)) f[0].is_primary = true;
      return f;
    });
  }, []);

  const handleSetPrimary = useCallback((id) => {
    setImages((prev) => prev.map((img) => ({ ...img, is_primary: img.id === id })));
  }, []);

  const handleSubmit = async () => {
    setErr("");
    if (!canSave) { setErr("Completá al menos Nombre y Precio."); return; }
    setSaving(true);
    try {
      const payload = {
        name: form.name.trim(),
        sku: form.sku?.trim() || null,
        barcode: form.barcode?.trim() || null,
        category_id: form.category_id ? Number(form.category_id) : null,
        description: form.description?.trim() || null,
        unit: form.unit?.trim() || "UN",
        cost: toNumber(form.cost, 0),
        price: toNumber(form.price, 0),
        tax_id: form.tax_id ? Number(form.tax_id) : null,
        tax_rate: toNumber(form.tax_rate, 0),
        is_active: !!form.is_active,
        track_stock: !!form.track_stock,
        min_stock: toNumber(form.min_stock, 0),
        initial_stock: toNumber(form.initial_stock, 0),
      };
      const newProduct = await Products.createProduct(payload);
      const productId  = newProduct.id || newProduct.idArticulo;
      if (images.length > 0 && Products.uploadProductImage) {
        setUploadingImage(true);
        for (const img of images) {
          try {
            await Products.uploadProductImage(productId, img.file, {
              alt: img.alt || form.name, is_primary: img.is_primary, sort_order: img.sort_order,
            });
          } catch (imgErr) { console.error(imgErr); }
        }
        setUploadingImage(false);
      }
      onArticuloCreado?.();
    } catch (e) {
      setErr(e?.response?.data?.message || e?.message || "No se pudo crear el artículo.");
    } finally { setSaving(false); setUploadingImage(false); }
  };

  /* ── Tab indicator style ── */
  const tabSx = {
    textTransform: "none",
    fontFamily: "Montserrat, sans-serif",
    fontWeight: 600,
    fontSize: 13,
    color: mutedCol,
    "&.Mui-selected": { color: B.blue, fontWeight: 700 },
    minHeight: 44,
  };

  return (
    <>
      {/* ── Title ── */}
      <DialogTitle sx={{ p: 0 }}>
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="space-between"
          sx={{
            px: 3, py: 2,
            borderBottom: `1px solid ${borderCol}`,
          }}
        >
          <Box>
            <Typography sx={{
              fontSize: 17, fontWeight: 800, color: textCol,
              letterSpacing: "-0.02em", fontFamily: "Montserrat, sans-serif",
            }}>
              Nuevo Producto
            </Typography>
            <Typography sx={{ fontSize: 12, color: mutedCol, mt: 0.2 }}>
              Completá los datos del artículo
            </Typography>
          </Box>
          <Stack direction="row" spacing={1} alignItems="center">
            {images.length > 0 && (
              <Chip
                label={`${images.length} imagen${images.length > 1 ? "es" : ""}`}
                size="small"
                sx={{
                  height: 22, fontSize: 11, fontWeight: 700,
                  bgcolor: alpha(B.blue, isDark ? 0.2 : 0.1),
                  color: B.blue,
                  border: `1px solid ${alpha(B.blue, 0.25)}`,
                }}
              />
            )}
            <IconButton
              onClick={onClose}
              size="small"
              sx={{
                width: 30, height: 30, borderRadius: "8px",
                color: mutedCol,
                "&:hover": { bgcolor: isDark ? "rgba(255,255,255,0.07)" : "rgba(0,0,0,0.05)", color: textCol },
              }}
            >
              <CloseIcon sx={{ fontSize: 17 }} />
            </IconButton>
          </Stack>
        </Stack>

        {/* Tabs */}
        <Tabs
          value={activeTab}
          onChange={(_, v) => setActiveTab(v)}
          sx={{
            px: 2, minHeight: 44,
            "& .MuiTabs-indicator": {
              bgcolor: B.blue, height: 2, borderRadius: 1,
            },
          }}
        >
          <Tab label="Información" sx={tabSx} />
          <Tab label="Imágenes"    sx={tabSx} />
          <Tab label="Inventario"  sx={tabSx} />
        </Tabs>
      </DialogTitle>

      {/* ── Content ── */}
      <DialogContent
        sx={{
          p: 0,
          bgcolor: isDark ? "#0F1F2A" : "#F7FAFC",
          "&::-webkit-scrollbar": { width: 4 },
          "&::-webkit-scrollbar-thumb": {
            bgcolor: isDark ? "rgba(255,255,255,0.14)" : "rgba(0,0,0,0.14)",
            borderRadius: 4,
          },
        }}
      >
        {err && (
          <Alert severity="error" sx={{ mx: 2.5, mt: 2, borderRadius: "10px", fontSize: 13 }}>
            {err}
          </Alert>
        )}

        {/* TAB 0 — Información */}
        <TabPanel value={activeTab} index={0}>
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <SectionLabel isDark={isDark}>Datos del producto</SectionLabel>
                <TextField
                  label="Nombre del Producto"
                  value={form.name}
                  onChange={setField("name")}
                  fullWidth required autoFocus
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField label="SKU / Código" value={form.sku} onChange={setField("sku")} fullWidth sx={inputSx} />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Código de Barras" value={form.barcode} onChange={setField("barcode")} fullWidth sx={inputSx} />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel sx={{ fontSize: 13.5 }}>Categoría</InputLabel>
                  <Select label="Categoría" value={form.category_id} onChange={setField("category_id")} sx={{ borderRadius: "10px" }}>
                    <MenuItem value="">Sin categoría</MenuItem>
                    {categories.map((c) => (
                      <MenuItem key={c.id} value={String(c.id)}>{c.name}</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField label="Unidad de Medida" value={form.unit} onChange={setField("unit")} fullWidth placeholder="UN" sx={inputSx} />
              </Grid>

              <Grid item xs={12}>
                <TextField
                  label="Descripción"
                  value={form.description}
                  onChange={setField("description")}
                  fullWidth multiline rows={3}
                  placeholder="Describí las características del producto..."
                  sx={inputSx}
                />
              </Grid>

              <Grid item xs={12}>
                <SectionLabel isDark={isDark}>Precios</SectionLabel>
              </Grid>

              <Grid item xs={12} sm={4}>
                <TextField
                  label="Costo"
                  value={form.cost}
                  onChange={setField("cost")}
                  fullWidth inputMode="decimal"
                  InputProps={{ startAdornment: <Typography sx={{ mr: 0.75, color: mutedCol, fontSize: 14 }}>$</Typography> }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  label="Precio de Venta"
                  value={form.price}
                  onChange={setField("price")}
                  fullWidth inputMode="decimal" required
                  InputProps={{ startAdornment: <Typography sx={{ mr: 0.75, color: mutedCol, fontSize: 14 }}>$</Typography> }}
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <FormControl fullWidth sx={inputSx}>
                  <InputLabel sx={{ fontSize: 13.5 }}>IVA</InputLabel>
                  <Select
                    label="IVA"
                    value={form.tax_id}
                    onChange={(e) => {
                      const id = e.target.value;
                      const t  = taxes.find((x) => String(x.id) === String(id));
                      setForm((p) => ({ ...p, tax_id: id, tax_rate: t ? toNumber(t.rate, 0) : p.tax_rate }));
                    }}
                    sx={{ borderRadius: "10px" }}
                  >
                    <MenuItem value="">Sin IVA</MenuItem>
                    {taxes.map((t) => (
                      <MenuItem key={t.id} value={String(t.id)}>{t.name} ({toNumber(t.rate, 0)}%)</MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12}>
                <Box sx={{
                  px: 2, py: 1.5, borderRadius: "10px",
                  bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${borderCol}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: textCol }}>
                      Producto Activo
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: mutedCol }}>
                      El producto será visible en el sistema
                    </Typography>
                  </Box>
                  <Switch
                    checked={form.is_active}
                    onChange={(e) => setForm((p) => ({ ...p, is_active: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-thumb": { bgcolor: form.is_active ? B.green : undefined },
                      "& .MuiSwitch-track": { bgcolor: form.is_active ? alpha(B.green, 0.5) : undefined },
                    }}
                  />
                </Box>
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {/* TAB 1 — Imágenes */}
        <TabPanel value={activeTab} index={1}>
          <Box sx={{ p: 2.5 }}>
            <Stack spacing={2}>
              {/* Upload zone */}
              <Box
                component="label"
                sx={{
                  display: "flex", flexDirection: "column",
                  alignItems: "center", justifyContent: "center",
                  gap: 1, p: 3,
                  borderRadius: "12px",
                  border: `2px dashed ${isDark ? "rgba(255,255,255,0.12)" : "rgba(0,0,0,0.1)"}`,
                  bgcolor: isDark ? "rgba(255,255,255,0.025)" : "rgba(0,0,0,0.02)",
                  cursor: "pointer",
                  transition: "border-color .15s, background-color .15s",
                  "&:hover": {
                    borderColor: B.blue,
                    bgcolor: alpha(B.blue, 0.04),
                  },
                }}
              >
                <Box sx={{
                  width: 44, height: 44, borderRadius: "12px",
                  bgcolor: alpha(B.blue, isDark ? 0.18 : 0.1),
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}>
                  <CloudUploadIcon sx={{ fontSize: 22, color: B.blue }} />
                </Box>
                <Typography sx={{ fontSize: 13.5, fontWeight: 700, color: textCol }}>
                  Subir imágenes
                </Typography>
                <Typography sx={{ fontSize: 12, color: mutedCol }}>
                  JPG, PNG, WebP · Máx. 5MB por imagen
                </Typography>
                <input type="file" hidden multiple accept="image/*" onChange={handleImageUpload} />
              </Box>

              {/* Image grid */}
              {images.length > 0 ? (
                <Grid container spacing={1.5}>
                  {images.map((img) => (
                    <Grid item xs={6} sm={4} key={img.id}>
                      <Card
                        elevation={0}
                        sx={{
                          borderRadius: "10px",
                          border: img.is_primary
                            ? `2px solid ${B.blue}`
                            : `1px solid ${borderCol}`,
                          bgcolor: isDark ? "#172A36" : "#fff",
                          overflow: "hidden",
                        }}
                      >
                        <Box sx={{ position: "relative" }}>
                          <CardMedia
                            component="img"
                            height={140}
                            image={img.preview}
                            alt={img.alt || "Preview"}
                            sx={{ objectFit: "cover" }}
                          />
                          {img.is_primary && (
                            <Box sx={{
                              position: "absolute", bottom: 6, left: 6,
                              px: 0.75, py: 0.2, borderRadius: "5px",
                              bgcolor: alpha(B.blue, 0.9),
                            }}>
                              <Typography sx={{ fontSize: 10, fontWeight: 700, color: "#fff" }}>
                                PRINCIPAL
                              </Typography>
                            </Box>
                          )}
                        </Box>
                        <Box sx={{
                          display: "flex", justifyContent: "space-between",
                          px: 0.75, py: 0.5,
                        }}>
                          <IconButton
                            size="small"
                            onClick={() => handleSetPrimary(img.id)}
                            sx={{ color: img.is_primary ? B.blue : mutedCol, borderRadius: "6px" }}
                          >
                            {img.is_primary
                              ? <StarIcon sx={{ fontSize: 17 }} />
                              : <StarBorderIcon sx={{ fontSize: 17 }} />
                            }
                          </IconButton>
                          <IconButton
                            size="small"
                            onClick={() => handleDeleteImage(img.id)}
                            sx={{ color: "#E63946", borderRadius: "6px", "&:hover": { bgcolor: alpha("#E63946", 0.08) } }}
                          >
                            <DeleteIcon sx={{ fontSize: 17 }} />
                          </IconButton>
                        </Box>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Box sx={{
                  textAlign: "center", py: 2,
                  color: mutedCol, fontSize: 13,
                }}>
                  Las imágenes se mostrarán aquí
                </Box>
              )}
            </Stack>
          </Box>
        </TabPanel>

        {/* TAB 2 — Inventario */}
        <TabPanel value={activeTab} index={2}>
          <Box sx={{ p: 2.5 }}>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <SectionLabel isDark={isDark}>Control de stock</SectionLabel>
                <Box sx={{
                  px: 2, py: 1.5, borderRadius: "10px",
                  bgcolor: isDark ? "rgba(255,255,255,0.04)" : "rgba(0,0,0,0.03)",
                  border: `1px solid ${borderCol}`,
                  display: "flex", alignItems: "center", justifyContent: "space-between",
                }}>
                  <Box>
                    <Typography sx={{ fontSize: 13.5, fontWeight: 600, color: textCol }}>
                      Controlar Stock
                    </Typography>
                    <Typography sx={{ fontSize: 12, color: mutedCol }}>
                      Activá para recibir alertas de stock bajo
                    </Typography>
                  </Box>
                  <Switch
                    checked={form.track_stock}
                    onChange={(e) => setForm((p) => ({ ...p, track_stock: e.target.checked }))}
                    sx={{
                      "& .MuiSwitch-thumb": { bgcolor: form.track_stock ? B.green : undefined },
                      "& .MuiSwitch-track": { bgcolor: form.track_stock ? alpha(B.green, 0.5) : undefined },
                    }}
                  />
                </Box>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  label="Stock Inicial"
                  value={form.initial_stock}
                  onChange={setField("initial_stock")}
                  fullWidth type="number" inputMode="decimal"
                  disabled={!form.track_stock}
                  helperText="Cantidad inicial en inventario"
                  sx={inputSx}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  label="Stock Mínimo"
                  value={form.min_stock}
                  onChange={setField("min_stock")}
                  fullWidth type="number" inputMode="decimal"
                  disabled={!form.track_stock}
                  helperText="Nivel de alerta de stock bajo"
                  sx={inputSx}
                />
              </Grid>
            </Grid>
          </Box>
        </TabPanel>

        {(saving || uploadingImage) && (
          <LinearProgress
            sx={{
              "& .MuiLinearProgress-bar": { bgcolor: B.blue },
              bgcolor: alpha(B.blue, 0.12),
            }}
          />
        )}
      </DialogContent>

      {/* ── Actions ── */}
      <DialogActions sx={{
        px: 2.5, py: 2,
        borderTop: `1px solid ${borderCol}`,
        gap: 1,
      }}>
        <Button
          onClick={onClose}
          disabled={saving || uploadingImage}
          sx={{
            color: mutedCol, fontWeight: 600, textTransform: "none",
            borderRadius: "10px", fontSize: 13.5,
            "&:hover": { color: textCol, bgcolor: isDark ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.04)" },
          }}
        >
          Cancelar
        </Button>
        <Button
          variant="contained"
          onClick={handleSubmit}
          disabled={saving || uploadingImage || !canSave}
          sx={{
            background: canSave
              ? `linear-gradient(90deg, ${B.blue}, ${B.teal})`
              : undefined,
            color: "#fff", fontWeight: 700, textTransform: "none",
            borderRadius: "10px", fontSize: 13.5, px: 2.5,
            boxShadow: canSave ? `0 4px 14px ${alpha(B.blue, 0.35)}` : "none",
            "&:hover": { background: `linear-gradient(90deg, ${B.teal}, ${B.green})` },
            "&.Mui-disabled": { opacity: 0.5, color: "#fff" },
          }}
        >
          {uploadingImage ? "Subiendo imágenes..." : saving ? "Guardando..." : "Crear Producto"}
        </Button>
      </DialogActions>
    </>
  );
}