// src/components/pdf/RemitoDocument.jsx
// Requiere: npm install @react-pdf/renderer
import {
  Document, Page, View, Text, StyleSheet, Font,
} from "@react-pdf/renderer";

// ─── Brand ──────────────────────────────────────────────────────────────────
const B = {
  blue:   "#397B9C",
  green:  "#5AAD9C",
  teal:   "#49949C",
  mint:   "#ACD6CE",
  dark:   "#1A202C",
  muted:  "#718096",
  border: "#E2E8F0",
  bg:     "#F7FAFC",
  white:  "#FFFFFF",
};

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  page: {
    fontFamily: "Helvetica",
    fontSize: 9,
    color: B.dark,
    backgroundColor: B.white,
    paddingTop: 0,
    paddingBottom: 24,
    paddingHorizontal: 0,
  },

  // Header band
  headerBand: {
    backgroundColor: B.blue,
    paddingHorizontal: 24,
    paddingVertical: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  headerLeft: { flexDirection: "column" },
  headerRight: { flexDirection: "column", alignItems: "flex-end" },
  headerEmpresa: { fontSize: 20, fontFamily: "Helvetica-Bold", color: B.white, letterSpacing: 1 },
  headerSlogan:  { fontSize: 8,  color: B.mint, marginTop: 2 },
  headerOrden:   { fontSize: 11, fontFamily: "Helvetica-Bold", color: B.white },
  headerFecha:   { fontSize: 8,  color: B.mint, marginTop: 2 },

  // Content area
  content: { paddingHorizontal: 24, paddingTop: 16 },

  // Info blocks row
  infoRow: { flexDirection: "row", gap: 12, marginBottom: 14 },
  infoBlock: {
    flex: 1, backgroundColor: B.bg, borderRadius: 4,
    padding: 10, borderLeft: 3, borderColor: B.blue,
  },
  infoBlockTitle: { fontSize: 7, fontFamily: "Helvetica-Bold", color: B.blue, letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 5 },
  infoLine:       { fontSize: 8, color: B.dark, marginBottom: 2, lineHeight: 1.4 },
  infoLineMuted:  { fontSize: 7.5, color: B.muted, marginBottom: 2 },

  // Table
  tableHeader: {
    flexDirection: "row", backgroundColor: B.dark,
    paddingVertical: 6, paddingHorizontal: 8,
    borderRadius: 3, marginBottom: 1,
  },
  tableHeaderCell: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: B.white, letterSpacing: 0.5, textTransform: "uppercase" },
  tableRow:      { flexDirection: "row", paddingVertical: 7, paddingHorizontal: 8 },
  tableRowEven:  { backgroundColor: B.bg },
  tableRowOdd:   { backgroundColor: B.white },
  tableCell:     { fontSize: 8.5, color: B.dark, lineHeight: 1.4 },
  tableCellSku:  { fontSize: 7.5, color: B.muted, marginTop: 1 },
  tableCellBold: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: B.dark },
  tableCellBlue: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: B.blue },

  // Col widths (flex)
  colDesc:   { flex: 4 },
  colCant:   { flex: 1, alignItems: "center" },
  colPrecio: { flex: 1.5, alignItems: "flex-end" },
  colTotal:  { flex: 1.5, alignItems: "flex-end" },

  // Dividers
  divider:        { height: 1,   backgroundColor: B.border, marginVertical: 10 },
  dividerDashed:  { height: 1,   borderTop: "1 dashed #A0AEC0", marginVertical: 10 },

  // Totals
  totalsContainer: { alignItems: "flex-end", marginTop: 8 },
  totalRow: { flexDirection: "row", gap: 16, marginBottom: 4, justifyContent: "flex-end" },
  totalLabel: { fontSize: 8.5, color: B.muted, width: 80, textAlign: "right" },
  totalValue: { fontSize: 8.5, color: B.dark, width: 80, textAlign: "right" },
  totalFinalBox: {
    backgroundColor: B.blue, borderRadius: 4,
    paddingHorizontal: 14, paddingVertical: 7,
    flexDirection: "row", justifyContent: "space-between",
    alignItems: "center", width: 200, marginTop: 4,
  },
  totalFinalLabel: { fontSize: 10, fontFamily: "Helvetica-Bold", color: B.white },
  totalFinalValue: { fontSize: 12, fontFamily: "Helvetica-Bold", color: B.white },

  // Pago
  pagoRow: { flexDirection: "row", alignItems: "center", marginTop: 10, gap: 6 },
  pagoLabel: { fontSize: 8.5, color: B.muted },
  pagoValue: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: B.dark },

  // Receipts table
  receiptsTable: { marginTop: 6 },
  receiptRow: { flexDirection: "row", paddingVertical: 5, paddingHorizontal: 6, borderBottom: "1 solid #E2E8F0" },
  receiptHeader: { backgroundColor: "#EEF3F8" },

  // Envío section
  envioSection: { marginTop: 10 },
  envioTitle: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: B.blue, marginBottom: 5 },
  envioLine:  { fontSize: 8.5, color: B.dark, marginBottom: 2, lineHeight: 1.4 },
  envioLineBold: { fontSize: 8.5, fontFamily: "Helvetica-Bold", color: B.dark, marginBottom: 2 },

  // Remitente section
  remitenteSection: { marginTop: 8 },
  remitenteLabel:   { fontSize: 7.5, color: B.muted, marginBottom: 3 },

  // Tear-off
  tearOff: { marginTop: 12, paddingTop: 10, paddingHorizontal: 24 },
  tearOffHeader: { fontSize: 8, fontFamily: "Helvetica-Bold", color: B.dark, marginBottom: 8 },
  tearOffRow: { flexDirection: "row", gap: 20, marginBottom: 8 },
  tearOffField: { flex: 1 },
  tearOffLabel: { fontSize: 7.5, fontFamily: "Helvetica-Bold", color: B.muted, marginBottom: 3 },
  tearOffLine:  { height: 1, backgroundColor: B.border },

  // Footer
  footer: { backgroundColor: B.blue, height: 5, marginTop: 20 },

  // Receipts section title
  sectionTitle: { fontSize: 10, fontFamily: "Helvetica-Bold", color: B.dark, marginBottom: 6 },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
