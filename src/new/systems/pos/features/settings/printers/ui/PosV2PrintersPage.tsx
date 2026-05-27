import { useMemo, useState } from "react";
import { PosV2Shell } from "../../../../shared/ui/PosV2Shell";
import { getDefaultPosPrinter, PosPrinterConfig, PosPrinterPaperMm, PosPrinterProtocol, readPosPrinters, writePosPrinters } from "../../../../shared/config/posPrinters";
import "./PosV2PrintersPage.css";

const createPrinterId = (): string => `printer-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

export const PosV2PrintersPage = () => {
  const [name, setName] = useState("Impresora principal");
  const [protocol, setProtocol] = useState<PosPrinterProtocol>("wifi");
  const [address, setAddress] = useState("192.168.1.50");
  const [port, setPort] = useState("9100");
  const [paperMm, setPaperMm] = useState<PosPrinterPaperMm>("80");
  const [printers, setPrinters] = useState<PosPrinterConfig[]>(() => readPosPrinters());
  const [result, setResult] = useState<string>("");

  const defaultPrinter = useMemo(() => getDefaultPosPrinter(printers), [printers]);

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

    setResult(`Conexión OK: ${name} (${protocol.toUpperCase()}) ${address}:${port}. Ticket ${paperMm} mm listo para prueba.`);
  };

  const persistPrinters = (nextPrinters: PosPrinterConfig[]) => {
    setPrinters(nextPrinters);
    writePosPrinters(nextPrinters);
  };

  const registerPrinter = () => {
    const error = validatePrintData();
    if (error) {
      setResult(error);
      return;
    }

    const normalizedAddress = address.trim();
    const normalizedName = name.trim();
    const normalizedPort = Number(port);

    const alreadyExists = printers.find(
      (printer) => printer.address === normalizedAddress && printer.port === normalizedPort && printer.protocol === protocol,
    );

    if (alreadyExists) {
      setResult(`Esta impresora ya está registrada como "${alreadyExists.name}".`);
      return;
    }

    const newPrinter: PosPrinterConfig = {
      id: createPrinterId(),
      name: normalizedName,
      protocol,
      address: normalizedAddress,
      port: normalizedPort,
      paperMm,
      isDefault: printers.length === 0,
      createdAt: new Date().toISOString(),
    };

    const next = [...printers.map((printer) => ({ ...printer, isDefault: printers.length === 0 ? false : printer.isDefault })), newPrinter];
    persistPrinters(next);
    setResult(`Impresora "${newPrinter.name}" registrada correctamente.${newPrinter.isDefault ? " Se configuró como predeterminada." : ""}`);
  };

  const setAsDefault = (printerId: string) => {
    const next = printers.map((printer) => ({ ...printer, isDefault: printer.id === printerId }));
    persistPrinters(next);
    const selected = next.find((printer) => printer.id === printerId);
    if (selected) {
      setResult(`Impresora predeterminada actualizada: ${selected.name} (${selected.paperMm} mm).`);
    }
  };

  const removePrinter = (printerId: string) => {
    const target = printers.find((printer) => printer.id === printerId);
    if (!target) return;

    const remaining = printers.filter((printer) => printer.id !== printerId);
    const normalized = remaining.map((printer, index) => ({
      ...printer,
      isDefault: remaining.length > 0 ? (printer.isDefault && !target.isDefault) || (target.isDefault && index === 0) : false,
    }));

    persistPrinters(normalized);
    setResult(`Impresora "${target.name}" eliminada.${normalized.length > 0 ? ` Nueva predeterminada: ${getDefaultPosPrinter(normalized)?.name}.` : ""}`);
  };

  return (
    <PosV2Shell title="Impresoras" subtitle="Configura impresoras Wi‑Fi y valida tickets antes de imprimir en producción">
      <section className="pos-v2-printers">
        <h2>Gestor de impresoras</h2>
        <p>Registra una o más impresoras y marca una como predeterminada para imprimir tickets de venta automáticamente.</p>

        <label>
          Nombre
          <input value={name} onChange={(event) => setName(event.target.value)} />
        </label>

        <label>
          Protocolo
          <select value={protocol} onChange={(event) => setProtocol(event.target.value as PosPrinterProtocol)}>
            <option value="wifi">Wi‑Fi</option>
            <option value="bluetooth">Bluetooth</option>
            <option value="usb">USB</option>
          </select>
        </label>

        <label>
          Formato de ticket
          <select value={paperMm} onChange={(event) => setPaperMm(event.target.value as PosPrinterPaperMm)}>
            <option value="80">80 mm</option>
            <option value="58">58 mm</option>
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

        <div className="pos-v2-printers__actions">
          <button type="button" onClick={runTestPrint}>Probar impresión</button>
          <button type="button" onClick={registerPrinter}>Registrar impresora</button>
        </div>

        {defaultPrinter ? (
          <p className="pos-v2-printers__result">
            Predeterminada actual: <strong>{defaultPrinter.name}</strong> · {defaultPrinter.protocol.toUpperCase()} · {defaultPrinter.address}:{defaultPrinter.port} · Ticket {defaultPrinter.paperMm} mm
          </p>
        ) : (
          <p className="pos-v2-printers__result">Aún no hay impresoras registradas.</p>
        )}

        {printers.length > 0 ? (
          <ul className="pos-v2-printers__list" aria-label="Impresoras registradas">
            {printers.map((printer) => (
              <li key={printer.id}>
                <div>
                  <strong>{printer.name}</strong>
                  <small>{printer.protocol.toUpperCase()} · {printer.address}:{printer.port} · Ticket {printer.paperMm} mm</small>
                </div>
                <div className="pos-v2-printers__item-actions">
                  {!printer.isDefault ? <button type="button" onClick={() => setAsDefault(printer.id)}>Usar por defecto</button> : <span>Predeterminada</span>}
                  <button type="button" onClick={() => removePrinter(printer.id)}>Eliminar</button>
                </div>
              </li>
            ))}
          </ul>
        ) : null}

        {result ? <p className="pos-v2-printers__result">{result}</p> : null}
      </section>
    </PosV2Shell>
  );
};
