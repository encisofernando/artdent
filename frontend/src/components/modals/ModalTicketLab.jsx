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
      pago = {},
      footer = "",
    },
    ref
  ) => {
    const theme = useTheme();
    const widthMM = size === "57" ? 57 : 80;
    const previewWidthPx = mmToPx(widthMM);

    const total = Number(totales.total || 0);
    const subtotal = Number(totales.subtotal || 0);
    const iva21 = Number(totales.iva21 || 0);
    const iva105 = Number(totales.iva105 || 0);

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

          {/* === TOTALES (IVA DISCRIMINADO - NO SE SUMA) === */}
          <div style={{ fontSize: 11.5, marginTop: 6 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span className="label">Subtotal</span>
              <span>{subtotal.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {iva21 > 0 ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label">IVA 21%</span>
                <span>{iva21.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ) : null}
            {iva105 > 0 ? (
              <div style={{ display: "flex", justifyContent: "space-between" }}>
                <span className="label">IVA 10,5%</span>
                <span>{iva105.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            ) : null}
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4 }}>
              <span className="bold">TOTAL</span>
              <span className="bold">{total.toLocaleString("es-AR", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          </div>

          {(pago?.medio || pago?.cajero) ? (
            <>
              <div className="line" />
              <div style={{ fontSize: 11.5 }}>
                {pago?.medio ? <div><span className="label">Pago:</span> {pago.medio}</div> : null}
                {pago?.cajero ? <div><span className="label">Cajero:</span> {pago.cajero}</div> : null}
              </div>
            </>
          ) : null}

          {footer ? (
            <>
              <div className="line" />
              <div className="t-center" style={{ fontSize: 11.5 }}>{footer}</div>
            </>
          ) : null}
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
  pago,
  footer,
}) => {
  const ticketRef = useRef(null);

  const imprimir = () => {
    // Impresión robusta: usar iframe oculto (evita popups en blanco / bloqueados)
    const html = ticketRef.current?.outerHTML || "";
    if (!html) return;

    const iframe = document.createElement("iframe");
    iframe.style.position = "fixed";
    iframe.style.right = "0";
    iframe.style.bottom = "0";
    iframe.style.width = "0";
    iframe.style.height = "0";
    iframe.style.border = "0";
    iframe.setAttribute("aria-hidden", "true");
    document.body.appendChild(iframe);

    const doc = iframe.contentWindow?.document;
    if (!doc) {
      document.body.removeChild(iframe);
      return;
    }

    doc.open();
    doc.write(`<!doctype html>
      <html>
        <head>
          <meta charset="utf-8" />
          <title>Ticket</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;600;700&display=swap');
            @page { size: ${size === "57" ? "57mm" : "80mm"} auto; margin: 0; }
            html, body { margin:0; padding:0; }
            body { font-family:'Montserrat',sans-serif; }
          </style>
        </head>
        <body>${html}</body>
      </html>`);
    doc.close();

    const win = iframe.contentWindow;
    const imgs = Array.from(doc.images || []);
    const waitImgs = Promise.all(
      imgs.map(
        (img) =>
          new Promise((res) => {
            if (img.complete) res();
            else img.onload = img.onerror = res;
          })
      )
    );

    waitImgs.finally(() => {
      try {
        win.focus();
        win.print();
      } finally {
        setTimeout(() => {
          try { document.body.removeChild(iframe); } catch { /* noop */ }
        }, 500);
      }
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
          pago={pago}
          footer={footer}
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
