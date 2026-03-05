import React, { useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { BrowserQRCodeReader, type IScannerControls } from "@zxing/browser";

import { AppContext } from "../../Context/AppContext";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { ThemeLight } from "../../PuntoVenta/Theme/Theme";
import { FeedbackModal } from "../components/FeedbackModal";
import { Coupon } from "../types";
import { getCouponByBusinessAndQR, redeemCouponForUser } from "../Petitions";
import { hasCuponesSession } from "../../../../coupons/services/session";
import {Trash} from "../../../../assets/POS/trash";
type ScannedCouponPayload = {
  Code: string;
  UserId: number;
};



const ModalShell: React.FC<{
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
}> = ({ open, onClose, children }) => {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[9998]">
      <div className="absolute inset-0 bg-black/55" onClick={onClose} />
      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 z-[9999] mx-auto w-full max-w-[520px] px-4">
        {children}
      </div>
    </div>
  );
};

export const CouponScanScreen: React.FC = () => {
  const navigate = useNavigate();
  const context = useContext(AppContext);

  const accentColor = context.store?.Color ?? ThemeLight.btnBackground;
  const token = context.user?.Token;
  const businessId = useMemo(() => Number(context.user?.Business_Id || 0), [context.user?.Business_Id]);

  const videoRef = useRef<HTMLVideoElement | null>(null);
  const readerRef = useRef<BrowserQRCodeReader | null>(null);
  const controlsRef = useRef<IScannerControls | null>(null);

  const [isCheckingScannerPermission, setIsCheckingScannerPermission] = useState(false);
  const [scannerPermissionGranted, setScannerPermissionGranted] = useState<boolean | null>(null);

  const [isScannerProcessing, setIsScannerProcessing] = useState(false);
  const [isScanLoading, setIsScanLoading] = useState(false);
  const [scannerSessionKey, setScannerSessionKey] = useState(0);

  const [scannedCoupon, setScannedCoupon] = useState<Coupon | null>(null);
  const [scannedUserId, setScannedUserId] = useState<number | null>(null);
  const [isRedeeming, setIsRedeeming] = useState(false);
  const [isScannedCouponModalVisible, setIsScannedCouponModalVisible] = useState(false);

  const [feedbackModalVisible, setFeedbackModalVisible] = useState(false);
  const [feedbackTitle, setFeedbackTitle] = useState("");
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const showFeedback = (title: string, message: string) => {
    setFeedbackTitle(title);
    setFeedbackMessage(message);
    setFeedbackModalVisible(true);
  };

  const stopScanner = useCallback(() => {
    try {
      controlsRef.current?.stop();
    } catch {
      // ignore
    } finally {
      controlsRef.current = null;
      readerRef.current = null;
    }
  }, []);

  const handleCloseScannedCouponModal = useCallback(() => {
    setIsScannedCouponModalVisible(false);
    setScannedCoupon(null);
    setScannedUserId(null);
    setIsScannerProcessing(false);
    setIsScanLoading(false);
    setScannerSessionKey((k) => k + 1); // reanudar scanner
  }, []);

  const processScannedPayload = useCallback(
    async (payloadRaw: string) => {
      try {
        setIsScanLoading(true);

        let parsedPayload: ScannedCouponPayload;
        try {
          parsedPayload = JSON.parse(payloadRaw) as ScannedCouponPayload;
        } catch {
          throw new Error("No es QR válido.");
        }

        const qrCode = parsedPayload?.Code;
        const userId = Number(parsedPayload?.UserId);

        if (!qrCode || !Number.isFinite(userId) || userId <= 0) {
          throw new Error("No es QR válido.");
        }

        if (!businessId) {
          throw new Error("Business inválido.");
        }

        const coupon = await getCouponByBusinessAndQR(businessId, qrCode, token);

        setScannedCoupon(coupon);
        setScannedUserId(userId);
        setIsScannedCouponModalVisible(true);
      } catch (error: any) {
        showFeedback("Error", error?.message || "No se pudo obtener el cupón.");
        setIsScannerProcessing(false);
      } finally {
        setIsScanLoading(false);
      }
    },
    [businessId, token],
  );

  const handleReadScannedQr = useCallback(
    async (value: string) => {
      if (isScannerProcessing || isScannedCouponModalVisible) return;

      setIsScannerProcessing(true);
      stopScanner(); // evita múltiples lecturas seguidas
      await processScannedPayload(value);
    },
    [isScannerProcessing, isScannedCouponModalVisible, processScannedPayload, stopScanner],
  );

  const requestAndValidateCameraPermission = useCallback(async () => {
    setIsCheckingScannerPermission(true);

    try {
      if (!navigator.mediaDevices?.getUserMedia) {
        setScannerPermissionGranted(false);
        showFeedback("No compatible", "Tu navegador no soporta cámara. Usa Chrome/Edge o Safari reciente.");
        return;
      }

      // Nota: cámara solo funciona en HTTPS o localhost
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: { ideal: "environment" } },
        audio: false,
      });

      // cerrar stream (solo era para validar permiso)
      stream.getTracks().forEach((t) => t.stop());

      setScannerPermissionGranted(true);
      setIsScannerProcessing(false);
      setScannerSessionKey((k) => k + 1);
    } catch (err: any) {
      setScannerPermissionGranted(false);
      const msg =
        err?.name === "NotAllowedError"
          ? "Debes otorgar permiso de cámara para escanear cupones."
          : "No se pudo validar el permiso de cámara.";
      showFeedback("Permiso requerido", msg);
    } finally {
      setIsCheckingScannerPermission(false);
    }
  }, []);

  const startScanner = useCallback(async () => {
    if (!scannerPermissionGranted) return;
    if (!videoRef.current) return;
    if (isScannerProcessing || isScannedCouponModalVisible) return;

    stopScanner();

    const reader = new BrowserQRCodeReader(undefined, {
      delayBetweenScanAttempts: 200,
      delayBetweenScanSuccess: 800,
    });

    readerRef.current = reader;

    // elegir cámara “trasera” si existe
    const devices = await BrowserQRCodeReader.listVideoInputDevices().catch(() => []);
    const preferred =
      devices.find((d) => /back|rear|environment/i.test(d.label))?.deviceId ||
      devices[0]?.deviceId ||
      undefined;

    controlsRef.current = await reader.decodeFromVideoDevice(
      preferred,
      videoRef.current,
      (result, error) => {
        if (result?.getText) {
          void handleReadScannedQr(result.getText());
          return;
        }
        // errores típicos de “no encontrado” se ignoran
        void error;
      },
    );
  }, [scannerPermissionGranted, isScannerProcessing, isScannedCouponModalVisible, handleReadScannedQr, stopScanner]);

  const handleRedeemScannedCoupon = useCallback(async () => {
    if (!scannedCoupon?.Id || !scannedUserId) {
      showFeedback("Error", "Información insuficiente para canjear.");
      return;
    }

    try {
      setIsRedeeming(true);
      await redeemCouponForUser(scannedCoupon.Id, scannedUserId, token);
      handleCloseScannedCouponModal();
      showFeedback("Éxito", "Cupón canjeado correctamente.");
    } catch (error: any) {
      showFeedback("Error", error?.message || "No se pudo canjear el cupón seleccionado.");
    } finally {
      setIsRedeeming(false);
    }
  }, [scannedCoupon?.Id, scannedUserId, token, handleCloseScannedCouponModal]);

  useEffect(() => {
    if (!hasCuponesSession()) {
      navigate("/cupones", { replace: true });
      return;
    }
    // intenta validar al entrar (si el navegador permite prompt al cargar)
    void requestAndValidateCameraPermission();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    // inicia scanner cuando cambie “sesión”
    void startScanner();
    return () => stopScanner();
  }, [startScanner, stopScanner, scannerSessionKey]);

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
      return;
    }
    navigate("/cupones/admin");
  };

  return (
    <div className="min-h-screen bg-[#0B1220]">
      <div className="mx-auto w-full max-w-[520px] px-4 pb-10 pt-6">
        {/* Header (estilo RN) */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleBack}
              className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10 hover:bg-white/15 transition"
              aria-label="Regresar"
            >
              {/* si tu ChevronBack no se ve blanco, reemplázalo por un svg inline */}
              <ChevronBack width={22} height={22} />
            </button>
            <h1 className="text-[18px] font-semibold text-white">Escanear QR</h1>
          </div>

          <div className="grid h-10 w-10 place-items-center rounded-2xl bg-white/10 ring-1 ring-white/10 text-white/80">
            <Trash width={22} height={22} />
          </div>
        </div>

        {/* Panel cámara */}
        <section className="mt-4 rounded-3xl bg-white/5 ring-1 ring-white/10 p-4">
          {isCheckingScannerPermission ? (
            <div className="flex items-center gap-3 py-10 text-white">
              <span className="h-5 w-5 animate-spin rounded-full border-2 border-white/30 border-t-white" />
              <span className="text-sm font-semibold">Validando permisos...</span>
            </div>
          ) : scannerPermissionGranted ? (
            <div className="relative overflow-hidden rounded-3xl ring-1 ring-white/10 bg-black">
              {/* video */}
              <video
                ref={videoRef}
                key={`scanner-video-${scannerSessionKey}`}
                className="h-[420px] w-full object-cover"
                muted
                playsInline
                autoPlay
              />

              {/* frame overlay */}
              <div className="pointer-events-none absolute inset-0 grid place-items-center">
                <div className="h-[240px] w-[240px] rounded-2xl border-2 border-red-500/80 shadow-[0_0_0_9999px_rgba(0,0,0,0.25)]" />
              </div>

              {/* status */}
              {(isScanLoading || isScannerProcessing) && (
                <div className="absolute left-4 right-4 bottom-4 rounded-2xl bg-black/55 px-4 py-3 text-white ring-1 ring-white/10">
                  <div className="flex items-center gap-3">
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    <p className="text-sm font-semibold">
                      {isScanLoading ? "Procesando QR..." : "Leyendo..."}
                    </p>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="py-10 text-center text-white">
              <p className="text-sm font-semibold">Permiso de cámara denegado</p>
              <p className="mt-2 text-xs text-white/70">
                La cámara solo funciona en <span className="font-semibold">HTTPS</span> o <span className="font-semibold">localhost</span>.
              </p>
              <button
                type="button"
                onClick={requestAndValidateCameraPermission}
                className="mt-4 w-full rounded-2xl px-4 py-3 text-sm font-semibold text-white"
                style={{ backgroundColor: accentColor }}
              >
                Reintentar permiso
              </button>
            </div>
          )}
        </section>
      </div>

      {/* Modal cupón encontrado */}
      <ModalShell open={isScannedCouponModalVisible} onClose={handleCloseScannedCouponModal}>
        <div className="rounded-3xl bg-white p-5 shadow-2xl ring-1 ring-black/5">
          <h3 className="text-[18px] font-semibold text-[#111827]">Cupón encontrado</h3>

          <div className="mt-3 space-y-2">
            <p className="text-sm text-[#111827]">
              <span className="font-semibold">Descripción:</span>{" "}
              {scannedCoupon?.Description || "Sin descripción"}
            </p>
            <p className="text-sm text-[#111827]">
              <span className="font-semibold">QR:</span> {scannedCoupon?.QR || "N/A"}
            </p>
          </div>

          <div className="mt-5 flex gap-2">
            <button
              type="button"
              onClick={handleCloseScannedCouponModal}
              disabled={isRedeeming}
              className="flex-1 rounded-2xl border border-black/10 bg-white px-4 py-3 text-sm font-semibold text-[#111827] disabled:opacity-60"
            >
              Cancelar
            </button>

            <button
              type="button"
              onClick={handleRedeemScannedCoupon}
              disabled={isRedeeming}
              className="flex-1 rounded-2xl px-4 py-3 text-sm font-semibold text-white disabled:opacity-60"
              style={{ backgroundColor: accentColor }}
            >
              {isRedeeming ? "Canjeando..." : "Canjear"}
            </button>
          </div>
        </div>
      </ModalShell>

      {/* Feedback */}
      <FeedbackModal
        visible={feedbackModalVisible}
        title={feedbackTitle}
        message={feedbackMessage}
        onClose={() => setFeedbackModalVisible(false)}
        accentColor={accentColor}
      />
    </div>
  );
};