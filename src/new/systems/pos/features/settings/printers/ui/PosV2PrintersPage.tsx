import { useState } from "react";
import { PosV2Shell } from "../../../../shared/ui/PosV2Shell";
import { getDefaultPosPrinter, PosPrinterPaperMm, readPosPrinters, writePosPrinters } from "../../../../shared/config/posPrinters";
import "./PosV2PrintersPage.css";

export const PosV2PrintersPage = () => {
  const [paperMm, setPaperMm] = useState<PosPrinterPaperMm>(() => getDefaultPosPrinter(readPosPrinters())?.paperMm ?? "80");
  const [result, setResult] = useState("");
  const saveFormat = () => {
    const printers = readPosPrinters();
    const current = getDefaultPosPrinter(printers);
    writePosPrinters(current
      ? printers.map(printer => printer.id === current.id ? { ...printer, paperMm } : printer)
      : [{ id: "browser-ticket", name: "Formato de ticket", paperMm, isDefault: true, createdAt: new Date().toISOString() }]);
    setResult("Formato guardado. Se aplicará a los tickets de venta.");
  };
  const runTestPrint = () => {
    const preview = window.open("", "_blank", "width=460,height=640");
    if (!preview) { setResult("Permite ventanas emergentes para abrir la prueba de impresión."); return; }
    preview.opener = null;
    preview.document.write(`<!doctype html><html lang="es"><head><meta charset="utf-8"><title>Prueba de impresión</title><style>@page{size: ${paperMm}mm auto;margin:3mm}body{font:12px monospace;width:calc(${paperMm}mm - 6mm);margin:auto;overflow-wrap:anywhere}button{padding:12px}@media print{button{display:none}}</style></head><body><h1>RAVEKH</h1><p>Prueba de ticket</p><p>Formato de ticket</p><p>Formato: ${paperMm} mm</p><hr><p>1 × Producto de prueba · $10.00</p><strong>Total: $10.00</strong><p>${new Date().toLocaleString("es-MX")}</p><button onclick="window.print()">Imprimir prueba</button></body></html>`);
    preview.document.close();
    setResult("Prueba abierta. Selecciona la impresora instalada en el diálogo de impresión del navegador.");
  };


  return <PosV2Shell title="Impresión" subtitle="Configura el formato de tus tickets">
    <section className="pos-v2-printers">
      <p>Al imprimir, elige una impresora instalada en tu equipo en el diálogo del navegador.</p>
      <label>Ancho del ticket
        <select value={paperMm} onChange={event => setPaperMm(event.target.value as PosPrinterPaperMm)}>
          <option value="80">80 mm</option>
          <option value="58">58 mm</option>
        </select>
      </label>
      <p>El ancho define el diseño del ticket. El tamaño de papel se elige al imprimir.</p>
      <div className="pos-v2-printers__actions">
        <button type="button" onClick={saveFormat}>Guardar formato</button>
        <button type="button" onClick={runTestPrint}>Probar impresión</button>
      </div>
      {result ? <p className="pos-v2-printers__result" role="status">{result}</p> : null}
    </section>
  </PosV2Shell>;
};
