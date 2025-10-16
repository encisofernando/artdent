import { forwardRef, useRef } from "react";
import {
  Dialog, DialogTitle, DialogContent, DialogActions,
  Button, useTheme
} from "@mui/material";

// Conversión mm → px para vista previa
const mmToPx = (mm) => Math.round((mm * 96) / 25.4);

// ===== COMPONENTE DE TICKET =====
const Ticket = forwardRef(
  (
    {
      size = "80",
      logoUrl,
      company = {},
      comprobante = {},
      cliente = {},
      paciente = {},
      items = [],
      totales = {},
    },
    ref
  ) => {
    const theme = useTheme();
    const widthMM = size === "57" ? 57 : 80;
    const previewWidthPx = mmToPx(widthMM);

    const total = Number(totales.total || 0);

    return (
      <div
        ref={ref}
        style={{
          width: previewWidthPx,
          margin: "0 auto",
          background: "#fff",
          color: "#000",
          fontFamily: "'Montserrat', sans-serif",
          fontSize: widthMM === 57 ? 11 : 12.5,
          lineHeight: 1.4,
          padding: "10px 8px",
          borderRadius: 6,
          border: `1px solid ${theme.palette.divider}`,
        }}
      >
        {/* === ESTILOS === */}
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
          @media print {
            @page { size: ${widthMM}mm auto; margin: 0; }
            body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
            .ticket-root { width: ${widthMM}mm !important; margin: 0 !important; border: 0 !important; border-radius: 0 !important; }
          }
          .t-center { text-align:center; }
          .bold { font-weight:700; }
          .label { font-weight:600; }
          .line { border-bottom: 1px solid #000; margin: 4px 0; }
          .datos span { display:inline-block; min-width: 60px; }
          .tabla { width:100%; border-collapse: collapse; margin-top:6px; }
          .tabla th, .tabla td {
            padding: 2px 4px;
            border: 1px solid #000;
            font-size: ${widthMM === 57 ? 10 : 11.5}px;
          }
          .tabla th { font-weight:700; text-align:center; }
          .tabla td:nth-child(1) {
            width: 55%;
            word-wrap: break-word;
            white-space: normal;
          }
          .tabla td:nth-child(2),
          .tabla td:nth-child(3),
          .tabla td:nth-child(4) {
            text-align: center;
            width: 15%;
          }
        `}</style>

        <div className="ticket-root">
          {/* === LOGO Y CABECERA === */}
          <div className="t-center" style={{ marginBottom: 6 }}>
            {logoUrl ? (
              <img
                src={logoUrl}
                alt="logo"
                style={{ maxHeight: widthMM === 57 ? 40 : 55, objectFit: "contain" }}
              />
            ) : (
              <div className="bold" style={{ fontSize: 14 }}>
                {company.nombre || "ARTDENT"}
              </div>
            )}
          </div>

          <div className="t-center" style={{ fontSize: 11, marginBottom: 6 }}>
            DOCUMENTO NO Válido COMO Factura
          </div>
          <div className="line" />

          {/* === INFO DE COMPROBANTE === */}
          <div style={{ fontSize: 11.5, marginBottom: 6 }}>
            <div>
              <span className="label">Ticket:</span>{" "}
              <span className="bold">{comprobante.numero || "0000"}</span>{" "}
              <span style={{ float: "right" }}>
                Fec: {comprobante.fecha || new Date().toISOString().slice(0, 10)}
              </span>
            </div>
            <div>Clí: {cliente.nombre || "-"}</div>
            <div>Dr/a: {cliente.doctor || "-"}</div>
            <div>Domic: {cliente.domicilio || "-"}</div>
            <div>c.u.i.t: {cliente.cuit || "-"}</div>
            <div>Pac: {paciente.nombre || "-"}</div>
          </div>

          {/* === TABLA DE ITEMS === */}
          <table className="tabla">
            <thead>
              <tr>
                <th>Descripción</th>
                <th>Can</th>
                <th>Uni</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {items.map((it, i) => (
                <tr key={i}>
                  <td>{it.descripcion || it.name}</td>
                  <td>{it.cantidad || it.qty}</td>
                  <td>{(it.precio || it.price || 0).toLocaleString("es-AR")}</td>
                  <td>{(it.total || it.subtotal || 0).toLocaleString("es-AR")}</td>
                </tr>
              ))}
            </tbody>
          </table>

          <div className="line" />

          {/* === TOTAL === */}
          <div
            className="t-center bold"
            style={{ marginTop: 6, fontSize: 13 }}
          >
            Total del Ticket: {total.toLocaleString("es-AR")}
          </div>
        </div>
      </div>
    );
  }
);

// ===== MODAL IMPRESIÓN =====
const ModalImprimir = ({
  open,
  onClose,
  size = "80",
  logoUrl,
  company,
  comprobante,
  cliente,
  paciente,
  items,
  totales,
}) => {
  const ticketRef = useRef(null);

  const imprimir = () => {
    const html = ticketRef.current?.outerHTML || "";
    const w = window.open("", "_blank");
    if (!w) return;

    w.document.write(`
      <html>
        <head>
          <title>Ticket</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
            @page { size: ${size === "57" ? "57mm" : "80mm"} auto; margin: 0; }
            body { margin:0; font-family:'Montserrat',sans-serif; }
          </style>
        </head>
        <body>${html}</body>
      </html>
    `);
    w.document.close();
    w.focus();
    const imgs = Array.from(w.document.images);
    Promise.all(
      imgs.map(
        (img) =>
          new Promise((res) => {
            if (img.complete) res();
            else img.onload = img.onerror = res;
          })
      )
    ).then(() => {
      w.print();
      w.close();
    });
  };

  return (
    <Dialog open={open} onClose={onClose} fullWidth maxWidth="xs">
      <DialogTitle>Vista previa del ticket ({size} mm)</DialogTitle>
      <DialogContent dividers>
        <Ticket
          ref={ticketRef}
          size={size}
          logoUrl={logoUrl}
          company={company}
          comprobante={comprobante}
          cliente={cliente}
          paciente={paciente}
          items={items}
          totales={totales}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cerrar</Button>
        <Button variant="contained" color="secondary" onClick={imprimir}>
          Imprimir
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ModalImprimir;
