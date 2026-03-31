import React, { useContext, useMemo, useRef } from "react";
import { QRCodeSVG } from "qrcode.react";
import { useLocation, useParams } from "react-router-dom";
import { VisitsSharedScreen } from "./VisitsSharedScreen";
import { AppContext } from "../../Context/AppContext";
import { WEB_COUPONS_DOMAIN } from "../shared/constants";

const VISITS_OFFLINE_POOL_KEY = "ravekh-visits-offline-qr-pool";
const ESC_POS_MAX_WIDTH = 576;
const WEB_BLUETOOTH_OPTIONAL_SERVICES = [
  "battery_service",
  "device_information",
  "generic_access",
  "000018f0-0000-1000-8000-00805f9b34fb",
  "0000ffe0-0000-1000-8000-00805f9b34fb",
  "49535343-fe7d-4ae5-8fa9-9fafd205e455",
];

const normalizeTokenText = (item: unknown): string => {
  if (typeof item === "string") {
    return item;
  }

  if (item && typeof item === "object") {
    const tokenValue = (item as { token?: string; qr?: string; url?: string }).token;
    if (tokenValue) {
      return tokenValue;
    }

    const qrValue = (item as { token?: string; qr?: string; url?: string }).qr;
    if (qrValue) {
      return qrValue;
    }

    const urlValue = (item as { token?: string; qr?: string; url?: string }).url;
    if (urlValue) {
      return urlValue;
    }
  }

  return "";
};

const buildVisitQrUrl = (tokenText: string): string => {
  if (!tokenText) {
    return "";
  }

  if (/^https?:\/\//i.test(tokenText)) {
    return tokenText;
  }

  const domain = WEB_COUPONS_DOMAIN && WEB_COUPONS_DOMAIN !== "https://TU_DOMINIO" ? WEB_COUPONS_DOMAIN : window.location.origin;

  return `${domain}/visit/redeem?token=${encodeURIComponent(tokenText)}`;
};

const printQrTicket = (svgMarkup: string, qrUrl: string) => {
  const printWindow = window.open("", "_blank", "width=420,height=720");

  if (!printWindow) {
    return;
  }

  printWindow.document.write(`
    <!doctype html>
    <html>
      <head>
        <title>Imprimir QR</title>
        <style>
          @page { size: 80mm auto; margin: 6mm; }
          html, body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
          .ticket {
            width: 68mm;
            margin: 0 auto;
            text-align: center;
            color: #111827;
          }
          .title { font-size: 15px; font-weight: 700; margin-bottom: 8px; }
          .qr { margin: 10px auto; }
          .url { font-size: 10px; word-break: break-all; margin-top: 8px; color: #4b5563; }
        </style>
      </head>
      <body>
        <div class="ticket">
          <div class="title">QR visita online</div>
          <div class="qr">${svgMarkup}</div>
          <div class="url">${qrUrl}</div>
        </div>
      </body>
    </html>
  `);
  printWindow.document.close();
  printWindow.focus();
  printWindow.print();
  printWindow.close();
};

const isMobileDevice = (): boolean => {
  if (typeof window === "undefined") {
    return false;
  }

  const userAgent = navigator.userAgent.toLowerCase();
  const isTouchDevice = typeof window.matchMedia === "function" && window.matchMedia("(pointer: coarse)").matches;
  const isMobileUserAgent = /android|iphone|ipad|ipod|mobile/i.test(userAgent);

  return isTouchDevice || isMobileUserAgent;
};

const postPrintRequestToReactNative = (qrUrl: string): boolean => {
  const reactNativeWebView = (window as Window & { ReactNativeWebView?: { postMessage: (message: string) => void } }).ReactNativeWebView;
  if (!reactNativeWebView?.postMessage) {
    return false;
  }

  reactNativeWebView.postMessage(JSON.stringify({
    type: "PRINT_VISIT_QR",
    payload: {
      qrUrl,
      paperWidth: 80,
    },
  }));

  return true;
};

const getBluetoothSupportIssue = async (): Promise<string | null> => {
  if (typeof window === "undefined") {
    return "No se detectó el entorno del navegador.";
  }

  if (!window.isSecureContext) {
    return "La impresión Bluetooth requiere HTTPS (o localhost).";
  }

  if (!("bluetooth" in navigator)) {
    const userAgent = navigator.userAgent.toLowerCase();
    if (/iphone|ipad|ipod|ios/i.test(userAgent)) {
      return "iOS no permite Web Bluetooth en Chrome/Brave/Safari. Necesitas una app nativa para imprimir por Bluetooth.";
    }

    return "Este navegador no expone la API Web Bluetooth.";
  }

  if (typeof navigator.bluetooth.getAvailability === "function") {
    try {
      const isAvailable = await navigator.bluetooth.getAvailability();
      if (!isAvailable) {
        return "Bluetooth parece desactivado o no disponible. También puede ocurrir si la impresora usa Bluetooth clásico (SPP) y no BLE.";
      }
    } catch {
      return null;
    }
  }

  return null;
};

