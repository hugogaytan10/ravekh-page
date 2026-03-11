import React, { useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { AppContext } from "../../Context/AppContext";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { FeedbackModal } from "../components/FeedbackModal";
import { getCouponByBusinessAndQR, redeemCouponForUser } from "../Petitions";
import type { Coupon } from "../types";

type BarcodeDetectorResult = {
  rawValue?: string;
};

type BarcodeDetectorInstance = {
  detect: (source: ImageBitmapSource) => Promise<BarcodeDetectorResult[]>;
};

type BarcodeDetectorConstructor = new (options?: {
  formats?: string[];
}) => BarcodeDetectorInstance;

type ScannedCouponPayload = {
  Code: string;
  UserId: number;
};


type Html5QrcodeInstance = {
  start: (
    cameraConfig: { facingMode: string } | string,
    configuration: { fps?: number; qrbox?: number | { width: number; height: number } },
    onSuccess: (decodedText: string) => void,
    onError?: (errorMessage: string) => void,
  ) => Promise<void>;
  stop: () => Promise<void>;
  scanFile: (imageFile: File, showImage?: boolean) => Promise<string>;
  clear: () => Promise<void>;
};

type Html5QrcodeConstructor = new (elementId: string) => Html5QrcodeInstance;

const getBarcodeDetector = (): BarcodeDetectorConstructor | undefined => {
  return (window as Window & { BarcodeDetector?: BarcodeDetectorConstructor }).BarcodeDetector;
};

const getHtml5Qrcode = (): Html5QrcodeConstructor | undefined => {
  return (window as Window & { Html5Qrcode?: Html5QrcodeConstructor }).Html5Qrcode;
};

let html5QrScriptPromise: Promise<void> | null = null;

const loadHtml5QrScript = async (): Promise<void> => {
  if (getHtml5Qrcode()) return;

  if (!html5QrScriptPromise) {
    html5QrScriptPromise = new Promise<void>((resolve, reject) => {
      const existingScript = document.querySelector<HTMLScriptElement>(
        'script[data-ravekh-html5qr="true"]',
      );

      if (existingScript) {
        existingScript.addEventListener("load", () => resolve(), { once: true });
        existingScript.addEventListener(
          "error",
          () => reject(new Error("No se pudo cargar el escáner alternativo para iOS.")),
          { once: true },
        );
        return;
      }

      const script = document.createElement("script");
      script.src = "https://unpkg.com/html5-qrcode@2.3.8/html5-qrcode.min.js";
      script.async = true;
      script.dataset.ravekhHtml5qr = "true";
      script.onload = () => resolve();
      script.onerror = () => reject(new Error("No se pudo cargar el escáner alternativo para iOS."));
      document.body.appendChild(script);
    });
  }

  await html5QrScriptPromise;
};

const isIOSDevice = (): boolean => {
  if (typeof navigator === "undefined") return false;

  return /iPad|iPhone|iPod/.test(navigator.userAgent) ||
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
};

const isHttpLink = (value: string): boolean => {
  try {
    const parsed = new URL(value.trim());
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
};

const CouponScanScreen: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;
  const businessId = Number(context.user?.Business_Id || 0);
  const token = context.user?.Token;

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const htmlScannerRef = useRef<Html5QrcodeInstance | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const frameRef = useRef<number | null>(null);
  const lastProcessedRawRef = useRef<string>("");
  const isScannerProcessingRef = useRef(false);
  const isCouponModalVisibleRef = useRef(false);
  const isRedeemingRef = useRef(false);

  const [isReady, setIsReady] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [scanError, setScanError] = useState("");
  const [lastScannedCode, setLastScannedCode] = useState("");

  const [isScannerProcessing, setIsScannerProcessing] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [scannerPermissionGranted, setScannerPermissionGranted] = useState<boolean | null>(null);
  const [requiresManualCameraStart, setRequiresManualCameraStart] = useState(false);
  const [usingHtml5Scanner, setUsingHtml5Scanner] = useState(false);

  const [scannedCoupon, setScannedCoupon] = useState<Coupon | null>(null);
  const [scannedUserId, setScannedUserId] = useState<number | null>(null);
  const [scannedLink, setScannedLink] = useState("");
  const [isCouponModalVisible, setIsCouponModalVisible] = useState(false);
  const [isRedeeming, setIsRedeeming] = useState(false);

  const [feedbackVisible, setFeedbackVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackVisible(true);
  };

  const closeScannedCouponModal = () => {
    isCouponModalVisibleRef.current = false;
    setIsCouponModalVisible(false);
    setScannedCoupon(null);
    setScannedUserId(null);
    setScannedLink("");
    isScannerProcessingRef.current = false;
    setIsScannerProcessing(false);
  };

  const openDetectedLink = (link: string) => {
    if (!isHttpLink(link)) return;

    window.open(link, "_blank", "noopener,noreferrer");
  };

  const processScannedPayload = async (payloadRaw: string) => {
    try {
      setIsScanLoading(true);
      setScanError("");
      setLastScannedCode(payloadRaw);

      if (isHttpLink(payloadRaw)) {
        setScannedLink(payloadRaw);
        openDetectedLink(payloadRaw);
        showFeedback("Link detectado", "Se abrió el enlace del QR en una nueva pestaña.");
        return;
      }

      let parsedPayload: ScannedCouponPayload;
      try {
        parsedPayload = JSON.parse(payloadRaw) as ScannedCouponPayload;
      } catch {
        throw new Error("No es un QR válido.");
      }

      const qrCode = parsedPayload?.Code?.trim();
      const userId = Number(parsedPayload?.UserId);

      if (!qrCode || !userId) {
        throw new Error("No es un QR válido.");
      }

      if (isHttpLink(qrCode)) {
        setScannedLink(qrCode);
        openDetectedLink(qrCode);
      }

      if (!businessId) {
        throw new Error("Sesión inválida: no se encontró el negocio.");
      }

      const coupon = await getCouponByBusinessAndQR(businessId, qrCode, token);

      setScannedCoupon(coupon);
      setScannedUserId(userId);
      isCouponModalVisibleRef.current = true;
      setIsCouponModalVisible(true);
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo procesar el QR.";
      setScanError(message);
      showFeedback("Error", message);
    } finally {
      setIsScanLoading(false);
    }
  };

  const handleReadScannedQr = async (value: string) => {
    const normalized = value.trim();

    if (
      !normalized ||
      isScannerProcessingRef.current ||
      isCouponModalVisibleRef.current ||
      isRedeemingRef.current
    ) {
      return;
    }

    if (lastProcessedRawRef.current === normalized) {
      return;
    }

    lastProcessedRawRef.current = normalized;
    isScannerProcessingRef.current = true;
    setIsScannerProcessing(true);
    await processScannedPayload(normalized);

    if (!isCouponModalVisible) {
      setTimeout(() => {
        isScannerProcessingRef.current = false;
        setIsScannerProcessing(false);
      }, 1200);
    }
  };

  const handleRedeemScannedCoupon = async () => {
    if (!scannedCoupon?.Id || !scannedUserId) {
      showFeedback("Error", "Información insuficiente para canjear.");
      return;
    }

    try {
      isRedeemingRef.current = true;
      setIsRedeeming(true);
      await redeemCouponForUser(scannedCoupon.Id, scannedUserId, token);
      closeScannedCouponModal();
      showFeedback("Éxito", "Cupón canjeado correctamente.");
    } catch (error) {
      showFeedback(
        "Error",
        error instanceof Error ? error.message : "No se pudo canjear el cupón seleccionado.",
      );
    } finally {
      isRedeemingRef.current = false;
      setIsRedeeming(false);
    }
  };


  useEffect(() => {
    isScannerProcessingRef.current = isScannerProcessing;
  }, [isScannerProcessing]);

  useEffect(() => {
    isCouponModalVisibleRef.current = isCouponModalVisible;
  }, [isCouponModalVisible]);

  useEffect(() => {
    isRedeemingRef.current = isRedeeming;
  }, [isRedeeming]);

  useEffect(() => {
    let cancelled = false;

    const stopScanner = () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
        frameRef.current = null;
      }

      if (streamRef.current) {
        streamRef.current.getTracks().forEach((track) => track.stop());
        streamRef.current = null;
      }

      if (videoRef.current) {
        videoRef.current.srcObject = null;
      }

      if (htmlScannerRef.current) {
        htmlScannerRef.current.stop().catch(() => undefined);
        htmlScannerRef.current.clear().catch(() => undefined);
        htmlScannerRef.current = null;
      }
    };

    const getCameraStream = async (): Promise<MediaStream> => {
      const prefersIOS = isIOSDevice();
      const attempts: MediaStreamConstraints[] = prefersIOS
        ? [
            { video: { facingMode: "environment" }, audio: false },
            { video: true, audio: false },
          ]
        : [
            { video: { facingMode: { ideal: "environment" } }, audio: false },
            { video: true, audio: false },
          ];

      let latestError: unknown;

      for (const constraints of attempts) {
        try {
          return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (error) {
          latestError = error;
        }
      }

      throw latestError;
    };

    const attachAndPlayVideo = async (stream: MediaStream) => {
      const video = videoRef.current;
      if (!video) {
        setCameraError("No se encontró el visor de cámara.");
        return;
      }

      video.srcObject = stream;
      video.playsInline = true;
      video.muted = true;
      video.setAttribute("playsinline", "true");
      video.setAttribute("webkit-playsinline", "true");

      try {
        await video.play();
        setRequiresManualCameraStart(false);
      } catch {
        setRequiresManualCameraStart(true);
      }
    };

    const waitForHtml5ReaderContainer = async (): Promise<boolean> => {
      for (let tries = 0; tries < 10; tries += 1) {
        await new Promise<void>((resolve) => requestAnimationFrame(() => resolve()));
        if (document.getElementById("coupon-scan-html5-reader")) {
          return true;
        }
      }

      return false;
    };

    const startCameraPreviewOnly = async () => {
      const stream = await getCameraStream();

      if (cancelled) {
        stream.getTracks().forEach((track) => track.stop());
        return;
      }

      streamRef.current = stream;
      setScannerPermissionGranted(true);
      await attachAndPlayVideo(stream);
      setIsReady(true);
    };

    const startHtml5Scanner = async (): Promise<boolean> => {
      try {
        await loadHtml5QrScript();
        const Html5Qrcode = getHtml5Qrcode();

        if (!Html5Qrcode) {
          return false;
        }

        setUsingHtml5Scanner(true);
        setIsReady(false);

        const hasContainer = await waitForHtml5ReaderContainer();
        if (!hasContainer || cancelled) {
          setUsingHtml5Scanner(false);
          return false;
        }

        const scanner = new Html5Qrcode("coupon-scan-html5-reader");
        htmlScannerRef.current = scanner;

        await scanner.start(
          { facingMode: "environment" },
          { fps: 10, qrbox: { width: 220, height: 220 } },
          (decodedText) => {
            void handleReadScannedQr(decodedText);
          },
        );

        setScannerPermissionGranted(true);
        setIsReady(true);
        return true;
      } catch (error) {
        setUsingHtml5Scanner(false);
        setScanError(error instanceof Error ? error.message : "No se pudo iniciar el escáner alternativo.");
        return false;
      }
    };

    const startScanner = async () => {
      try {
        setCameraError("");
        setScanError("");

        if (typeof window === "undefined" || typeof navigator === "undefined") {
          setCameraError("Entorno no compatible para abrir la cámara.");
          setScannerPermissionGranted(false);
          return;
        }

        const isLocalhost =
          window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1";

        if (!isLocalhost && window.isSecureContext === false) {
          setCameraError("La cámara requiere HTTPS en este navegador.");
          setScannerPermissionGranted(false);
          return;
        }

        if (!navigator.mediaDevices?.getUserMedia) {
          setCameraError(
            "No fue posible iniciar la cámara en este navegador. Puedes usar la opción de escanear desde imagen.",
          );
          setScannerPermissionGranted(false);
          return;
        }

        const BarcodeDetectorApi = getBarcodeDetector();
        if (!BarcodeDetectorApi) {
          const started = await startHtml5Scanner();
          if (!started) {
            setUsingHtml5Scanner(false);
            setScanError("No se pudo iniciar escaneo automático. Puedes usar cámara o escanear desde imagen.");
            await startCameraPreviewOnly();
          }
          return;
        }

        setUsingHtml5Scanner(false);
        const stream = await getCameraStream();

        if (cancelled) {
          stream.getTracks().forEach((track) => track.stop());
          return;
        }

        streamRef.current = stream;
        setScannerPermissionGranted(true);

        await attachAndPlayVideo(stream);
        setIsReady(true);

        const detector = new BarcodeDetectorApi({ formats: ["qr_code"] });

        const scanLoop = async () => {
          if (cancelled) return;

          const currentVideo = videoRef.current;
          if (
            !currentVideo ||
            currentVideo.readyState < 2 ||
            isScannerProcessingRef.current ||
            isCouponModalVisibleRef.current ||
            isRedeemingRef.current
          ) {
            frameRef.current = requestAnimationFrame(scanLoop);
            return;
          }

          try {
            const [result] = await detector.detect(currentVideo);
            const code = result?.rawValue?.trim();
            if (code) {
              await handleReadScannedQr(code);
            }
          } catch (error) {
            setScanError(error instanceof Error ? error.message : "No se pudo analizar el código.");
          }

          frameRef.current = requestAnimationFrame(scanLoop);
        };

        frameRef.current = requestAnimationFrame(scanLoop);
      } catch (error) {
        setCameraError(
          error instanceof Error
            ? error.message
            : "No se pudo acceder a la cámara. Revisa permisos del navegador.",
        );
        setScannerPermissionGranted(false);
      }
    };

    startScanner();

    return () => {
      cancelled = true;
      stopScanner();
    };
  }, []);

  const handleManualCameraStart = async () => {
    const video = videoRef.current;
    if (!video) return;

    try {
      await video.play();
      setRequiresManualCameraStart(false);
      setCameraError("");
    } catch (error) {
      setCameraError(
        error instanceof Error
          ? error.message
          : "No se pudo iniciar la cámara. Toca nuevamente para intentarlo.",
      );
    }
  };

  const handleImageScan = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setScanError("");

      const BarcodeDetectorApi = getBarcodeDetector();
      if (!BarcodeDetectorApi) {
        await loadHtml5QrScript();
        const Html5Qrcode = getHtml5Qrcode();
        if (!Html5Qrcode) {
          setScanError("Este navegador no permite escanear QR automáticamente desde imagen.");
          return;
        }

        const imageScanner = new Html5Qrcode("coupon-scan-html5-image-reader");
        const code = (await imageScanner.scanFile(file, false)).trim();
        await imageScanner.clear();

        if (code) {
          await handleReadScannedQr(code);
        } else {
          setScanError("No se detectó un QR en la imagen seleccionada.");
        }
        return;
      }

      const detector = new BarcodeDetectorApi({ formats: ["qr_code"] });
      const imageBitmap = await createImageBitmap(file);
      const [result] = await detector.detect(imageBitmap);
      imageBitmap.close();

      const code = result?.rawValue?.trim();
      if (code) {
        await handleReadScannedQr(code);
      } else {
        setScanError("No se detectó un QR en la imagen seleccionada.");
      }
    } catch (error) {
      setScanError(error instanceof Error ? error.message : "No se pudo escanear la imagen.");
    } finally {
      event.target.value = "";
    }
  };

  const couponLabel = useMemo(() => scannedCoupon?.Description || "Sin descripción", [scannedCoupon]);

  return (
    <div className="min-h-full" style={{ backgroundColor: ThemeLight.backgrounColor }}>
      <div className="px-5 py-5 max-w-xl mx-auto">
        <header className="flex items-center gap-2 mb-5">
          <button
            type="button"
            onClick={() => navigate(-1)}
            className="rounded-full p-1 hover:bg-gray-200 transition"
            aria-label="Regresar"
          >
            <ChevronBack width={24} height={24} />
          </button>
          <h1 className="text-[18px] font-semibold text-[#565656]">Escanear QR</h1>
        </header>

        <section className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
          <p className="text-[14px] text-[#6A6A6A] mb-3">Apunta la cámara al código QR del cupón.</p>
          <div className="relative overflow-hidden rounded-xl bg-black h-[280px]">
            {usingHtml5Scanner ? (
              <div id="coupon-scan-html5-reader" className="h-full w-full" />
            ) : (
              <video ref={videoRef} className="h-full w-full object-cover" playsInline muted autoPlay />
            )}
            <div id="coupon-scan-html5-image-reader" className="hidden" />
            {!isReady && !cameraError ? (
              <div className="absolute inset-0 flex items-center justify-center text-sm text-white/80">
                Activando cámara...
              </div>
            ) : null}
            {!usingHtml5Scanner && requiresManualCameraStart && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/60 px-4 text-center">
                <button
                  type="button"
                  onClick={handleManualCameraStart}
                  className="rounded-lg bg-white px-4 py-2 text-sm font-semibold text-[#565656]"
                >
                  Iniciar cámara
                </button>
              </div>
            )}
          </div>

          {scannerPermissionGranted === false && !cameraError ? (
            <p className="text-xs text-red-500 mt-3">Permiso de cámara denegado.</p>
          ) : null}
          {cameraError ? <p className="text-xs text-red-500 mt-3">{cameraError}</p> : null}
          {scanError ? <p className="text-xs text-red-500 mt-2">{scanError}</p> : null}

          <div className="mt-4 border-t border-gray-200 pt-4">
            <p className="text-xs text-[#7A7A7A] mb-2">Si la cámara falla, escanea desde una imagen:</p>
            <label className="inline-flex items-center justify-center rounded-lg border border-gray-300 px-3 py-2 text-sm font-medium text-[#565656] cursor-pointer hover:bg-gray-50 transition">
              Seleccionar imagen QR
              <input
                type="file"
                accept="image/*"
                capture="environment"
                className="hidden"
                onChange={handleImageScan}
              />
            </label>
          </div>
        </section>

        {(isScanLoading || isScannerProcessing) && (
          <section className="rounded-xl border border-gray-200 bg-white p-4 mb-4">
            <p className="text-sm text-[#565656] font-semibold">Procesando QR...</p>
          </section>
        )}

        <section className="rounded-xl border border-gray-200 bg-white p-4">
          <h2 className="text-[15px] font-semibold text-[#565656] mb-2">Resultado</h2>
          <p className="text-sm text-[#7A7A7A] break-all">
            {lastScannedCode || "Aún no se ha detectado ningún QR."}
          </p>
        </section>
      </div>

      {isCouponModalVisible && (
        <div className="fixed inset-0 z-[9998] flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/45" onClick={closeScannedCouponModal} />
          <div className="relative z-[9999] w-full max-w-sm rounded-2xl bg-white p-5 shadow-lg">
            <h3 className="text-lg font-semibold text-[#565656]">Cupón encontrado</h3>
            <p className="mt-2 text-sm text-gray-600">{couponLabel}</p>
            <p className="mt-1 text-sm text-gray-600 break-all">QR: {scannedCoupon?.QR || "N/A"}</p>

            <div className="mt-5 flex gap-2">
              <button
                type="button"
                onClick={closeScannedCouponModal}
                className="flex-1 rounded-xl border border-gray-300 px-4 py-2 text-sm font-semibold text-[#565656]"
                disabled={isRedeeming}
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleRedeemScannedCoupon}
                className="flex-1 rounded-xl px-4 py-2 text-sm font-semibold text-white"
                style={{ backgroundColor: accentColor }}
                disabled={isRedeeming}
              >
                {isRedeeming ? "Canjeando..." : "Canjear"}
              </button>
            </div>

            {scannedLink ? (
              <button
                type="button"
                onClick={() => openDetectedLink(scannedLink)}
                className="mt-3 w-full rounded-xl border px-4 py-2 text-sm font-semibold"
                style={{ borderColor: accentColor, color: accentColor }}
              >
                Abrir link del QR
              </button>
            ) : null}
          </div>
        </div>
      )}

      <FeedbackModal
        visible={feedbackVisible}
        title={feedbackTitle}
        message={feedbackMessage}
        onClose={() => setFeedbackVisible(false)}
        accentColor={accentColor}
      />
    </div>
  );
};

export { CouponScanScreen };
