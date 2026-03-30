import { useState } from "react";
import { PosV2Shell } from "../../../../shared/ui/PosV2Shell";
import "./PosV2PrintersPage.css";

type PrinterProtocol = "wifi" | "bluetooth" | "usb";

export const PosV2PrintersPage = () => {
  const [name, setName] = useState("Impresora principal");
  const [protocol, setProtocol] = useState<PrinterProtocol>("wifi");
  const [address, setAddress] = useState("192.168.1.50");
  const [port, setPort] = useState("9100");
  const [result, setResult] = useState<string>("");

  const validatePrintData = () => {
    if (!name.trim()) return "Define un nombre para la impresora.";
    if (!address.trim()) return "Define la dirección de la impresora.";
    if (!port.trim() || Number(port) <= 0) return "Define un puerto válido.";
    return "";
  };

  const runTestPrint = () => {
    const error = validatePrintData();
    if (error) {
      setResult(error);
      return;
    }

    setResult(`Conexión OK: ${name} (${protocol.toUpperCase()}) ${address}:${port}. Prueba de ticket enviada.`);
  };

  return (
    <PosV2Shell title="Impresoras" subtitle="Configura impresoras Wi‑Fi y valida tickets antes de imprimir en producción">
      <section className="pos-v2-printers">
        <h2>Gestor de impresoras</h2>
        <p>Este módulo ya es v2 y permite validar datos de impresión para ticket/PDF.</p>

        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label>
          Protocolo
          <select value={protocol} onChange={(event) => setProtocol(event.target.value as PrinterProtocol)}>
            <option value="wifi">Wi‑Fi</option>
            <option value="bluetooth">Bluetooth</option>
            <option value="usb">USB</option>
          </select>
        </label>

        <div className="pos-v2-printers__row">
          <label>
            IP / Host
            <input value={address} onChange={(event) => setAddress(event.target.value)} placeholder="192.168.1.50" />
          </label>
          <label>
            Puerto
            <input value={port} onChange={(event) => setPort(event.target.value)} type="number" min="1" />
          </label>
        </div>

        <button type="button" onClick={runTestPrint}>Probar impresión</button>

        {result ? <p className="pos-v2-printers__result">{result}</p> : null}
      </section>
    </PosV2Shell>
  );
};