const svgToCanvas = async (svgMarkup: string): Promise<HTMLCanvasElement> => {
  const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
  const url = URL.createObjectURL(blob);

  try {
    const image = await new Promise<HTMLImageElement>((resolve, reject) => {
      const loadedImage = new Image();
      loadedImage.onload = () => resolve(loadedImage);
      loadedImage.onerror = () => reject(new Error("No se pudo convertir el QR para impresión Bluetooth."));
      loadedImage.src = url;
    });

    const sourceWidth = image.width || 170;
    const sourceHeight = image.height || 170;
    const scale = Math.min(1, ESC_POS_MAX_WIDTH / sourceWidth);
    const width = Math.max(1, Math.floor(sourceWidth * scale));
    const height = Math.max(1, Math.floor(sourceHeight * scale));

    const canvas = document.createElement("canvas");
    canvas.width = width;
    canvas.height = height;
    const context = canvas.getContext("2d");
    if (!context) {
      throw new Error("No se pudo preparar el lienzo de impresión.");
    }

    context.fillStyle = "#FFFFFF";
    context.fillRect(0, 0, width, height);
    context.drawImage(image, 0, 0, width, height);

    return canvas;
  } finally {
    URL.revokeObjectURL(url);
  }
};

const canvasToEscPosRaster = (canvas: HTMLCanvasElement): Uint8Array => {
  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("No se pudo obtener la imagen del QR.");
  }

  const { width, height } = canvas;
  const imageData = context.getImageData(0, 0, width, height).data;
  const bytesPerRow = Math.ceil(width / 8);
  const raster = new Uint8Array(bytesPerRow * height);

  for (let y = 0; y < height; y += 1) {
    for (let x = 0; x < width; x += 1) {
      const index = (y * width + x) * 4;
      const red = imageData[index];
      const green = imageData[index + 1];
      const blue = imageData[index + 2];
      const alpha = imageData[index + 3];
      const luminance = (red + green + blue) / 3;
      const shouldPrint = alpha > 0 && luminance < 180;

      if (shouldPrint) {
        const byteIndex = y * bytesPerRow + Math.floor(x / 8);
        const bitIndex = 7 - (x % 8);
        raster[byteIndex] |= 1 << bitIndex;
      }
    }
  }

  return raster;
};

const buildEscPosQrTicket = async (svgMarkup: string, qrUrl: string): Promise<Uint8Array> => {
  const canvas = await svgToCanvas(svgMarkup);
  const widthBytes = Math.ceil(canvas.width / 8);
  const raster = canvasToEscPosRaster(canvas);
  const textEncoder = new TextEncoder();
  const title = textEncoder.encode("QR visita online\n\n");
  const urlText = textEncoder.encode(`\n${qrUrl}\n\n\n`);

  const imageHeader = new Uint8Array([
    0x1d,
    0x76,
    0x30,
    0x00,
    widthBytes & 0xff,
    (widthBytes >> 8) & 0xff,
    canvas.height & 0xff,
    (canvas.height >> 8) & 0xff,
  ]);

  const initAndCenter = new Uint8Array([0x1b, 0x40, 0x1b, 0x61, 0x01]);
  const leftAlign = new Uint8Array([0x1b, 0x61, 0x00]);
  const cutFeed = new Uint8Array([0x1b, 0x64, 0x03]);
  const totalLength = initAndCenter.length + title.length + imageHeader.length + raster.length + leftAlign.length + urlText.length + cutFeed.length;
  const payload = new Uint8Array(totalLength);

  let offset = 0;
  payload.set(initAndCenter, offset);
  offset += initAndCenter.length;
  payload.set(title, offset);
  offset += title.length;
  payload.set(imageHeader, offset);
  offset += imageHeader.length;
  payload.set(raster, offset);
  offset += raster.length;
  payload.set(leftAlign, offset);
  offset += leftAlign.length;
  payload.set(urlText, offset);
  offset += urlText.length;
  payload.set(cutFeed, offset);

  return payload;
};

const getWritableCharacteristic = async (server: BluetoothRemoteGATTServer): Promise<BluetoothRemoteGATTCharacteristic> => {
  const services = await server.getPrimaryServices();

  for (const service of services) {
    const characteristics = await service.getCharacteristics();
    const writable = characteristics.find((characteristic) => characteristic.properties.write || characteristic.properties.writeWithoutResponse);
    if (writable) {
      return writable;
    }
  }

  throw new Error("No se encontró una característica Bluetooth compatible para imprimir.");
};

const sendInChunks = async (characteristic: BluetoothRemoteGATTCharacteristic, data: Uint8Array, chunkSize = 180): Promise<void> => {
  for (let offset = 0; offset < data.length; offset += chunkSize) {
    const chunk = data.slice(offset, offset + chunkSize);

    if (characteristic.properties.writeWithoutResponse && !characteristic.properties.write) {
      await characteristic.writeValueWithoutResponse(chunk);
    } else {
      await characteristic.writeValueWithResponse(chunk);
    }
  }
};

