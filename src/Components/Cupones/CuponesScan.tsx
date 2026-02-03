import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import cuponsito from "../../assets/Cupones/cuponsito.png";
import { CuponesNav } from "./CuponesNav";
import { Coupon, getCouponsByBusiness } from "./couponsApi";
import { getCuponesUserName, hasCuponesSession } from "./cuponesSession";

const accentYellow = "#fbbc04";
const cardRed = "#c0202b";
const mutedRose = "#f3b7b7";
const textDark = "#303030";

const BUSINESS_ID = 1;

const SUPPORTED_BARCODE_FORMATS = [
  "qr_code",
  "ean_13",
  "ean_8",
  "code_128",
  "code_39",
  "codabar",
  "upc_a",
  "upc_e",
  "itf",
];

const CuponesScan: React.FC = () => {
  const navigate = useNavigate();
  const userName = getCuponesUserName();

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const rafIdRef = useRef<number | null>(null);
  const cancelledRef = useRef(false);

  // Para evitar reiniciar cámara/escaneo por cambios de estado:
  const lastScannedValueRef = useRef<string>("");

  const [cameraError, setCameraError] = useState("");
  const [isCameraReady, setIsCameraReady] = useState(false);

  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true);
  const [couponsError, setCouponsError] = useState("");

  const [scannedValue, setScannedValue] = useState("");
  const [scanStatus, setScanStatus] = useState<
    "idle" | "scanning" | "matched" | "not-found"
  >("idle");
  const [scanError, setScanError] = useState("");

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
    }
  }, [navigate]);

  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await getCouponsByBusiness(BUSINESS_ID);
        setCoupons(response);
        setCouponsError("");
      } catch (error) {
        const message =
          error instanceof Error ? error.message : "No se pudieron cargar los cupones.";
        setCouponsError(message);
      } finally {
        setIsLoadingCoupons(false);
      }
    };

    loadCoupons();
  }, []);

  useEffect(() => {
    cancelledRef.current = false;

    const stopEverything = () => {
      cancelledRef.current = true;

      if (rafIdRef.current !== null) {
        cancelAnimationFrame(rafIdRef.current);
        rafIdRef.current = null;
      }

      const video = videoRef.current;
      if (video) {
        try {
          video.pause();
        } catch {}
        // @ts-expect-error: srcObject exists in browsers
        video.srcObject = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((t) => t.stop());
        streamRef.current = null;
      }

      setIsCameraReady(false);
    };

    const startCamera = async () => {
      try {
        setCameraError("");
        setScanError("");

        // 1) Validación dura: esto evita el "Cannot read properties of undefined..."
        if (typeof window === "undefined" || typeof navigator === "undefined") {
          setCameraError("Entorno no compatible con cámara (no hay navigator).");
          return;
        }

        // 2) HTTPS / Secure Context (excepto localhost)
        // Nota: algunos browsers no exponen isSecureContext en todos los casos, pero ayuda.
        const isLocalhost =
          window.location.hostname === "localhost" ||
          window.location.hostname === "127.0.0.1";

        if (!isLocalhost && (window as any).isSecureContext === false) {
          setCameraError("La cámara requiere HTTPS (secure context).");
          return;
        }

        const mediaDevices = navigator.mediaDevices;
        const getUserMedia = mediaDevices?.getUserMedia?.bind(mediaDevices);

        if (!getUserMedia) {
          setCameraError(
            "Este dispositivo/navegador no soporta acceso a cámara (getUserMedia no disponible)."
          );
          return;
        }

        // Si ya había stream por alguna razón, lo detenemos antes de crear otro
        if (streamRef.current) {
          streamRef.current.getTracks().forEach((t) => t.stop());
          streamRef.current = null;
        }

        const stream = await getUserMedia({
          video: { facingMode: { ideal: "environment" } },
          audio: false,
        });

        if (cancelledRef.current) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }

        streamRef.current = stream;

        const video = videoRef.current;
        if (!video) {
          setCameraError("No se encontró el elemento de video.");
          return;
        }

        // @ts-expect-error: srcObject exists in browsers
        video.srcObject = stream;

        // Asegura autoplay en móviles
        video.playsInline = true;
        video.muted = true;

        await video.play();

        if (!cancelledRef.current) {
          setIsCameraReady(true);
        }
      } catch (error) {
        const message =
          error instanceof Error
            ? error.message
            : "No se pudo acceder a la cámara. Verifica permisos.";
        setCameraError(message);
        setIsCameraReady(false);
      }
    };

    const startScanning = () => {
      const BarcodeDetectorConstructor = (
        window as Window & {
          BarcodeDetector?: new (options: { formats: string[] }) => {
            detect: (video: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
          };
        }
      ).BarcodeDetector;

      if (!BarcodeDetectorConstructor) {
        setScanError("El escaneo no está disponible en este dispositivo/navegador.");
        return;
      }

      const detector = new BarcodeDetectorConstructor({
        formats: SUPPORTED_BARCODE_FORMATS,
      });

      setScanStatus("scanning");

      const scanFrame = async () => {
        if (cancelledRef.current) return;

        const video = videoRef.current;
        if (!video) {
          rafIdRef.current = requestAnimationFrame(scanFrame);
          return;
        }

        // Si aún no hay data suficiente del video, seguimos intentando sin tronar.
        if (video.readyState < 2) {
          rafIdRef.current = requestAnimationFrame(scanFrame);
          return;
        }

        try {
          const barcodes = await detector.detect(video);

          if (barcodes.length > 0) {
            const value = barcodes[0]?.rawValue?.trim() ?? "";
            if (value && value !== lastScannedValueRef.current) {
              lastScannedValueRef.current = value;
              setScannedValue(value);
            }
          }
        } catch (error) {
          const message =
            error instanceof Error ? error.message : "No se pudo analizar el video.";
          setScanError(message);
        }

        rafIdRef.current = requestAnimationFrame(scanFrame);
      };

      rafIdRef.current = requestAnimationFrame(scanFrame);
    };

    // Start
    startCamera();

    // Cuando ya esté lista la cámara, arrancas el escaneo (sin depender de scannedValue).
    // En lugar de otro useEffect, lo hacemos con un pequeño watcher local:
    const readyInterval = window.setInterval(() => {
      if (cancelledRef.current) return;
      if (videoRef.current && streamRef.current && !cameraError) {
        // Si ya está reproduciendo, listo
        if (!videoRef.current.paused && videoRef.current.readyState >= 2) {
          window.clearInterval(readyInterval);
          setIsCameraReady(true);
          startScanning();
        }
      }
    }, 120);

    return () => {
      window.clearInterval(readyInterval);
      stopEverything();
    };
    // Importante: NO metas scannedValue aquí (reiniciaba cámara/stream)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const matchedCoupon = useMemo(() => {
    if (!scannedValue) return null;

    const normalized = scannedValue.trim();
    return (
      coupons.find((coupon) => coupon.QR === normalized) ??
      coupons.find((coupon) => coupon.QR.includes(normalized))
    );
  }, [coupons, scannedValue]);

  useEffect(() => {
    if (!scannedValue) {
      setScanStatus("idle");
      return;
    }

    if (matchedCoupon) setScanStatus("matched");
    else setScanStatus("not-found");
  }, [matchedCoupon, scannedValue]);

  const formattedValidDate = matchedCoupon?.Valid
    ? new Date(matchedCoupon.Valid).toLocaleDateString("es-MX", {
        year: "numeric",
        month: "short",
        day: "numeric",
      })
    : "";

  return (
    <div className="min-h-screen bg-white relative overflow-hidden flex justify-center px-4 pb-12">
      <div className="absolute top-[-140px] right-[-160px] w-[340px] h-[340px] bg-[#ffca1f] rounded-full opacity-70" />
      <div className="absolute bottom-[-160px] left-[-180px] w-[360px] h-[360px] bg-[#ffca1f] rounded-full opacity-70" />

      <div className="relative w-full max-w-[460px] z-10">
        <header className="flex items-center gap-3 pt-8 px-1 text-[#414141]">
          <div className="h-14 w-14 rounded-full bg-[#fff2c2] border-2 border-[#ffd24c] flex items-center justify-center shadow-sm">
            <img src={cuponsito} alt="Avatar" className="h-10 w-10 object-contain" />
          </div>
          <div>
            <p className="text-sm font-semibold">Hola{userName ? ` ${userName}` : ""}</p>
            <p className="text-sm text-[#6a6a6a]">Escanear cupón</p>
          </div>
        </header>

        <main className="mt-8 space-y-5">
          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_26px_rgba(0,0,0,0.2)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-lg font-extrabold">Escaneo de QR</p>
                <p className="text-sm text-white/80">Apunta la cámara al código.</p>
              </div>
              <button
                type="button"
                className="rounded-full px-4 py-2 text-sm font-bold shadow-[0_8px_18px_rgba(0,0,0,0.18)]"
                style={{ backgroundColor: accentYellow, color: "#3e3e3e" }}
                onClick={() => navigate("/cupones/home")}
              >
                Volver
              </button>
            </div>
          </section>

          <section className="rounded-2xl bg-white px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)]">
            <p className="text-sm font-bold text-[#414141]">Vista de cámara</p>
            <div className="mt-3 rounded-2xl border-2 border-dashed border-[#cfcfcf] bg-[#f5f5f5] p-4">
              <div className="relative overflow-hidden rounded-2xl bg-black">
                <video ref={videoRef} className="h-56 w-full object-cover" playsInline muted />
                {!isCameraReady && !cameraError ? (
                  <div className="absolute inset-0 flex items-center justify-center text-xs font-semibold text-white/80">
                    Activando cámara...
                  </div>
                ) : null}
              </div>
              {cameraError ? <p className="mt-4 text-xs text-[#b91c1c]">{cameraError}</p> : null}
              {scanError ? <p className="mt-2 text-xs text-[#b91c1c]">{scanError}</p> : null}
              {!cameraError && !scanError ? (
                <p className="mt-4 text-xs text-[#6a6a6a]">
                  Asegúrate de permitir el acceso a la cámara para detectar QR o códigos de barras.
                </p>
              ) : null}
            </div>
          </section>

          <section
            className="rounded-2xl px-5 py-4 shadow-[0_10px_22px_rgba(0,0,0,0.14)]"
            style={{ backgroundColor: mutedRose, color: textDark }}
          >
            <p className="text-base font-extrabold">Datos del cupón</p>
            <div className="mt-3 space-y-2 text-sm font-semibold">
              {isLoadingCoupons ? <p>Cargando cupones...</p> : null}
              {!isLoadingCoupons && couponsError ? <p>{couponsError}</p> : null}
              {!isLoadingCoupons && !couponsError ? (
                <>
                  <p>Código detectado: {scannedValue || "Sin lectura"}</p>
                  {scanStatus === "matched" && matchedCoupon ? (
                    <>
                      <p>Descripción: {matchedCoupon.Description}</p>
                      <p>QR: {matchedCoupon.QR}</p>
                      <p>Valid: {formattedValidDate}</p>
                      <p>LimitUsers: {matchedCoupon.LimitUsers}</p>
                      <p>Estado: Disponible</p>
                    </>
                  ) : null}
                  {scanStatus === "not-found" ? <p>Estado: Código no disponible</p> : null}
                  {scanStatus === "idle" ? <p>Estado: Esperando lectura</p> : null}
                </>
              ) : null}
            </div>
          </section>

          <section
            className="rounded-2xl px-5 py-4 shadow-[0_12px_24px_rgba(0,0,0,0.16)] text-white"
            style={{ backgroundColor: cardRed }}
          >
            <p className="text-sm font-semibold text-white/80">Revisión</p>
            <p className="mt-2 text-sm">Confirma los datos del cupón antes de aceptar la redención.</p>
            <div className="mt-4 flex items-center gap-2">
              <button
                type="button"
                className="flex-1 rounded-full border border-white/70 px-3 py-2 text-xs font-bold text-white"
              >
                Rechazar
              </button>
              <button
                type="button"
                className="flex-1 rounded-full bg-white/90 px-3 py-2 text-xs font-bold text-[#3e3e3e] disabled:cursor-not-allowed disabled:opacity-60"
                onClick={() => navigate("/cupones/admin/confirmado")}
                disabled={scanStatus !== "matched"}
              >
                Aceptar
              </button>
            </div>
          </section>
        </main>

        <div className="mt-10">
          <CuponesNav active="ajustes" />
        </div>
      </div>
    </div>
  );
};

export { CuponesScan };
export default CuponesScan;
