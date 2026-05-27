export type PosPrinterProtocol = "wifi" | "bluetooth" | "usb";
export type PosPrinterPaperMm = "58" | "80";

export type PosPrinterConfig = {
  id: string;
  name: string;
  protocol: PosPrinterProtocol;
  address: string;
  port: number;
  paperMm: PosPrinterPaperMm;
  isDefault: boolean;
  createdAt: string;
};

export const POS_PRINTERS_STORAGE_KEY = "pos-v2-printers";

const asPaperMm = (value: unknown): PosPrinterPaperMm => (value === "58" ? "58" : "80");

const isProtocol = (value: unknown): value is PosPrinterProtocol => value === "wifi" || value === "bluetooth" || value === "usb";

export const readPosPrinters = (): PosPrinterConfig[] => {
  try {
    const raw = window.localStorage.getItem(POS_PRINTERS_STORAGE_KEY);
    const parsed = raw ? JSON.parse(raw) : [];

    if (!Array.isArray(parsed)) {
      return [];
    }

    const normalized = parsed
      .map((entry): PosPrinterConfig | null => {
        if (!entry || typeof entry !== "object") return null;

        const record = entry as Record<string, unknown>;
        const id = String(record.id ?? "").trim();
        const name = String(record.name ?? "").trim();
        const address = String(record.address ?? "").trim();
        const port = Number(record.port ?? 0);
        const protocol = record.protocol;

        if (!id || !name || !address || !Number.isFinite(port) || port <= 0 || !isProtocol(protocol)) {
          return null;
        }

        return {
          id,
          name,
          protocol,
          address,
          port,
          paperMm: asPaperMm(record.paperMm),
          isDefault: Boolean(record.isDefault),
          createdAt: String(record.createdAt ?? ""),
        };
      })
      .filter((entry): entry is PosPrinterConfig => entry !== null);

    if (normalized.length === 0) {
      return [];
    }

    if (!normalized.some((printer) => printer.isDefault)) {
      return normalized.map((printer, index) => ({ ...printer, isDefault: index === 0 }));
    }

    return normalized;
  } catch {
    return [];
  }
};

export const writePosPrinters = (printers: PosPrinterConfig[]): void => {
  try {
    window.localStorage.setItem(POS_PRINTERS_STORAGE_KEY, JSON.stringify(printers));
  } catch {
    // ignore localStorage failures
  }
};

export const getDefaultPosPrinter = (printers: PosPrinterConfig[]): PosPrinterConfig | null => {
  if (printers.length === 0) return null;
  return printers.find((printer) => printer.isDefault) ?? printers[0] ?? null;
};