const printQrViaBluetooth = async (svgMarkup: string, qrUrl: string): Promise<void> => {
  const supportIssue = await getBluetoothSupportIssue();
  if (supportIssue) {
    throw new Error(supportIssue);
  }

  const device = await navigator.bluetooth.requestDevice({
    acceptAllDevices: true,
    optionalServices: WEB_BLUETOOTH_OPTIONAL_SERVICES,
  });

  const server = await device.gatt?.connect();
  if (!server) {
    throw new Error("No fue posible conectar con la impresora Bluetooth.");
  }

  const characteristic = await getWritableCharacteristic(server);
  const payload = await buildEscPosQrTicket(svgMarkup, qrUrl);
  await sendInChunks(characteristic, payload);
  server.disconnect();
};

export const VisitsQrActivesScreen: React.FC = () => {
  const context = useContext(AppContext);
  const { mode } = useParams<{ mode: string }>();
  const location = useLocation();
  const businessId = Number(context.user?.Business_Id || 0);
  const accentColor = context.store?.Color ?? "#2934D0";
  const qrWrapperRefs = useRef<Record<string, HTMLDivElement | null>>({});

  const stateTokens = (location.state as { tokens?: unknown[] } | null)?.tokens ?? [];

  const offlineTokens = useMemo(() => {
    if (mode !== "offline" || !businessId) {
      return [];
    }

    const raw = localStorage.getItem(VISITS_OFFLINE_POOL_KEY);
    if (!raw) {
      return [];
    }

    try {
      const parsed = JSON.parse(raw) as Record<string, unknown[]>;
      return Array.isArray(parsed?.[String(businessId)]) ? parsed[String(businessId)] : [];
    } catch {
      return [];
    }
  }, [businessId, mode]);

  const tokensToRender = mode === "offline" ? (stateTokens.length ? stateTokens : offlineTokens) : stateTokens;
  const isOnlineMode = mode === "online";
  const screenTitle = isOnlineMode ? "QRs online activos" : "QRs offline activos";
  const screenSubtitle = isOnlineMode
    ? "Consulta e imprime el código QR para canjes en línea."
    : "Consulta e imprime los códigos QR disponibles para operar sin internet.";

  const handlePrintQr = async (key: string, qrUrl: string) => {
    const svgMarkup = qrWrapperRefs.current[key]?.querySelector("svg")?.outerHTML;

    if (!svgMarkup || !qrUrl) {
      return;
    }

    if (isMobileDevice()) {
      if (postPrintRequestToReactNative(qrUrl)) {
        return;
      }

      try {
        await printQrViaBluetooth(svgMarkup, qrUrl);
        return;
      } catch (error) {
        const message = error instanceof Error ? error.message : "No se pudo imprimir por Bluetooth.";
        window.alert(`${message}\n\nSe abrirá la impresión estándar para guardar/imprimir por el método del teléfono.`);
      }
    }

    printQrTicket(svgMarkup, qrUrl);
  };

  return (
    <VisitsSharedScreen
      title={screenTitle}
      subtitle={screenSubtitle}
    >
      <p className="mb-3 text-sm text-[#565656]">
        Mostrando códigos activos en modo <strong>{mode ?? "offline"}</strong>.
      </p>
      {tokensToRender.length === 0 ? (
        <p className="text-sm text-[#7A7A7A]">No hay códigos QR disponibles todavía.</p>
      ) : (
        <ul className="space-y-3">
          {tokensToRender.map((item, index) => {
            const normalizedToken = normalizeTokenText(item);
            const qrUrl = buildVisitQrUrl(normalizedToken);
            const qrKey = `${normalizedToken}-${index}`;

            return (
              <li key={qrKey} className="rounded-xl border border-gray-200 bg-gray-50 p-3">
                {normalizedToken ? (
                  <div className="flex flex-col items-center gap-3">
                    <div ref={(element) => {
                      qrWrapperRefs.current[qrKey] = element;
                    }}>
                      <QRCodeSVG value={qrUrl} size={170} level="M" />
                    </div>
                    <p className="break-all text-center text-xs font-semibold text-[#565656]">{qrUrl}</p>
                    {isOnlineMode && (
                      <button
                        type="button"
                        className="rounded-xl px-4 py-2 text-xs font-semibold text-white"
                        style={{ backgroundColor: accentColor }}
                        onClick={() => handlePrintQr(qrKey, qrUrl)}
                      >
                        Imprimir QR (80 mm)
                      </button>
                    )}
                  </div>
                ) : (
                  <p className="break-all text-xs font-semibold text-[#565656]">QR generado</p>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </VisitsSharedScreen>
  );
};