const fmt = (n) =>
  `$ ${Number(n || 0).toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

const fmtDate = (d) => {
  if (!d) return "";
  return new Date(d).toLocaleDateString("es-AR");
};

// ─── Sub-components ───────────────────────────────────────────────────────────
function InfoBlock({ title, lines }) {
  return (
    <View style={s.infoBlock}>
      <Text style={s.infoBlockTitle}>{title}</Text>
      {lines.map((line, i) =>
        line?.bold
          ? <Text key={i} style={{ ...s.infoLine, fontFamily: "Helvetica-Bold" }}>{line.text}</Text>
          : <Text key={i} style={line?.muted ? s.infoLineMuted : s.infoLine}>{line?.text ?? line}</Text>
      )}
    </View>
  );
}

function TableHeader() {
  return (
    <View style={s.tableHeader}>
      <View style={s.colDesc}><Text style={s.tableHeaderCell}>Producto</Text></View>
      <View style={s.colCant}><Text style={s.tableHeaderCell}>Cant.</Text></View>
      <View style={s.colPrecio}><Text style={s.tableHeaderCell}>Precio unit.</Text></View>
      <View style={s.colTotal}><Text style={s.tableHeaderCell}>Total</Text></View>
    </View>
  );
}

function TableRow({ item, idx }) {
  const isEven = idx % 2 === 0;
  const name = item?.product?.name ?? item?.name ?? item?.description ?? "—";
  const sku  = item?.product?.sku  ?? item?.sku  ?? null;
  return (
    <View style={[s.tableRow, isEven ? s.tableRowEven : s.tableRowOdd]}>
      <View style={s.colDesc}>
        <Text style={s.tableCellBold}>{name}</Text>
        {sku && <Text style={s.tableCellSku}>SKU: {sku}</Text>}
      </View>
      <View style={s.colCant}>
        <Text style={s.tableCell}>{Number(item?.qty ?? 0).toFixed(0)} x</Text>
      </View>
      <View style={s.colPrecio}>
        <Text style={s.tableCell}>{fmt(item?.unit_price ?? 0)}</Text>
      </View>
      <View style={s.colTotal}>
        <Text style={s.tableCellBlue}>{fmt(item?.line_total ?? 0)}</Text>
      </View>
    </View>
  );
}

// ─── Main Document ────────────────────────────────────────────────────────────
export default function RemitoDocument({ entity, source, receipts = [], empresa = {} }) {
  if (!entity) return null;

  const isPos = source === "pos";
  const numero = entity?.number ?? entity?.code ?? entity?.id ?? "—";
  const fecha  = fmtDate(entity?.sale_date ?? entity?.created_at ?? entity?.date);

  const customerName = isPos
    ? (entity?.customer?.name ?? "Consumidor Final")
    : (entity?.customer_name ?? "—");
  const customerEmail = isPos
    ? (entity?.customer?.email ?? "")
    : (entity?.customer_email ?? "");
  const customerPhone = isPos
    ? (entity?.customer?.phone ?? "")
    : (entity?.customer_phone ?? "");
  const customerAddr  = isPos
    ? (entity?.customer?.address ?? "")
    : (entity?.shipping_address ?? "");

  const subtotal     = Number(entity?.subtotal       ?? 0);
  const discount     = Number(entity?.discount_total ?? 0);
  const tax          = Number(entity?.tax_total      ?? 0);
  const total        = Number(entity?.total          ?? 0);
  const observations = entity?.observations ?? entity?.notes ?? "";

  const items = entity?.items ?? [];

  const emp = {
    nombre:    empresa?.nombre    ?? "ARTDENT",
    slogan:    empresa?.slogan    ?? "Laboratorio Dental",
    direccion: empresa?.direccion ?? "Av. Corrientes 1234, CABA",
    ciudad:    empresa?.ciudad    ?? "Buenos Aires, Argentina",
    telefono:  empresa?.telefono  ?? "",
    email:     empresa?.email     ?? "",
    cuit:      empresa?.cuit      ?? "",
  };

  // Build client info lines
  const clientLines = [
    { bold: true, text: customerName },
    customerEmail && { muted: false, text: customerEmail },
    customerPhone && { muted: true, text: customerPhone },
    customerAddr  && customerAddr,
  ].filter(Boolean);

  // Build empresa info lines
  const empLines = [
    emp.direccion,
    emp.ciudad,
    emp.telefono && { muted: true, text: emp.telefono },
    emp.email    && { muted: true, text: emp.email    },
    emp.cuit     && `CUIT: ${emp.cuit}`,
  ].filter(Boolean);

  return (
    <Document
      title={`Remito ${numero} - ${emp.nombre}`}
      author={emp.nombre}
      subject="Comprobante de venta"
    >
      <Page size="A4" style={s.page}>

        {/* ── Header ──────────────────────────────────────────────────── */}
        <View style={s.headerBand}>
          <View style={s.headerLeft}>
            <Text style={s.headerEmpresa}>{emp.nombre}</Text>
            <Text style={s.headerSlogan}>{emp.slogan}</Text>
          </View>
          <View style={s.headerRight}>
            <Text style={s.headerOrden}>
              {isPos ? "Remito" : "Comprobante"} #{numero}
            </Text>
            <Text style={s.headerFecha}>Emitido el {fecha}</Text>
          </View>
        </View>

        {/* ── Content ─────────────────────────────────────────────────── */}
        <View style={s.content}>

          {/* Info blocks */}
          <View style={s.infoRow}>
            <InfoBlock title="Emisor" lines={empLines} />
            <InfoBlock title="Cliente" lines={clientLines} />
          </View>

          {/* Items table */}
          <TableHeader />
          {items.map((it, i) => (
            <TableRow key={it.id ?? i} item={it} idx={i} />
          ))}

          {/* Divider */}
          <View style={s.divider} />

          {/* Totals */}
          <View style={s.totalsContainer}>
            {subtotal > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Subtotal:</Text>
                <Text style={s.totalValue}>{fmt(subtotal)}</Text>
              </View>
            )}
            {discount > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Descuento:</Text>
                <Text style={[s.totalValue, { color: "#E53E3E" }]}>- {fmt(discount)}</Text>
              </View>
            )}
            {tax > 0 && (
              <View style={s.totalRow}>
                <Text style={s.totalLabel}>Impuestos:</Text>
                <Text style={s.totalValue}>{fmt(tax)}</Text>
              </View>
            )}
            <View style={s.totalFinalBox}>
              <Text style={s.totalFinalLabel}>TOTAL</Text>
              <Text style={s.totalFinalValue}>{fmt(total)}</Text>
            </View>
          </View>

          {/* Pago */}
          {entity?.payment_method && (
            <View style={s.pagoRow}>
              <Text style={s.pagoLabel}>Medio de pago:</Text>
              <Text style={s.pagoValue}>{entity.payment_method}</Text>
            </View>
          )}

          {/* Observations */}
          {observations ? (
            <>
              <View style={s.dividerDashed} />
              <Text style={[s.infoLineMuted, { marginBottom: 2 }]}>Observaciones:</Text>
              <Text style={[s.infoLine]}>{observations}</Text>
            </>
          ) : null}

          {/* Receipts section */}
          {receipts.length > 0 && (
            <>
              <View style={s.divider} />
              <Text style={s.sectionTitle}>Pagos registrados</Text>
              <View style={s.receiptsTable}>
                <View style={[s.receiptRow, s.receiptHeader]}>
                  <Text style={[s.tableHeaderCell, { flex: 2 }]}>Comprobante</Text>
                  <Text style={[s.tableHeaderCell, { flex: 2 }]}>Fecha</Text>
                  <Text style={[s.tableHeaderCell, { flex: 2, textAlign: "right" }]}>Importe</Text>
                  <Text style={[s.tableHeaderCell, { flex: 3 }]}>Referencia</Text>
                </View>
                {receipts.map((rc, i) => (
                  <View key={rc.id ?? i} style={[s.receiptRow, i % 2 === 0 ? {} : { backgroundColor: B.bg }]}>
                    <Text style={[s.tableCell, { flex: 2 }]}>{rc.receipt_number ?? `#${rc.id}`}</Text>
                    <Text style={[s.tableCell, { flex: 2 }]}>{String(rc.receipt_date ?? "").slice(0, 10)}</Text>
                    <Text style={[s.tableCellBlue, { flex: 2, textAlign: "right" }]}>{fmt(rc.amount)}</Text>
                    <Text style={[s.tableCell, { flex: 3, color: B.muted }]}>{rc.reference ?? "—"}</Text>
                  </View>
                ))}
              </View>
            </>
          )}

          {/* Shipping address (ecom) */}
          {!isPos && entity?.shipping_address && (
            <>
              <View style={s.dividerDashed} />
              <View style={s.envioSection}>
                <Text style={s.envioTitle}>Dirección de envío</Text>
                <Text style={s.envioLine}>{entity.shipping_address}</Text>
              </View>
            </>
          )}
        </View>

        {/* ── Tear-off strip ───────────────────────────────────────────── */}
        <View style={[s.dividerDashed, { marginHorizontal: 24 }]} />
        <View style={s.tearOff}>
          <Text style={s.tearOffHeader}>
            {isPos ? "Remito" : "Comprobante"} #{numero}  ·  Datos de recepción
          </Text>
          <View style={s.tearOffRow}>
            <View style={s.tearOffField}>
              <Text style={s.tearOffLabel}>Nombre y apellido</Text>
              <View style={s.tearOffLine} />
            </View>
            <View style={[s.tearOffField, { flex: 0.6 }]}>
              <Text style={s.tearOffLabel}>DNI</Text>
              <View style={s.tearOffLine} />
            </View>
          </View>
          <View style={s.tearOffRow}>
            <View style={[s.tearOffField, { flex: 0.5 }]}>
              <Text style={s.tearOffLabel}>Fecha</Text>
              <View style={s.tearOffLine} />
            </View>
            <View style={s.tearOffField}>
              <Text style={s.tearOffLabel}>Firma</Text>
              <View style={s.tearOffLine} />
            </View>
            <View style={[s.tearOffField, { flex: 0.5 }]}>
              <Text style={s.tearOffLabel}>Aclaración</Text>
              <View style={s.tearOffLine} />
            </View>
          </View>
        </View>

        {/* ── Footer ──────────────────────────────────────────────────── */}
        <View style={s.footer} />

      </Page>
    </Document>
  );
}