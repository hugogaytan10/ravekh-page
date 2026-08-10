import { ChangeEvent, useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  CatalogAiApi,
  CatalogAiApiError,
  CatalogAiBatchProgress,
  CatalogAiItem,
  CatalogAiItemPatch,
  RegisteredCatalogAsset,
  SignedCatalogUpload,
  isCatalogAiSessionExpiredError,
} from "../api/CatalogAiApi";
import type { PersistedPosSession } from "../../../shared/config/posSessionRuntime";
import {
  compressProductImage,
  createProductImagePreview,
  PRODUCT_IMAGE_ACCEPTED_TYPES,
  PRODUCT_IMAGE_MAX_FILE_BYTES,
} from "../../../shared/api/productImageCompression";
import { catalogAiDebug } from "../../../shared/debug/catalogAiDebug";
import { CatalogAiSessionRefreshModal } from "./CatalogAiSessionRefreshModal";
import "./CatalogAiImportWizard.css";

const DEFAULT_CATALOG_AI_URL = "http://localhost:8095";

const normalizeCatalogAiApiUrl = (value: string): string => {
  const normalized = value
    .trim()
    .replace(/^["']+|["']+$/g, "")
    .replace(/\/+$/, "");

  if (/^https?:\/\//i.test(normalized)) {
    return normalized;
  }

  if (
    normalized.startsWith("localhost") ||
    normalized.startsWith("127.0.0.1")
  ) {
    return `http://${normalized}`;
  }

  return `https://${normalized}`;
};

const CATALOG_AI_API_URL = normalizeCatalogAiApiUrl(
  String(
    import.meta.env.VITE_CATALOG_AI_API_URL ??
      DEFAULT_CATALOG_AI_URL,
  ),
);

const MAX_FILES = 50;
const MAX_FILE_SIZE_BYTES = PRODUCT_IMAGE_MAX_FILE_BYTES;
const ALLOWED_TYPES = PRODUCT_IMAGE_ACCEPTED_TYPES;
const PHOTO_PREVIEW_CONCURRENCY = 2;
const PHOTO_UPLOAD_CONCURRENCY = 2;
const PHOTO_UPLOAD_CHUNK_SIZE = 5;

const TERMINAL_BATCH_STATUSES = new Set([
  "COMPLETED",
  "COMPLETED_WITH_ERRORS",
  "CANCELLED",
]);

const SELECTABLE_STATUSES = new Set([
  "READY",
  "REVIEW_REQUIRED",
  "DUPLICATE_EXACT",
]);

const DEFAULT_SELECTED_STATUSES = new Set([
  "READY",
  "REVIEW_REQUIRED",
]);

type WizardStep = 1 | 2 | 3 | 4 | 5;
type PriceMode = "whatsapp" | "hidden" | "show";

type SelectedPhoto = {
  id: string;
  sourceKey: string;
  file: File;
  previewUrl: string;
};

export type CatalogAiCategoryOption = {
  id: number;
  name: string;
  color: string;
  parentId: number | null;
};

type CreateCatalogAiCategoryInput = {
  name: string;
  color: string;
  parentId: number | null;
};

type DuplicateAction = "update_existing" | "create_new";
type CategoryMode = "auto" | "existing" | "new";
type IncompleteReviewDialog = "summary" | "confirm" | null;

type EditableCatalogAiItem = CatalogAiItem & {
  draftName: string;
  draftDescription: string;
  draftCategory: string;
  draftBarcode: string;
  draftColor: string;
  draftPrice: string;
  draftStock: string;
  categoryMode: CategoryMode;
  draftCategoryColor: string;
  creatingCategory: boolean;
  duplicateAction: DuplicateAction;
  dirty: boolean;
  saving: boolean;
};

type CatalogAiImportWizardProps = {
  open: boolean;
  businessId: number;
  token: string;
  categories: CatalogAiCategoryOption[];
  onCreateCategory: (input: CreateCatalogAiCategoryInput) => Promise<CatalogAiCategoryOption>;
  onAddProductColors: (productId: number, colors: string[]) => Promise<void>;
  onClose: () => void;
  onSessionRefreshed?: (token: string) => void;
  onCompleted: (result: { created: number; productIds: number[] }) => void;
};

const createClientAssetId = (file: File, index: number) =>
  `web-${Date.now()}-${index}-${file.name.replace(/[^a-z0-9._-]/gi, "-").slice(0, 48)}`;

const snapshotSelectedFile = async (file: File): Promise<File> =>
  new File([await file.arrayBuffer()], file.name, {
    type: file.type,
    lastModified: file.lastModified,
  });

const firstText = (...values: Array<string | null | undefined>): string => {
  for (const value of values) {
    const normalized = String(value ?? "").trim();
    if (normalized) return normalized;
  }
  return "";
};

const parseColors = (value: string): string[] =>
  Array.from(
    new Map(
      value
        .split(",")
        .map((color) => color.trim())
        .filter(Boolean)
        .map((color) => [color.toLowerCase(), color]),
    ).values(),
  );

const firstNumberText = (
  ...values: Array<number | string | null | undefined>
): string => {
  for (const value of values) {
    if (value === null || value === undefined || value === "") continue;
    const parsed = Number(value);
    if (Number.isFinite(parsed)) return String(parsed);
  }
  return "";
};

const toEditableItem = (item: CatalogAiItem): EditableCatalogAiItem => {
  const hasExistingProduct = Boolean(item.Duplicate_Product_Id);

  return {
    ...item,
    // Para posibles duplicados, la información ya registrada tiene prioridad.
    // Los campos vacíos se completan con la sugerencia de la IA.
    draftName: firstText(
      item.Duplicate_Product_Name,
      item.Suggested_Name,
    ),
    draftDescription: firstText(
      item.Duplicate_Product_Description,
      item.Suggested_Description,
    ),
    draftCategory: firstText(
      item.Duplicate_Subcategory_Name,
      item.Duplicate_Category_Name,
      item.Suggested_Category,
    ),
    draftBarcode: firstText(item.Duplicate_Product_Barcode),
    draftColor: firstText(
      item.Duplicate_Product_Color,
      item.Suggested_Color,
    ),
    draftPrice: firstNumberText(
      item.Duplicate_Product_Price,
      item.Suggested_Price,
    ),
    draftStock:
      firstNumberText(
        item.Duplicate_Product_Stock,
        item.Suggested_Stock,
      ) || "1",
    // En productos existentes se conserva la clasificación actual. Para productos
    // nuevos, la sugerencia de IA queda seleccionada explícitamente y puede
    // reemplazarse por una categoría existente o por una nueva categoría manual.
    categoryMode:
      item.Duplicate_Subcategory_Name || item.Duplicate_Category_Name
        ? "existing"
        : item.Suggested_Category
          ? "auto"
          : "existing",
    draftCategoryColor: "#6D01D1",
    creatingCategory: false,
    duplicateAction: hasExistingProduct
      ? "update_existing"
      : "create_new",
    // Los datos provenientes del producto existente deben guardarse en el item
    // antes de publicar o actualizar.
    dirty: hasExistingProduct,
    saving: false,
  };
};


const parseOptionalNonNegativeNumber = (value: string): number | null => {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("El precio debe ser un número igual o mayor que cero.");
  }
  return Math.round(parsed * 100) / 100;
};

const parseRequiredNonNegativeNumber = (value: string): number => {
  const trimmed = value.trim();
  if (!trimmed) {
    throw new Error("El stock es obligatorio.");
  }
  const parsed = Number(trimmed);
  if (!Number.isFinite(parsed) || parsed < 0) {
    throw new Error("El stock debe ser un número igual o mayor que cero.");
  }
  return Math.round(parsed * 100) / 100;
};

const normalizeCategoryName = (value: string): string =>
  value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLocaleLowerCase("es-MX");

const normalizeCategoryColor = (value: string): string => {
  const normalized = value.trim().toUpperCase();
  return /^#[0-9A-F]{6}$/.test(normalized) ? normalized : "#6D01D1";
};

const retryRemoteImageOnce = (
  event: React.SyntheticEvent<HTMLImageElement>,
): void => {
  const image = event.currentTarget;

  if (image.dataset.retryAttempt !== "1") {
    image.dataset.retryAttempt = "1";
    const source = image.currentSrc || image.src;
    const separator = source.includes("?") ? "&" : "?";
    image.src = `${source}${separator}ravekhRetry=${Date.now()}`;
    return;
  }

  image.style.display = "none";
};

const confidenceValue = (value: number | string | null): number => {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
};

const mapWithConcurrency = async <T, R>(
  values: T[],
  concurrency: number,
  mapper: (value: T, index: number) => Promise<R>,
): Promise<R[]> => {
  const results = new Array<R>(values.length);
  let nextIndex = 0;

  const run = async () => {
    while (nextIndex < values.length) {
      const currentIndex = nextIndex;
      nextIndex += 1;
      results[currentIndex] = await mapper(values[currentIndex] as T, currentIndex);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => run()),
  );
  return results;
};

const chunkValues = <T,>(values: T[], size: number): T[][] => {
  const safeSize = Math.max(1, Math.floor(size));
  const chunks: T[][] = [];

  for (let index = 0; index < values.length; index += safeSize) {
    chunks.push(values.slice(index, index + safeSize));
  }

  return chunks;
};

const statusLabel = (status: CatalogAiItem["Status"]): string => {
  const labels: Record<CatalogAiItem["Status"], string> = {
    SIGNED: "Firma generada",
    UPLOADED: "Imagen registrada",
    QUEUED: "En espera",
    ANALYZING: "Analizando",
    READY: "Listo para aprobar",
    PUBLISHING: "Publicando",
    PUBLISHED: "Publicado",
    REVIEW_REQUIRED: "Requiere revisión",
    DUPLICATE_EXACT: "Posible duplicado",
    REJECTED_NOT_PRODUCT: "No parece producto",
    FAILED_RETRYABLE: "Error temporal",
    FAILED_PERMANENT: "No se pudo procesar",
    DISCARDED: "Descartado",
  };
  return labels[status];
};

const FRIENDLY_ERROR_MESSAGES = {
  IMAGE_TOO_LARGE:
    "La imagen es demasiado pesada. Selecciona una imagen más ligera.",
  IMAGE_NOT_FOUND:
    "No encontramos la imagen asociada. Vuelve a subirla.",
  IMAGE_NOT_AVAILABLE:
    "La imagen ya no está disponible. Vuelve a seleccionarla.",
  IMAGE_ACCESS_DENIED:
    "No pudimos acceder a la imagen. Vuelve a subirla.",
  INVALID_IMAGE:
    "El archivo no parece ser una imagen válida o está dañado.",
  AI_COULD_NOT_READ_IMAGE:
    "La IA no pudo interpretar esta imagen. Prueba con una fotografía más clara.",
  IMAGE_SERVICE_BUSY:
    "El servicio de imágenes está ocupado. Puedes reintentar en un momento.",
  IMAGE_SERVICE_UNAVAILABLE:
    "No pudimos descargar la imagen temporalmente. Intenta de nuevo.",
  RETRIES_EXHAUSTED:
    "No pudimos procesar la imagen después de varios intentos.",
  PROCESSING_ERROR:
    "No pudimos procesar esta imagen. Puedes reintentar o seleccionar otra fotografía.",
  MIME_TYPE_NOT_ALLOWED:
    "El formato de la imagen no es compatible. Usa JPG, PNG o WEBP.",
  INVALID_CLOUDINARY_SIGNATURE:
    "No pudimos validar la carga de la imagen. Intenta subirla nuevamente.",
  CLOUDINARY_UPLOAD_TIMEOUT:
    "La subida de una imagen tardó demasiado. Revisa tu conexión e intenta nuevamente.",
  CLOUDINARY_UPLOAD_RETRIES_EXHAUSTED:
    "Una imagen no pudo subirse después de varios intentos.",
  INVALID_CLOUDINARY_RESPONSE:
    "El servicio de imágenes no confirmó correctamente una de las cargas.",
  INVALID_CLOUDINARY_URL:
    "La dirección devuelta para una imagen no es válida. Intenta subirla nuevamente.",
} as const;

const friendlyErrorByCode = (code: string): string | null =>
  (FRIENDLY_ERROR_MESSAGES as Record<string, string>)[code] ?? null;

const friendlyItemError = (item: CatalogAiItem): string | null => {
  const code = item.Error_Code?.trim() ?? "";
  if (code) {
    const friendly = friendlyErrorByCode(code);
    if (friendly) return friendly;
  }

  const raw = item.Error_Message?.trim() ?? "";
  if (!raw) return null;

  if (/IMAGE_DOWNLOAD_FAILED_404/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.IMAGE_NOT_AVAILABLE;
  }
  if (/IMAGE_DOWNLOAD_FAILED_(400|401|403)/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.IMAGE_ACCESS_DENIED;
  }
  if (/IMAGE_DOWNLOAD_FAILED_429/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.IMAGE_SERVICE_BUSY;
  }
  if (/IMAGE_DOWNLOAD_FAILED_5\d\d/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.IMAGE_SERVICE_UNAVAILABLE;
  }
  if (/IMAGE_TOO_LARGE/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.IMAGE_TOO_LARGE;
  }
  if (/INVALID_IMAGE|INPUT BUFFER|UNSUPPORTED IMAGE|UNSUPPORTED FORMAT/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.INVALID_IMAGE;
  }
  if (/OPENAI_EMPTY_STRUCTURED_OUTPUT/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.AI_COULD_NOT_READ_IMAGE;
  }

  // El usuario nunca debe ver trazas, nombres de excepciones o códigos internos.
  return "No pudimos procesar esta imagen. Puedes reintentar o seleccionar otra fotografía.";
};

const duplicateReasonLabel = (reason: string | null): string => {
  if (!reason) return "Posible coincidencia con otro producto";
  if (reason === "EXACT_FILE_HASH") return "La misma imagen ya fue importada";
  if (reason === "EXACT_EXISTING_PRODUCT_IMAGE") return "La imagen ya pertenece a un producto existente";
  if (reason === "NORMALIZED_NAME_MATCH") return "Ya existe un producto con un nombre muy parecido";
  if (reason === "MULTIPLE_PRODUCTS_IN_IMAGE") return "La fotografía parece contener varios productos";
  if (reason === "LOW_AI_CONFIDENCE") return "La IA necesita que revises este producto";
  if (reason.startsWith("PERCEPTUAL_HASH_DISTANCE_")) {
    return "La fotografía es muy parecida a la de un producto existente";
  }
  return "Posible coincidencia con otro producto";
};

const friendlyTechnicalError = (rawValue: string): string | null => {
  const raw = rawValue.trim();
  if (!raw) return null;

  for (const [code, message] of Object.entries(FRIENDLY_ERROR_MESSAGES)) {
    if (raw.toUpperCase().includes(code)) return message;
  }

  if (/FAILED TO FETCH|NETWORKERROR|ECONNRESET|ETIMEDOUT/i.test(raw)) {
    return "No pudimos conectar con el servicio de imágenes. Revisa tu conexión e inténtalo de nuevo.";
  }
  if (/MISSING REQUIRED PARAMETER.*FILE/i.test(raw)) {
    return "No se recibió correctamente la imagen. Vuelve a seleccionarla e inténtalo de nuevo.";
  }
  if (/INVALID SIGNATURE|SIGNATURE MISMATCH/i.test(raw)) {
    return "No pudimos validar la carga de la imagen. Intenta subirla nuevamente.";
  }
  if (/PAYLOAD TOO LARGE|REQUEST ENTITY TOO LARGE/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.IMAGE_TOO_LARGE;
  }
  if (/UNSUPPORTED|INVALID IMAGE|INPUT BUFFER|CORRUPT/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.INVALID_IMAGE;
  }
  if (/TOO MANY REQUESTS|RATE LIMIT|STATUS 429|HTTP 429/i.test(raw)) {
    return FRIENDLY_ERROR_MESSAGES.IMAGE_SERVICE_BUSY;
  }
  if (/HTTP 5\d\d|STATUS 5\d\d|INTERNAL SERVER ERROR/i.test(raw)) {
    return "El servicio tuvo un problema temporal. Estamos intentando continuar; vuelve a intentarlo si persiste.";
  }

  return null;
};

const errorText = (cause: unknown): string => {
  if (cause instanceof CatalogAiApiError) {
    const friendly = cause.code
      ? friendlyErrorByCode(cause.code)
      : null;
    if (friendly) return friendly;

    const mapped = friendlyTechnicalError(cause.message);
    if (mapped) return mapped;
  }

  if (cause instanceof Error && cause.message.trim()) {
    const mapped = friendlyTechnicalError(cause.message);
    if (mapped) return mapped;

    // Conserva validaciones ya redactadas para el usuario y oculta mensajes
    // técnicos desconocidos provenientes de servicios externos.
    if (/^(El|La|Los|Las|Selecciona|Escribe|Inicia|Todos|Revisa|Debes|No puedes|No pudimos)/i.test(cause.message.trim())) {
      return cause.message.trim();
    }

    return "No pudimos completar la operación. Revisa los datos e inténtalo nuevamente.";
  }

  return "Ocurrió un error al procesar el catálogo con IA.";
};

export const CatalogAiImportWizard = ({
  open,
  businessId,
  token,
  categories,
  onCreateCategory,
  onAddProductColors,
  onClose,
  onSessionRefreshed,
  onCompleted,
}: CatalogAiImportWizardProps) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<CatalogAiBatchProgress | null>(null);
  const [items, setItems] = useState<EditableCatalogAiItem[]>([]);
  const [availableCategories, setAvailableCategories] = useState<CatalogAiCategoryOption[]>(categories);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [priceMode, setPriceMode] = useState<PriceMode>("whatsapp");
  const [selectingFiles, setSelectingFiles] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(0);
  const [preparedCompleted, setPreparedCompleted] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [publishedProductIds, setPublishedProductIds] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "ready" | "review" | "duplicate" | "error">("all");
  const [currentToken, setCurrentToken] = useState(token);
  const [sessionRefreshOpen, setSessionRefreshOpen] = useState(false);
  const [sessionPaused, setSessionPaused] = useState(false);
  const [incompleteReviewDialog, setIncompleteReviewDialog] =
    useState<IncompleteReviewDialog>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pollInFlightRef = useRef(false);
  const pollFailuresRef = useRef(0);
  const lastProgressSignatureRef = useRef<string | null>(null);
  const photosRef = useRef<SelectedPhoto[]>([]);
  const flowIdRef = useRef(catalogAiDebug.createId("flow"));
  const apiRef = useRef(new CatalogAiApi(CATALOG_AI_API_URL, token));
  const sessionRefreshWaiterRef = useRef<{
    promise: Promise<string>;
    resolve: (token: string) => void;
    reject: (cause: unknown) => void;
  } | null>(null);

  const requestSessionRefresh = useCallback((): Promise<string> => {
    catalogAiDebug.warn("WIZARD", "session.refresh.requested", {
      flowId: flowIdRef.current,
      batchId,
      step,
      alreadyWaiting: Boolean(sessionRefreshWaiterRef.current),
    });
    if (sessionRefreshWaiterRef.current) {
      setSessionPaused(false);
      setSessionRefreshOpen(true);
      return sessionRefreshWaiterRef.current.promise;
    }

    let resolve!: (token: string) => void;
    let reject!: (cause: unknown) => void;
    const promise = new Promise<string>((resolvePromise, rejectPromise) => {
      resolve = resolvePromise;
      reject = rejectPromise;
    });

    sessionRefreshWaiterRef.current = { promise, resolve, reject };
    setSessionPaused(false);
    setSessionRefreshOpen(true);
    return promise;
  }, [batchId, step]);

  const runWithSessionRecovery = useCallback(
    async <T,>(operation: (client: CatalogAiApi) => Promise<T>): Promise<T> => {
      try {
        return await operation(apiRef.current);
      } catch (cause) {
        if (!isCatalogAiSessionExpiredError(cause)) throw cause;

        catalogAiDebug.warn("WIZARD", "session.expired", {
          flowId: flowIdRef.current,
          batchId,
          step,
          cause,
        });
        const refreshedToken = await requestSessionRefresh();
        const refreshedApi = new CatalogAiApi(
          CATALOG_AI_API_URL,
          refreshedToken,
        );
        apiRef.current = refreshedApi;

        try {
          const recoveredResult = await operation(refreshedApi);
          catalogAiDebug.info("WIZARD", "session.operation.recovered", {
            flowId: flowIdRef.current,
            batchId,
            step,
          });
          return recoveredResult;
        } catch (retryCause) {
          if (isCatalogAiSessionExpiredError(retryCause)) {
            throw new Error(
              "La nueva sesión no pudo validarse. Vuelve a iniciar sesión.",
            );
          }
          throw retryCause;
        }
      }
    },
    [batchId, requestSessionRefresh, step],
  );

  const handleSessionRefreshed = async (
    session: PersistedPosSession,
  ): Promise<void> => {
    const waiter = sessionRefreshWaiterRef.current;
    if (!waiter) return;

    catalogAiDebug.info("WIZARD", "session.refreshed", {
      flowId: flowIdRef.current,
      batchId,
      step,
    });
    setCurrentToken(session.token);
    apiRef.current = new CatalogAiApi(CATALOG_AI_API_URL, session.token);
    onSessionRefreshed?.(session.token);
    sessionRefreshWaiterRef.current = null;
    setSessionRefreshOpen(false);
    setSessionPaused(false);
    waiter.resolve(session.token);
  };

  const continueSessionLater = () => {
    setSessionRefreshOpen(false);
    setSessionPaused(true);
  };

  const cancelPendingSessionRefresh = (message: string) => {
    const waiter = sessionRefreshWaiterRef.current;
    sessionRefreshWaiterRef.current = null;
    setSessionRefreshOpen(false);
    setSessionPaused(false);
    waiter?.reject(new Error(message));
  };

  useEffect(() => {
    if (!token || token === currentToken) return;
    catalogAiDebug.info("WIZARD", "session.token.updated", {
      flowId: flowIdRef.current,
      batchId,
      step,
    });
    setCurrentToken(token);
    apiRef.current = new CatalogAiApi(CATALOG_AI_API_URL, token);
  }, [batchId, currentToken, step, token]);

  const reset = () => {
    catalogAiDebug.info("WIZARD", "flow.reset", {
      flowId: flowIdRef.current,
      batchId,
      step,
      photos: photos.length,
      items: items.length,
      selected: selectedIds.size,
    });
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setStep(1);
    setPhotos([]);
    setBatchId(null);
    setBatchProgress(null);
    setItems([]);
    setSelectedIds(new Set());
    setPriceMode("whatsapp");
    setSelectingFiles(false);
    setUploading(false);
    setPublishing(false);
    setUploadCompleted(0);
    setPreparedCompleted(0);
    setError(null);
    setPublishedProductIds([]);
    setStartedAt(null);
    setFinishedAt(null);
    setFilter("all");
    setSessionRefreshOpen(false);
    setSessionPaused(false);
    setIncompleteReviewDialog(null);
    pollFailuresRef.current = 0;
    lastProgressSignatureRef.current = null;
    flowIdRef.current = catalogAiDebug.createId("flow");
  };

  useEffect(() => {
    if (!open) return;
    catalogAiDebug.info("WIZARD", "opened", {
      flowId: flowIdRef.current,
      businessId,
      apiUrl: CATALOG_AI_API_URL,
      maxFiles: MAX_FILES,
      debugEnabled: catalogAiDebug.enabled(),
    });
    setError(null);
  }, [businessId, open]);

  useEffect(() => {
    if (!open) return;

    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
      catalogAiDebug.error("WINDOW", "unhandledrejection", {
        flowId: flowIdRef.current,
        batchId,
        step,
        reason: event.reason,
      });
    };
    const handleWindowError = (event: ErrorEvent) => {
      catalogAiDebug.error("WINDOW", "error", {
        flowId: flowIdRef.current,
        batchId,
        step,
        message: event.message,
        filename: event.filename,
        lineno: event.lineno,
        colno: event.colno,
        error: event.error,
      });
    };
    const handleOnline = () => {
      catalogAiDebug.info("NETWORK", "online", {
        flowId: flowIdRef.current,
        batchId,
        step,
      });
    };
    const handleOffline = () => {
      catalogAiDebug.warn("NETWORK", "offline", {
        flowId: flowIdRef.current,
        batchId,
        step,
      });
    };

    window.addEventListener("unhandledrejection", handleUnhandledRejection);
    window.addEventListener("error", handleWindowError);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("unhandledrejection", handleUnhandledRejection);
      window.removeEventListener("error", handleWindowError);
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [batchId, open, step]);

  useEffect(() => {
    if (!open) return;
    catalogAiDebug.debug("WIZARD", "step.changed", {
      flowId: flowIdRef.current,
      batchId,
      step,
      photos: photos.length,
      items: items.length,
      selected: selectedIds.size,
    });
  }, [batchId, items.length, open, photos.length, selectedIds.size, step]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  const safeClose = () => {
    catalogAiDebug.info("WIZARD", "close.requested", {
      flowId: flowIdRef.current,
      batchId,
      step,
      selectingFiles,
      uploading,
      publishing,
      sessionPaused,
    });
    if ((selectingFiles || uploading || publishing) && !sessionPaused) {
      catalogAiDebug.warn("WIZARD", "close.blocked.busy", {
        flowId: flowIdRef.current,
        batchId,
        step,
      });
      return;
    }
    if (step === 2 && !TERMINAL_BATCH_STATUSES.has(batchProgress?.status ?? "")) {
      const confirmed = window.confirm(
        "La IA sigue procesando tus fotos. Si cierras esta ventana tendrás que retomar el lote después. ¿Deseas cerrar?",
      );
      if (!confirmed) return;
    }
    cancelPendingSessionRefresh(
      "La renovación de sesión fue cancelada porque se cerró la importación.",
    );
    reset();
    onClose();
  };

  const addFiles = async (incoming: File[]): Promise<void> => {
    if (selectingFiles || uploading || incoming.length === 0) return;

    catalogAiDebug.info("WIZARD", "photos.selection.begin", {
      flowId: flowIdRef.current,
      incoming: incoming.length,
      existing: photosRef.current.length,
      maxFiles: MAX_FILES,
      files: incoming.map((file) => ({
        name: file.name,
        type: file.type,
        size: file.size,
        lastModified: file.lastModified,
      })),
    });
    setSelectingFiles(true);
    setError(null);

    const currentPhotos = photosRef.current;
    const existingKeys = new Set(
      currentPhotos.map(({ sourceKey }) => sourceKey),
    );
    const candidates: Array<{ id: string; sourceKey: string; file: File }> = [];
    const rejectedMessages: string[] = [];

    for (const file of incoming) {
      const key = `${file.name}:${file.size}:${file.lastModified}`;
      if (existingKeys.has(key)) continue;

      if (!ALLOWED_TYPES.has(file.type)) {
        rejectedMessages.push(`${file.name}: formato no permitido.`);
        continue;
      }

      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedMessages.push(`${file.name}: supera 5 MB.`);
        continue;
      }

      if (currentPhotos.length + candidates.length >= MAX_FILES) {
        rejectedMessages.push(
          `Solo puedes procesar hasta ${MAX_FILES} imágenes por lote.`,
        );
        break;
      }

      candidates.push({
        id: createClientAssetId(
          file,
          currentPhotos.length + candidates.length,
        ),
        sourceKey: key,
        file,
      });
      existingKeys.add(key);
    }

    try {
      // Inicia todas las lecturas inmediatamente. Algunos proveedores de
      // archivos móviles invalidan sus referencias temporales mientras las
      // últimas imágenes esperan turno para generar su miniatura.
      const snapshotResults = await Promise.all(
        candidates.map(async (candidate) => {
          try {
            return {
              candidate: {
                ...candidate,
                file: await snapshotSelectedFile(candidate.file),
              },
              error: null as string | null,
            };
          } catch (cause) {
            catalogAiDebug.error("WIZARD", "photo.snapshot.failed", {
              flowId: flowIdRef.current,
              file: candidate.file,
              cause,
            });
            return {
              candidate: null,
              error: `${candidate.file.name}: no se pudo conservar el archivo. Selecciónalo nuevamente.`,
            };
          }
        }),
      );
      const stableCandidates = snapshotResults
        .map((result) => result.candidate)
        .filter((candidate): candidate is (typeof candidates)[number] => Boolean(candidate));
      rejectedMessages.push(
        ...snapshotResults
          .map((result) => result.error)
          .filter((message): message is string => Boolean(message)),
      );

      const previewResults = await mapWithConcurrency(
        stableCandidates,
        PHOTO_PREVIEW_CONCURRENCY,
        async (candidate) => {
          try {
            // En móviles el File del selector puede ser temporal y dejar de ser
            // legible antes de iniciar la carga. Se conserva desde ahora la copia
            // convertida, que ya es propiedad del navegador.
            const prepared = await compressProductImage(candidate.file);
            const preview = await createProductImagePreview(prepared.file);
            return {
              photo: {
                ...candidate,
                file: prepared.file,
                previewUrl: preview.url,
              } satisfies SelectedPhoto,
              error: null as string | null,
            };
          } catch (cause) {
            catalogAiDebug.error("WIZARD", "photo.preview.failed", {
              flowId: flowIdRef.current,
              file: {
                name: candidate.file.name,
                type: candidate.file.type,
                size: candidate.file.size,
              },
              cause,
            });
            return {
              photo: null,
              error: `${candidate.file.name}: ${errorText(cause)}`,
            };
          }
        },
      );

      const accepted = previewResults
        .map((result) => result.photo)
        .filter((photo): photo is SelectedPhoto => Boolean(photo));

      rejectedMessages.push(
        ...previewResults
          .map((result) => result.error)
          .filter((message): message is string => Boolean(message)),
      );

      if (accepted.length > 0) {
        setPhotos((current) => {
          const currentKeys = new Set(
            current.map(({ sourceKey }) => sourceKey),
          );

          const uniqueAccepted = accepted.filter((photo) => {
            if (currentKeys.has(photo.sourceKey)) {
              URL.revokeObjectURL(photo.previewUrl);
              return false;
            }
            currentKeys.add(photo.sourceKey);
            return true;
          });

          return [...current, ...uniqueAccepted];
        });
      }

      if (rejectedMessages.length > 0) {
        setError(rejectedMessages.slice(0, 4).join(" "));
      }
      catalogAiDebug.info("WIZARD", "photos.selection.complete", {
        flowId: flowIdRef.current,
        candidates: candidates.length,
        accepted: accepted.length,
        rejected: rejectedMessages.length,
        rejectionMessages: rejectedMessages,
      });
    } finally {
      setSelectingFiles(false);
    }
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(event.target.files ?? []);
    event.target.value = "";
    void addFiles(files);
  };

  const removePhoto = (photoId: string) => {
    catalogAiDebug.info("WIZARD", "photo.removed", {
      flowId: flowIdRef.current,
      photoId,
      before: photosRef.current.length,
    });
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const uploadAndStart = async () => {
    const uploadFlowStartedAt = performance.now();
    catalogAiDebug.info("WIZARD", "upload.flow.begin", {
      flowId: flowIdRef.current,
      businessId,
      photoCount: photos.length,
      chunkSize: PHOTO_UPLOAD_CHUNK_SIZE,
      uploadConcurrency: PHOTO_UPLOAD_CONCURRENCY,
    });
    if (!businessId || !currentToken) {
      setError("Inicia sesión y selecciona un negocio antes de usar la IA.");
      return;
    }
    if (photos.length === 0) {
      setError("Selecciona al menos una fotografía.");
      return;
    }

    setUploading(true);
    setUploadCompleted(0);
    setPreparedCompleted(0);
    setError(null);
    setStartedAt(Date.now());

    try {
      const created = await runWithSessionRecovery((client) =>
        client.createBatch(photos.length),
      );
      const newBatchId = created.batchId;
      setBatchId(newBatchId);
      setPreparedCompleted(photos.length);
      catalogAiDebug.info("WIZARD", "batch.created", {
        flowId: flowIdRef.current,
        batchId: newBatchId,
        requestedItems: photos.length,
        serverMaxImages: created.maxImages,
        status: created.status,
      });

      // Procesar y registrar grupos pequeños evita mantener decenas de imágenes
      // convertidas en memoria y evita perder todas las cargas cuando una sola
      // petición de Cloudinary falla de forma temporal.
      const photoChunks = chunkValues(photos, PHOTO_UPLOAD_CHUNK_SIZE);
      for (let chunkIndex = 0; chunkIndex < photoChunks.length; chunkIndex += 1) {
        const photoChunk = photoChunks[chunkIndex] as SelectedPhoto[];
        const chunkStartedAt = performance.now();
        catalogAiDebug.info("WIZARD", "upload.chunk.begin", {
          flowId: flowIdRef.current,
          batchId: newBatchId,
          chunkIndex: chunkIndex + 1,
          chunkCount: photoChunks.length,
          chunkSize: photoChunk.length,
          clientAssetIds: photoChunk.map((photo) => photo.id),
        });
        const preparedChunk = photoChunk.map((photo) => ({
          ...photo,
          uploadFile: photo.file,
        }));

        const signedUploads = await runWithSessionRecovery((client) =>
          client.signUploads(
            newBatchId,
            preparedChunk.map((photo) => ({
              clientAssetId: photo.id,
              mimeType: photo.uploadFile.type,
            })),
          ),
        );
        catalogAiDebug.info("WIZARD", "uploads.signed", {
          flowId: flowIdRef.current,
          batchId: newBatchId,
          chunkIndex: chunkIndex + 1,
          requested: preparedChunk.length,
          received: signedUploads.length,
          clientAssetIds: signedUploads.map((signed) => signed.clientAssetId),
        });
        const signedByClientId = new Map<string, SignedCatalogUpload>(
          signedUploads.map((signed) => [signed.clientAssetId, signed]),
        );

        const registeredAssets = await mapWithConcurrency(
          preparedChunk,
          PHOTO_UPLOAD_CONCURRENCY,
          async (photo): Promise<RegisteredCatalogAsset> => {
            const signed = signedByClientId.get(photo.id);
            if (!signed) {
              throw new Error(`No se recibió firma para ${photo.file.name}.`);
            }

            try {
              const uploaded = await apiRef.current.uploadToCloudinary(
                photo.uploadFile,
                signed,
              );
              setUploadCompleted((current) => current + 1);
              catalogAiDebug.info("WIZARD", "photo.upload.success", {
                flowId: flowIdRef.current,
                batchId: newBatchId,
                clientAssetId: photo.id,
                publicId: uploaded.public_id,
                assetId: uploaded.asset_id,
                bytes: uploaded.bytes,
                format: uploaded.format,
                width: uploaded.width,
                height: uploaded.height,
              });

              return {
                clientAssetId: photo.id,
                assetId: uploaded.asset_id,
                publicId: uploaded.public_id,
                version: uploaded.version,
                signature: uploaded.signature,
                secureUrl: uploaded.secure_url,
                width: uploaded.width,
                height: uploaded.height,
                bytes: uploaded.bytes,
                format: uploaded.format,
                mimeType: photo.uploadFile.type,
              };
            } catch (cause) {
              catalogAiDebug.error("WIZARD", "photo.upload.failed", {
                flowId: flowIdRef.current,
                batchId: newBatchId,
                clientAssetId: photo.id,
                file: {
                  name: photo.file.name,
                  type: photo.uploadFile.type,
                  size: photo.uploadFile.size,
                },
                cause,
              });
              throw new Error(
                `${photo.file.name}: ${errorText(cause)}`,
              );
            }
          },
        );

        // Registrar cada grupo inmediatamente. Si la red falla más adelante,
        // las imágenes ya terminadas quedan asociadas correctamente al lote.
        await runWithSessionRecovery((client) =>
          client.registerAssets(newBatchId, registeredAssets),
        );
        catalogAiDebug.info("WIZARD", "upload.chunk.registered", {
          flowId: flowIdRef.current,
          batchId: newBatchId,
          chunkIndex: chunkIndex + 1,
          registered: registeredAssets.length,
          durationMs: Math.round(performance.now() - chunkStartedAt),
        });
      }

      await runWithSessionRecovery((client) => client.startBatch(newBatchId));
      catalogAiDebug.info("WIZARD", "batch.started", {
        flowId: flowIdRef.current,
        batchId: newBatchId,
        photos: photos.length,
        totalDurationMs: Math.round(performance.now() - uploadFlowStartedAt),
      });
      setStep(2);
    } catch (cause) {
      catalogAiDebug.error("WIZARD", "upload.flow.failed", {
        flowId: flowIdRef.current,
        batchId,
        photoCount: photos.length,
        preparedCompleted,
        uploadCompleted,
        durationMs: Math.round(performance.now() - uploadFlowStartedAt),
        cause,
      });
      setError(errorText(cause));
    } finally {
      catalogAiDebug.debug("WIZARD", "upload.flow.finished", {
        flowId: flowIdRef.current,
        batchId,
        durationMs: Math.round(performance.now() - uploadFlowStartedAt),
      });
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!open || step !== 2 || !batchId) return;

    let cancelled = false;

    const poll = async () => {
      if (pollInFlightRef.current || cancelled) {
        catalogAiDebug.debug("WIZARD", "poll.skipped", {
          flowId: flowIdRef.current,
          batchId,
          inFlight: pollInFlightRef.current,
          cancelled,
        });
        return;
      }

      pollInFlightRef.current = true;

      try {
        const progress = await runWithSessionRecovery((client) =>
          client.getBatch(batchId),
        );

        if (cancelled) return;

        pollFailuresRef.current = 0;
        setError(null);
        setBatchProgress(progress);

        const progressSignature = JSON.stringify({
          status: progress.status,
          total: progress.total,
          uploaded: progress.uploaded,
          processed: progress.processed,
          published: progress.published,
          duplicates: progress.duplicates,
          review: progress.review,
          failed: progress.failed,
        });
        if (lastProgressSignatureRef.current !== progressSignature) {
          lastProgressSignatureRef.current = progressSignature;
          catalogAiDebug.info("WIZARD", "batch.progress.changed", {
            flowId: flowIdRef.current,
            batchId,
            ...progress,
          });
        } else {
          catalogAiDebug.debug("WIZARD", "batch.progress.unchanged", {
            flowId: flowIdRef.current,
            batchId,
            status: progress.status,
            processed: progress.processed,
            total: progress.total,
          });
        }

        if (TERMINAL_BATCH_STATUSES.has(progress.status)) {
          const batchItems = await runWithSessionRecovery((client) =>
            client.listBatchItems(batchId),
          );

          if (cancelled) return;

          const editable = batchItems.map(toEditableItem);
          catalogAiDebug.info("WIZARD", "batch.items.loaded", {
            flowId: flowIdRef.current,
            batchId,
            totalItems: editable.length,
            statuses: editable.reduce<Record<string, number>>((summary, item) => {
              summary[item.Status] = (summary[item.Status] ?? 0) + 1;
              return summary;
            }, {}),
          });
          catalogAiDebug.table(
            "WIZARD",
            "batch.items.summary",
            editable.map((item) => ({
              id: item.Id,
              clientAssetId: item.Client_Asset_Id,
              status: item.Status,
              retryCount: item.Retry_Count,
              errorCode: item.Error_Code,
              duplicateProductId: item.Duplicate_Product_Id,
              productId: item.Product_Id,
              confidence: item.Confidence,
            })),
          );
          setItems(editable);
          setSelectedIds(
            new Set(
              editable
                .filter(
                  (item) =>
                    SELECTABLE_STATUSES.has(item.Status) &&
                    (
                      DEFAULT_SELECTED_STATUSES.has(item.Status) ||
                      Boolean(item.Duplicate_Product_Id)
                    ),
                )
                .map((item) => item.Id),
            ),
          );
          setFinishedAt(Date.now());
          setStep(3);
        }
      } catch (cause) {
        if (cancelled) return;

        const isTemporaryServerError =
          cause instanceof CatalogAiApiError &&
          [304, 408, 425, 429, 500, 502, 503, 504].includes(cause.status);

        if (isTemporaryServerError) {
          pollFailuresRef.current += 1;

          catalogAiDebug.warn("WIZARD", "poll.temporary-error", {
            flowId: flowIdRef.current,
            batchId,
            failures: pollFailuresRef.current,
            cause,
          });

          if (pollFailuresRef.current >= 5) {
            setError(
              "El análisis continúa, pero no pudimos actualizar el progreso. Estamos intentando reconectar.",
            );
          }

          return;
        }

        catalogAiDebug.error("WIZARD", "poll.failed", {
          flowId: flowIdRef.current,
          batchId,
          cause,
        });
        setError(errorText(cause));
      } finally {
        pollInFlightRef.current = false;
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), 1600);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
      catalogAiDebug.debug("WIZARD", "poll.stopped", {
        flowId: flowIdRef.current,
        batchId,
      });
    };
  }, [batchId, open, runWithSessionRecovery, step]);

  useEffect(() => {
    setAvailableCategories((current) => {
      const merged = new Map<number, CatalogAiCategoryOption>();
      for (const category of [...current, ...categories]) {
        if (!Number.isInteger(category.id) || category.id <= 0) continue;
        merged.set(category.id, {
          ...category,
          parentId: category.parentId ?? null,
          color: normalizeCategoryColor(category.color),
        });
      }
      return [...merged.values()].sort((left, right) =>
        left.name.localeCompare(right.name, "es", { sensitivity: "base" }),
      );
    });
  }, [categories]);

  const findAvailableCategory = useCallback(
    (
      name: string,
      parentId: number | null,
    ): CatalogAiCategoryOption | null => {
      const normalized = normalizeCategoryName(name);
      if (!normalized) return null;

      return (
        availableCategories.find(
          (category) =>
            (category.parentId ?? null) === parentId &&
            normalizeCategoryName(category.name) === normalized,
        ) ?? null
      );
    },
    [availableCategories],
  );

  const rootCategories = useMemo(
    () =>
      availableCategories.filter(
        (category) => category.parentId === null,
      ),
    [availableCategories],
  );

  const storeAvailableCategory = useCallback(
    (category: CatalogAiCategoryOption): CatalogAiCategoryOption => {
      const safeCategory: CatalogAiCategoryOption = {
        ...category,
        parentId: category.parentId ?? null,
        color: normalizeCategoryColor(category.color),
      };

      setAvailableCategories((current) => {
        const withoutDuplicate = current.filter(
          (row) =>
            row.id !== safeCategory.id &&
            !(
              (row.parentId ?? null) === safeCategory.parentId &&
              normalizeCategoryName(row.name) ===
                normalizeCategoryName(safeCategory.name)
            ),
        );

        return [...withoutDuplicate, safeCategory].sort((left, right) => {
          const parentDifference =
            (left.parentId ?? 0) - (right.parentId ?? 0);
          if (parentDifference !== 0) return parentDifference;
          return left.name.localeCompare(right.name, "es", {
            sensitivity: "base",
          });
        });
      });

      return safeCategory;
    },
    [],
  );

  const createOrReuseCategory = useCallback(
    async (input: CreateCatalogAiCategoryInput) => {
      const name = input.name.trim().replace(/\s+/g, " ");
      const parentId = input.parentId ?? null;
      const existing = findAvailableCategory(name, parentId);
      if (existing) return existing;

      const created = await onCreateCategory({
        name,
        parentId,
        color: normalizeCategoryColor(input.color),
      });

      if (!Number.isInteger(created.id) || created.id <= 0) {
        throw new Error("El servidor no devolvió la categoría creada.");
      }

      return storeAvailableCategory(created);
    },
    [findAvailableCategory, onCreateCategory, storeAvailableCategory],
  );

  const selectCategory = (itemId: number, value: string) => {
    setItems((current) =>
      current.map((item) => {
        if (item.Id !== itemId) return item;

        if (!value) {
          return {
            ...item,
            categoryMode: "existing",
            draftCategory: "",
            dirty: true,
          };
        }

        if (value === "__suggested__") {
          const suggestedCategory = String(
            item.Suggested_Category ?? "",
          ).trim();
          if (!suggestedCategory) return item;

          const suggestedMatch = findAvailableCategory(
            suggestedCategory,
            null,
          );

          return {
            ...item,
            categoryMode: "auto",
            draftCategory: suggestedMatch?.name ?? suggestedCategory,
            draftCategoryColor: suggestedMatch
              ? normalizeCategoryColor(suggestedMatch.color)
              : item.draftCategoryColor,
            dirty: true,
          };
        }

        if (value === "__new__") {
          const currentMatch = findAvailableCategory(
            item.draftCategory,
            null,
          );

          return {
            ...item,
            categoryMode: "new",
            draftCategory: currentMatch ? "" : item.draftCategory,
            draftCategoryColor: currentMatch
              ? normalizeCategoryColor(currentMatch.color)
              : item.draftCategoryColor,
            dirty: true,
          };
        }

        const categoryId = Number(value);
        const category = rootCategories.find(
          (row) => row.id === categoryId,
        );
        if (!category) return item;

        return {
          ...item,
          categoryMode: "existing",
          draftCategory: category.name,
          draftCategoryColor: normalizeCategoryColor(category.color),
          dirty: true,
        };
      }),
    );
  };

  const createCategoryForItem = async (
    itemId: number,
  ): Promise<CatalogAiCategoryOption | null> => {
    const item = items.find((row) => row.Id === itemId);
    if (!item) return null;

    const name = item.draftCategory.trim().replace(/\s+/g, " ");
    if (name.length < 2) {
      setError("Escribe un nombre válido para la nueva categoría.");
      return null;
    }

    setItems((current) =>
      current.map((row) =>
        row.Id === itemId ? { ...row, creatingCategory: true } : row,
      ),
    );
    setError(null);

    try {
      const created = await createOrReuseCategory({
        name,
        color: item.draftCategoryColor,
        parentId: null,
      });

      setItems((current) =>
        current.map((row) =>
          row.Id === itemId
            ? {
                ...row,
                categoryMode: "existing",
                draftCategory: created.name,
                draftCategoryColor: created.color,
                creatingCategory: false,
                dirty: true,
              }
            : row,
        ),
      );

      return created;
    } catch (cause) {
      setItems((current) =>
        current.map((row) =>
          row.Id === itemId
            ? { ...row, creatingCategory: false }
            : row,
        ),
      );
      setError(errorText(cause));
      return null;
    }
  };

  const updateDraft = (
    itemId: number,
    field:
      | "draftName"
      | "draftDescription"
      | "draftCategory"
      | "draftBarcode"
      | "draftColor"
      | "draftPrice"
      | "draftStock",
    value: string,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.Id === itemId ? { ...item, [field]: value, dirty: true } : item,
      ),
    );
  };

  const saveItem = async (itemId: number): Promise<boolean> => {
    if (!batchId) return false;
    const saveStartedAt = performance.now();
    const item = items.find((row) => row.Id === itemId);
    if (!item || !item.dirty) return true;

    if (!item.draftName.trim()) {
      setError("Todos los productos aprobados necesitan un nombre.");
      return false;
    }

    let categoryName = item.draftCategory.trim() || null;

    try {
      if (categoryName) {
        let category = findAvailableCategory(categoryName, null);
        if (!category) {
          category = await createOrReuseCategory({
            name: categoryName,
            color: item.draftCategoryColor,
            parentId: null,
          });
        }
        categoryName = category.name;
      }
    } catch (cause) {
      setError(errorText(cause));
      return false;
    }

    let parsedPrice: number | null;
    let parsedStock: number;
    try {
      parsedPrice = parseOptionalNonNegativeNumber(item.draftPrice);
      parsedStock = parseRequiredNonNegativeNumber(item.draftStock);
    } catch (cause) {
      setError(errorText(cause));
      return false;
    }

    setItems((current) =>
      current.map((row) =>
        row.Id === itemId ? { ...row, saving: true } : row,
      ),
    );

    const patch: CatalogAiItemPatch = {
      name: item.draftName.trim(),
      description: item.draftDescription.trim() || null,
      category: categoryName,
      // Se conserva null por compatibilidad con el contrato del API.
      // El catálogo utiliza una sola categoría específica por producto.
      subcategory: null,
      barcode: item.draftBarcode.trim() || null,
      color: parseColors(item.draftColor)[0] ?? null,
      price: parsedPrice,
      stock: parsedStock,
    };

    try {
      catalogAiDebug.info("WIZARD", "item.save.begin", {
        flowId: flowIdRef.current,
        batchId,
        itemId,
        patch,
      });
      await runWithSessionRecovery((client) =>
        client.updateItem(batchId, itemId, patch),
      );
      catalogAiDebug.info("WIZARD", "item.save.success", {
        flowId: flowIdRef.current,
        batchId,
        itemId,
        durationMs: Math.round(performance.now() - saveStartedAt),
      });

      setItems((current) =>
        current.map((row) =>
          row.Id === itemId
            ? {
                ...row,
                Suggested_Name: patch.name ?? row.Suggested_Name,
                Suggested_Description: patch.description ?? null,
                Suggested_Category: patch.category ?? null,
                Suggested_Subcategory: null,
                Suggested_Barcode: patch.barcode ?? null,
                Suggested_Color: patch.color ?? null,
                Suggested_Price: patch.price ?? null,
                Suggested_Stock: patch.stock ?? 1,
                draftCategory: patch.category ?? "",
                categoryMode: patch.category ? "existing" : row.categoryMode,
                dirty: false,
                saving: false,
              }
            : row,
        ),
      );
      return true;
    } catch (cause) {
      catalogAiDebug.error("WIZARD", "item.save.failed", {
        flowId: flowIdRef.current,
        batchId,
        itemId,
        durationMs: Math.round(performance.now() - saveStartedAt),
        cause,
      });
      setItems((current) =>
        current.map((row) =>
          row.Id === itemId ? { ...row, saving: false } : row,
        ),
      );
      setError(errorText(cause));
      return false;
    }
  };

  const saveSelectedDirtyItems = async () => {
    const dirtyIds = items
      .filter((item) => item.dirty && selectedIds.has(item.Id))
      .map((item) => item.Id);

    for (const itemId of dirtyIds) {
      const saved = await saveItem(itemId);
      if (!saved) {
        throw new Error("Revisa los datos de precio, stock y nombre antes de continuar.");
      }
    }
  };

  const proceedToPricing = async () => {
    setError(null);

    try {
      await saveSelectedDirtyItems();
      setStep(4);
    } catch (cause) {
      setError(errorText(cause));
    }
  };

  const continueToPricing = async () => {
    if (selectedIds.size === 0) {
      setError("Selecciona al menos un producto para continuar.");
      return;
    }

    const invalidSelected = items.some(
      (item) => selectedIds.has(item.Id) && !item.draftName.trim(),
    );

    if (invalidSelected) {
      setError("Los productos seleccionados necesitan un nombre.");
      return;
    }

    const remainingReviewableItems = items.filter(
      (item) =>
        SELECTABLE_STATUSES.has(item.Status) &&
        !selectedIds.has(item.Id),
    );

    if (remainingReviewableItems.length > 0) {
      setError(null);
      setIncompleteReviewDialog("summary");
      return;
    }

    await proceedToPricing();
  };

  const reviewRemainingProducts = () => {
    const firstPendingItem = items.find(
      (item) =>
        SELECTABLE_STATUSES.has(item.Status) &&
        !selectedIds.has(item.Id),
    );

    setIncompleteReviewDialog(null);
    setFilter("all");
    setError(null);

    if (!firstPendingItem) return;

    window.requestAnimationFrame(() => {
      window.setTimeout(() => {
        document
          .getElementById(`catalog-ai-review-item-${firstPendingItem.Id}`)
          ?.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
      }, 0);
    });
  };

  const confirmContinueWithoutReview = async () => {
    setIncompleteReviewDialog(null);
    await proceedToPricing();
  };

  const publishApproved = async () => {
    if (!batchId || selectedIds.size === 0) return;
    const publishStartedAt = performance.now();
    catalogAiDebug.info("WIZARD", "publish.begin", {
      flowId: flowIdRef.current,
      batchId,
      selected: selectedIds.size,
      priceMode,
      itemIds: [...selectedIds],
    });
    setPublishing(true);
    setError(null);

    try {
      await saveSelectedDirtyItems();
      const selectedItems = items.filter((item) => selectedIds.has(item.Id));
      // Publicar en serie evita que dos productos intenten crear al mismo tiempo
      // la misma categoría sugerida en el servicio de IA.
      const productIds = await mapWithConcurrency(selectedItems, 1, (item) =>
        runWithSessionRecovery((client) =>
          client.publishItem(batchId, item, {
            showPrice: priceMode === "show",
            duplicateAction: item.duplicateAction,
          }),
        ),
      );
      await Promise.all(
        productIds.map((productId, index) =>
          onAddProductColors(productId, parseColors(selectedItems[index].draftColor)),
        ),
      );
      setPublishedProductIds(productIds);
      setFinishedAt(Date.now());
      catalogAiDebug.info("WIZARD", "publish.success", {
        flowId: flowIdRef.current,
        batchId,
        productIds,
        durationMs: Math.round(performance.now() - publishStartedAt),
      });
      setStep(5);
    } catch (cause) {
      catalogAiDebug.error("WIZARD", "publish.failed", {
        flowId: flowIdRef.current,
        batchId,
        selected: selectedIds.size,
        durationMs: Math.round(performance.now() - publishStartedAt),
        cause,
      });
      setError(errorText(cause));
    } finally {
      setPublishing(false);
    }
  };

  const retryItem = async (itemId: number) => {
    if (!batchId) return;
    setError(null);
    catalogAiDebug.info("WIZARD", "item.retry.begin", {
      flowId: flowIdRef.current,
      batchId,
      itemId,
    });
    try {
      await runWithSessionRecovery((client) =>
        client.retryItem(batchId, itemId),
      );
      catalogAiDebug.info("WIZARD", "item.retry.queued", {
        flowId: flowIdRef.current,
        batchId,
        itemId,
      });
      setStep(2);
    } catch (cause) {
      catalogAiDebug.error("WIZARD", "item.retry.failed", {
        flowId: flowIdRef.current,
        batchId,
        itemId,
        cause,
      });
      setError(errorText(cause));
    }
  };

  const toggleSelected = (item: EditableCatalogAiItem) => {
    if (!SELECTABLE_STATUSES.has(item.Status)) return;
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(item.Id)) next.delete(item.Id);
      else next.add(item.Id);
      return next;
    });
  };

  const selectableItemCount = useMemo(
    () => items.filter((item) => SELECTABLE_STATUSES.has(item.Status)).length,
    [items],
  );

  const pendingReviewCount = useMemo(
    () =>
      items.filter(
        (item) =>
          SELECTABLE_STATUSES.has(item.Status) &&
          !selectedIds.has(item.Id),
      ).length,
    [items, selectedIds],
  );

  const filteredItems = useMemo(() => {
    if (filter === "all") return items;
    if (filter === "ready") return items.filter((item) => item.Status === "READY");
    if (filter === "review") return items.filter((item) => item.Status === "REVIEW_REQUIRED");
    if (filter === "duplicate") return items.filter((item) => item.Status === "DUPLICATE_EXACT");
    return items.filter((item) => item.Status.startsWith("FAILED") || item.Status === "REJECTED_NOT_PRODUCT");
  }, [filter, items]);

  const progressPercent = useMemo(() => {
    if (!batchProgress?.total) return 0;
    return Math.min(100, Math.round((batchProgress.processed / batchProgress.total) * 100));
  }, [batchProgress]);

  const elapsedText = useMemo(() => {
    if (!startedAt) return "--";
    const end = finishedAt ?? Date.now();
    const totalSeconds = Math.max(1, Math.round((end - startedAt) / 1000));
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return minutes > 0 ? `${minutes} min ${seconds} s` : `${seconds} s`;
  }, [finishedAt, startedAt, step, batchProgress]);

  const busyState = useMemo(() => {
    if (selectingFiles) {
      return {
        eyebrow: "Preparando selección",
        title: "Creando vistas previas",
        description:
          "Estamos preparando miniaturas ligeras para evitar espacios en blanco al seleccionar muchas fotografías.",
        progress: null as number | null,
        counter: "Preparando imágenes",
      };
    }

    if (publishing) {
      return {
        eyebrow: "Creando catálogo",
        title: "Guardando tus productos",
        description: `Estamos creando o actualizando ${selectedIds.size} productos en Ravekh. No cierres esta ventana.`,
        progress: null as number | null,
        counter: `${selectedIds.size} productos`,
      };
    }

    if (!uploading) return null;

    const total = Math.max(photos.length, 1);
    const isPreparing = preparedCompleted < photos.length;
    const progress = isPreparing
      ? Math.round((preparedCompleted / total) * 45)
      : Math.min(100, 45 + Math.round((uploadCompleted / total) * 55));

    return {
      eyebrow: isPreparing ? "Preparando imágenes" : "Subiendo imágenes",
      title: isPreparing
        ? "Optimizando tus fotografías"
        : "Enviando tus fotografías",
      description: isPreparing
        ? "Estamos convirtiendo y reduciendo las imágenes antes de enviarlas."
        : "Las imágenes optimizadas se están guardando para que la IA pueda analizarlas.",
      progress,
      counter: isPreparing
        ? `${preparedCompleted} de ${photos.length} preparadas`
        : `${uploadCompleted} de ${photos.length} subidas`,
    };
  }, [photos.length, preparedCompleted, publishing, selectedIds.size, selectingFiles, uploadCompleted, uploading]);

  const showBusyOverlay = Boolean(busyState) && !sessionPaused;

  if (!open) return null;

  return (
    <div className="catalog-ai-wizard__backdrop" role="presentation">
      <section
        className={`catalog-ai-wizard ${showBusyOverlay ? "is-busy" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-busy={showBusyOverlay}
        aria-label="Importar productos con inteligencia artificial"
      >
        <header className="catalog-ai-wizard__header">
          <div>
            <span className="catalog-ai-wizard__eyebrow">Catálogo asistido</span>
            <h2>Importar con IA</h2>
            <p>La IA prepara tus productos. Nada se agrega a la base hasta que tú lo apruebes.</p>
          </div>
          <button
            type="button"
            className="catalog-ai-wizard__close"
            onClick={safeClose}
            disabled={(selectingFiles || uploading || publishing) && !sessionPaused}
            aria-label="Cerrar importación con IA"
          >
            ×
          </button>
        </header>

        <nav className="catalog-ai-wizard__steps" aria-label="Progreso de importación">
          {[
            [1, "Sube tus fotos"],
            [2, "IA procesa"],
            [3, "Revisa"],
            [4, "Precios"],
            [5, "Listo"],
          ].map(([number, label]) => (
            <div
              key={number}
              className={`catalog-ai-wizard__step ${step === number ? "is-active" : ""} ${step > Number(number) ? "is-complete" : ""}`}
            >
              <span>{step > Number(number) ? "✓" : number}</span>
              <small>{label}</small>
            </div>
          ))}
        </nav>

        {error ? <p className="catalog-ai-wizard__error" role="alert">{error}</p> : null}

        {sessionPaused && !sessionRefreshOpen ? (
          <div className="catalog-ai-wizard__session-paused" role="status">
            <div>
              <strong>Importación pausada</strong>
              <p>Renueva tu sesión para continuar sin perder las fotos ni el avance.</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setSessionPaused(false);
                setSessionRefreshOpen(true);
              }}
            >
              Renovar sesión
            </button>
          </div>
        ) : null}

        <div
          className={`catalog-ai-wizard__content ${step === 1 ? "is-upload-step" : ""}`}
        >
          {step === 1 ? (
            <div className="catalog-ai-wizard__upload-step">
              <div
                className="catalog-ai-wizard__dropzone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  void addFiles(Array.from(event.dataTransfer.files));
                }}
              >
                <div className="catalog-ai-wizard__upload-icon">⇧</div>
                <h3>Sube las fotos de tus productos</h3>
                <p>Arrástralas aquí o selecciónalas desde tu computadora.</p>
                <button
                  type="button"
                  disabled={selectingFiles || uploading}
                  onClick={() => inputRef.current?.click()}
                >
                  {selectingFiles ? "Preparando fotos…" : "Seleccionar fotos"}
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple
                  hidden
                  onChange={handleFileInput}
                />
                <small>JPG, PNG o WEBP · máximo {MAX_FILES} fotos · 5 MB por archivo</small>
              </div>

              <div className="catalog-ai-wizard__selection-head">
                <div>
                  <h3>Fotos seleccionadas</h3>
                  <p>{photos.length} de {MAX_FILES}</p>
                </div>
                {photos.length > 0 ? (
                  <button
                    type="button"
                    className="catalog-ai-wizard__text-button"
                    onClick={() => {
                      photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
                      setPhotos([]);
                    }}
                  >
                    Quitar todas
                  </button>
                ) : null}
              </div>

              <div
                className="catalog-ai-wizard__photo-scroll"
                role="region"
                aria-label="Fotografías seleccionadas"
                tabIndex={photos.length > 0 ? 0 : -1}
              >
                {photos.length > 0 ? (
                  <div className="catalog-ai-wizard__photo-grid">
                    {photos.map((photo, index) => (
                      <figure key={photo.id}>
                        <span className="catalog-ai-wizard__image-fallback">Vista no disponible</span>
                        <img
                          src={photo.previewUrl}
                          alt={`Producto seleccionado ${index + 1}`}
                          loading="lazy"
                          decoding="async"
                          onError={(event) => {
                            event.currentTarget.style.display = "none";
                          }}
                        />
                        <span className="catalog-ai-wizard__photo-number">
                          {index + 1}
                        </span>
                        <button
                          type="button"
                          className="catalog-ai-wizard__photo-remove"
                          onClick={() => removePhoto(photo.id)}
                          aria-label={`Eliminar ${photo.file.name}`}
                          title="Eliminar fotografía"
                          disabled={selectingFiles || uploading}
                        >
                          ×
                        </button>
                      </figure>
                    ))}
                  </div>
                ) : (
                  <div className="catalog-ai-wizard__empty-selection">
                    Tus fotografías aparecerán aquí antes de enviarlas.
                  </div>
                )}
              </div>

              <footer className="catalog-ai-wizard__actions">
                <button type="button" className="is-secondary" onClick={safeClose}>Cancelar</button>
                <button
                  type="button"
                  className="is-primary"
                  onClick={() => void uploadAndStart()}
                  disabled={photos.length === 0 || selectingFiles || uploading}
                >
                  {uploading
                    ? preparedCompleted < photos.length
                      ? `Preparando ${preparedCompleted}/${photos.length}`
                      : `Subiendo ${uploadCompleted}/${photos.length}`
                    : `Analizar ${photos.length || ""} ${photos.length === 1 ? "foto" : "fotos"}`}
                </button>
              </footer>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="catalog-ai-wizard__processing-step">
              <div className="catalog-ai-wizard__progress-ring" style={{ "--progress": `${progressPercent * 3.6}deg` } as React.CSSProperties}>
                <div>
                  <span>✦</span>
                  <strong>{progressPercent}%</strong>
                </div>
              </div>
              <h3>Analizando {batchProgress?.total ?? photos.length} fotos…</h3>
              <p>Estamos detectando productos, generando nombres, categorías y descripciones.</p>

              <div className="catalog-ai-wizard__process-list">
                <div><span className={batchProgress?.uploaded === batchProgress?.total ? "is-done" : ""}>✓</span><p>Imágenes cargadas</p><strong>{batchProgress?.uploaded ?? uploadCompleted}/{batchProgress?.total ?? photos.length}</strong></div>
                <div><span className={progressPercent > 0 ? "is-done" : ""}>✓</span><p>Productos analizados</p><strong>{batchProgress?.processed ?? 0}/{batchProgress?.total ?? photos.length}</strong></div>
                <div><span className={batchProgress?.review ? "is-warning" : ""}>!</span><p>Requieren revisión</p><strong>{batchProgress?.review ?? 0}</strong></div>
                <div><span className={batchProgress?.failed ? "is-error" : ""}>×</span><p>Con error</p><strong>{batchProgress?.failed ?? 0}</strong></div>
              </div>

              <div className="catalog-ai-wizard__notice">
                <span>✦</span>
                <div>
                  <strong>Aún no se ha creado ningún producto</strong>
                  <p>Primero revisarás y aprobarás cada resultado.</p>
                </div>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="catalog-ai-wizard__review-step">
              <div className="catalog-ai-wizard__review-head">
                <div>
                  <h3>Revisa los productos ({items.length})</h3>
                  <p>Selecciona los productos que deseas crear o actualizar. Los posibles duplicados requieren una decisión manual.</p>
                </div>
                <strong>{selectedIds.size} aprobados</strong>
              </div>

              <div className="catalog-ai-wizard__filters" role="tablist" aria-label="Filtrar resultados">
                {[
                  ["all", `Todos ${items.length}`],
                  ["ready", `Listos ${items.filter((item) => item.Status === "READY").length}`],
                  ["review", `Revisar ${items.filter((item) => item.Status === "REVIEW_REQUIRED").length}`],
                  ["duplicate", `Duplicados ${items.filter((item) => item.Status === "DUPLICATE_EXACT").length}`],
                  ["error", `Errores ${items.filter((item) => item.Status.startsWith("FAILED") || item.Status === "REJECTED_NOT_PRODUCT").length}`],
                ].map(([value, label]) => (
                  <button
                    key={value}
                    type="button"
                    className={filter === value ? "is-active" : ""}
                    onClick={() => setFilter(value as typeof filter)}
                  >
                    {label}
                  </button>
                ))}
              </div>

              <div className="catalog-ai-wizard__review-list">
                {filteredItems.map((item) => {
                  const selectable = SELECTABLE_STATUSES.has(item.Status);
                  const isSelected = selectedIds.has(item.Id);
                  const confidence = confidenceValue(item.Confidence);
                  const matchedCategory = findAvailableCategory(
                    item.draftCategory,
                    null,
                  );
                  const suggestedCategoryName = String(
                    item.Suggested_Category ?? "",
                  ).trim();
                  const hasSuggestedCategory = Boolean(
                    suggestedCategoryName,
                  );
                  const isSuggestedCategory =
                    item.categoryMode === "auto" &&
                    hasSuggestedCategory;
                  const isNewCategory =
                    item.categoryMode === "new";
                  const categorySelectValue = isSuggestedCategory
                    ? "__suggested__"
                    : isNewCategory
                      ? "__new__"
                      : matchedCategory
                        ? String(matchedCategory.id)
                        : "";
                  const hasExistingDuplicate = Boolean(
                    item.Duplicate_Product_Id,
                  );
                  const visibleItemError = friendlyItemError(item);
                  return (
                    <article
                      id={`catalog-ai-review-item-${item.Id}`}
                      key={item.Id}
                      className={`${isSelected ? "is-selected" : ""} ${!selectable ? "is-disabled" : ""} ${selectable && !isSelected ? "is-pending-review" : ""}`}
                    >
                      <label className="catalog-ai-wizard__approval-check">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          disabled={!selectable}
                          onChange={() => toggleSelected(item)}
                        />
                        <span aria-hidden="true" />
                      </label>

                      <div className="catalog-ai-wizard__review-image">
                        <span className="catalog-ai-wizard__image-fallback">
                          Imagen no disponible
                        </span>
                        {item.Secure_Url ? (
                          <img
                            src={item.Secure_Url}
                            alt={item.draftName || "Producto analizado"}
                            loading="lazy"
                            decoding="async"
                            onError={retryRemoteImageOnce}
                          />
                        ) : null}
                      </div>

                      <div className="catalog-ai-wizard__review-fields">
                        <div className="catalog-ai-wizard__review-status-row">
                          <span className={`status-${item.Status.toLowerCase()}`}>{statusLabel(item.Status)}</span>
                          <small>Confianza {Math.round(confidence * 100)}%</small>
                        </div>
                        <label>
                          Nombre
                          <input
                            value={item.draftName}
                            disabled={!selectable}
                            onChange={(event) => updateDraft(item.Id, "draftName", event.target.value)}
                          />
                        </label>
                        <label>
                          Descripción
                          <textarea
                            value={item.draftDescription}
                            disabled={!selectable}
                            rows={2}
                            onChange={(event) => updateDraft(item.Id, "draftDescription", event.target.value)}
                          />
                        </label>
                        {hasExistingDuplicate ? (
                          <div className="catalog-ai-wizard__duplicate-panel">
                            <div>
                              <strong>
                                Encontramos el producto #{item.Duplicate_Product_Id}
                              </strong>
                              <p>
                                Cargamos primero la información existente. Los campos vacíos se completaron con la sugerencia de la IA para que puedas editarlos.
                              </p>
                            </div>
                            <div className="catalog-ai-wizard__duplicate-options">
                              <label>
                                <input
                                  type="radio"
                                  name={`duplicate-action-${item.Id}`}
                                  checked={item.duplicateAction === "update_existing"}
                                  disabled={!selectable}
                                  onChange={() => {
                                    setItems((current) =>
                                      current.map((row) =>
                                        row.Id === item.Id
                                          ? {
                                              ...row,
                                              duplicateAction: "update_existing",
                                              dirty: true,
                                            }
                                          : row,
                                      ),
                                    );
                                    setSelectedIds((current) => {
                                      const next = new Set(current);
                                      next.add(item.Id);
                                      return next;
                                    });
                                  }}
                                />
                                Actualizar el producto existente
                              </label>
                              <label>
                                <input
                                  type="radio"
                                  name={`duplicate-action-${item.Id}`}
                                  checked={item.duplicateAction === "create_new"}
                                  disabled={!selectable}
                                  onChange={() => {
                                    setItems((current) =>
                                      current.map((row) =>
                                        row.Id === item.Id
                                          ? {
                                              ...row,
                                              duplicateAction: "create_new",
                                              dirty: true,
                                            }
                                          : row,
                                      ),
                                    );
                                    setSelectedIds((current) => {
                                      const next = new Set(current);
                                      next.add(item.Id);
                                      return next;
                                    });
                                  }}
                                />
                                Crear un producto nuevo
                              </label>
                            </div>
                          </div>
                        ) : null}

                        <div className="catalog-ai-wizard__field-grid">
                          <div className="catalog-ai-wizard__category-field">
                            <label>
                              Categoría
                              <select
                                value={categorySelectValue}
                                disabled={!selectable || item.creatingCategory}
                                onChange={(event) =>
                                  selectCategory(item.Id, event.target.value)
                                }
                              >
                                <option value="">Sin categoría</option>
                                {hasSuggestedCategory ? (
                                  <option value="__suggested__">
                                    Sugerencia de IA: {suggestedCategoryName}
                                  </option>
                                ) : null}
                                {rootCategories.map((category) => (
                                  <option key={category.id} value={String(category.id)}>
                                    {category.name}
                                  </option>
                                ))}
                                <option value="__new__">
                                  + Usar o crear otra categoría
                                </option>
                              </select>
                            </label>

                            {isSuggestedCategory ? (
                              <small className="catalog-ai-wizard__selected-category">
                                <span
                                  style={{
                                    backgroundColor: matchedCategory
                                      ? matchedCategory.color
                                      : normalizeCategoryColor(
                                          item.draftCategoryColor,
                                        ),
                                  }}
                                  aria-hidden="true"
                                />
                                {matchedCategory
                                  ? `La sugerencia ${suggestedCategoryName} coincide con una categoría existente y se reutilizará.`
                                  : `La sugerencia ${suggestedCategoryName} se creará automáticamente al guardar si decides conservarla.`}
                              </small>
                            ) : isNewCategory ? (
                              <div className="catalog-ai-wizard__new-category">
                                <label>
                                  Nueva categoría
                                  <input
                                    value={item.draftCategory}
                                    disabled={!selectable || item.creatingCategory}
                                    placeholder="Ej. Ropa"
                                    onChange={(event) =>
                                      updateDraft(
                                        item.Id,
                                        "draftCategory",
                                        event.target.value,
                                      )
                                    }
                                  />
                                </label>
                                <label className="catalog-ai-wizard__category-color">
                                  Color
                                  <input
                                    type="color"
                                    value={normalizeCategoryColor(
                                      item.draftCategoryColor,
                                    )}
                                    disabled={!selectable || item.creatingCategory}
                                    onChange={(event) =>
                                      setItems((current) =>
                                        current.map((row) =>
                                          row.Id === item.Id
                                            ? {
                                                ...row,
                                                draftCategoryColor: event.target.value,
                                                dirty: true,
                                              }
                                            : row,
                                        ),
                                      )
                                    }
                                  />
                                </label>
                                <button
                                  type="button"
                                  className="catalog-ai-wizard__create-category"
                                  disabled={
                                    !selectable ||
                                    item.creatingCategory ||
                                    item.draftCategory.trim().length < 2
                                  }
                                  onClick={() =>
                                    void createCategoryForItem(item.Id)
                                  }
                                >
                                  {item.creatingCategory
                                    ? "Creando categoría…"
                                    : "Crear y seleccionar"}
                                </button>
                              </div>
                            ) : matchedCategory ? (
                              <small className="catalog-ai-wizard__selected-category">
                                <span
                                  style={{ backgroundColor: matchedCategory.color }}
                                  aria-hidden="true"
                                />
                                Se usará {matchedCategory.name}
                              </small>
                            ) : null}
                          </div>


                          <label>
                            Código de barras <small>(opcional)</small>
                            <input
                              value={item.draftBarcode}
                              disabled={!selectable}
                              placeholder="Captúralo manualmente"
                              autoComplete="off"
                              maxLength={255}
                              onChange={(event) =>
                                updateDraft(
                                  item.Id,
                                  "draftBarcode",
                                  event.target.value,
                                )
                              }
                            />
                            <small>La IA no completa este campo.</small>
                          </label>

                          <label>
                            Colores
                            <input
                              value={item.draftColor}
                              placeholder="Ej. Rojo, Azul, Negro"
                              disabled={!selectable}
                              onChange={(event) =>
                                updateDraft(
                                  item.Id,
                                  "draftColor",
                                  event.target.value,
                                )
                              }
                            />
                            <small>Separa varios colores con comas.</small>
                          </label>

                          <label>
                            Precio
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              placeholder="Sin precio"
                              value={item.draftPrice}
                              disabled={!selectable}
                              onChange={(event) =>
                                updateDraft(
                                  item.Id,
                                  "draftPrice",
                                  event.target.value,
                                )
                              }
                            />
                          </label>

                          <label>
                            Stock
                            <input
                              type="number"
                              min="0"
                              step="0.01"
                              inputMode="decimal"
                              value={item.draftStock}
                              disabled={!selectable}
                              onChange={(event) =>
                                updateDraft(
                                  item.Id,
                                  "draftStock",
                                  event.target.value,
                                )
                              }
                            />
                          </label>
                        </div>

                        {item.Duplicate_Reason ? (
                          <p className="catalog-ai-wizard__inline-warning">
                            {duplicateReasonLabel(item.Duplicate_Reason)}
                          </p>
                        ) : null}
                        {visibleItemError ? (
                          <p className="catalog-ai-wizard__inline-error">
                            {visibleItemError}
                          </p>
                        ) : null}
                      </div>

                      <div className="catalog-ai-wizard__review-actions">
                        {item.dirty && selectable ? (
                          <button type="button" onClick={() => void saveItem(item.Id)} disabled={item.saving}>
                            {item.saving ? "Guardando…" : "Guardar cambios"}
                          </button>
                        ) : null}
                        {item.Status === "FAILED_RETRYABLE" || item.Status === "FAILED_PERMANENT" ? (
                          <button type="button" onClick={() => void retryItem(item.Id)}>Reintentar</button>
                        ) : null}
                      </div>
                    </article>
                  );
                })}
              </div>

              <footer className="catalog-ai-wizard__actions">
                <button type="button" className="is-secondary" onClick={() => setStep(1)}>Volver</button>
                <button type="button" className="is-primary" onClick={() => void continueToPricing()} disabled={selectedIds.size === 0}>
                  Continuar con {selectedIds.size} productos
                </button>
              </footer>
            </div>
          ) : null}

          {step === 4 ? (
            <div className="catalog-ai-wizard__pricing-step">
              <div className="catalog-ai-wizard__pricing-copy">
                <span className="catalog-ai-wizard__pricing-icon">🏷</span>
                <h3>¿Cómo deseas manejar los precios?</h3>
                <p>Los productos nuevos todavía no existen en tu base. Los duplicados solo se actualizarán si eliges esa opción.</p>
              </div>

              <div className="catalog-ai-wizard__price-options">
                <label className={priceMode === "whatsapp" ? "is-selected" : ""}>
                  <input type="radio" name="price-mode" value="whatsapp" checked={priceMode === "whatsapp"} onChange={() => setPriceMode("whatsapp")} />
                  <span className="catalog-ai-wizard__price-radio" />
                  <div><strong>Solicitar precio por WhatsApp</strong><p>Los productos se crean sin precio visible para que el cliente pregunte.</p></div>
                </label>
                <label className={priceMode === "hidden" ? "is-selected" : ""}>
                  <input type="radio" name="price-mode" value="hidden" checked={priceMode === "hidden"} onChange={() => setPriceMode("hidden")} />
                  <span className="catalog-ai-wizard__price-radio" />
                  <div><strong>Ocultar precios temporalmente</strong><p>Organiza el catálogo primero y agrega precios después desde productos.</p></div>
                </label>
                <label className={priceMode === "show" ? "is-selected" : ""}>
                  <input type="radio" name="price-mode" value="show" checked={priceMode === "show"} onChange={() => setPriceMode("show")} />
                  <span className="catalog-ai-wizard__price-radio" />
                  <div><strong>Mostrar precios capturados</strong><p>Los productos con precio se mostrarán en el catálogo. Los que no tengan precio permanecerán ocultos.</p></div>
                </label>
              </div>

              <div className="catalog-ai-wizard__notice">
                <span>✓</span>
                <div>
                  <strong>Confirmación obligatoria</strong>
                  <p>Al confirmar se crearán productos nuevos o se actualizarán los duplicados que hayas indicado.</p>
                </div>
              </div>

              <footer className="catalog-ai-wizard__actions">
                <button type="button" className="is-secondary" onClick={() => setStep(3)} disabled={publishing}>Volver a revisar</button>
                <button type="button" className="is-primary" onClick={() => void publishApproved()} disabled={publishing || selectedIds.size === 0}>
                  {publishing ? "Guardando productos…" : `Guardar ${selectedIds.size} productos`}
                </button>
              </footer>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="catalog-ai-wizard__success-step">
              <div className="catalog-ai-wizard__success-icon">✓</div>
              <h3>¡Productos guardados!</h3>
              <p>Los productos aprobados ya fueron creados o actualizados en Ravekh.</p>

              <div className="catalog-ai-wizard__success-stats">
                <div><span>Productos procesados</span><strong>{publishedProductIds.length}</strong></div>
                <div><span>Categorías detectadas</span><strong>{new Set(items.map((item) => item.draftCategory.trim()).filter(Boolean)).size}</strong></div>
                <div><span>Imágenes procesadas</span><strong>{items.length}</strong></div>
                <div><span>Tiempo total</span><strong>{elapsedText}</strong></div>
              </div>

              <div className="catalog-ai-wizard__notice is-success">
                <span>✓</span>
                <div><strong>La aprobación fue respetada</strong><p>Solo se procesaron los {publishedProductIds.length} productos que seleccionaste.</p></div>
              </div>

              <footer className="catalog-ai-wizard__actions is-centered">
                <button
                  type="button"
                  className="is-primary"
                  onClick={() => {
                    const result = { created: publishedProductIds.length, productIds: publishedProductIds };
                    reset();
                    onCompleted(result);
                  }}
                >
                  Ver mis productos
                </button>
              </footer>
            </div>
          ) : null}
        </div>

        {incompleteReviewDialog === "summary" ? (
          <div
            className="catalog-ai-wizard__decision-backdrop"
            role="presentation"
          >
            <section
              className="catalog-ai-wizard__decision-dialog"
              role="dialog"
              aria-modal="true"
              aria-labelledby="catalog-ai-incomplete-review-title"
            >
              <span className="catalog-ai-wizard__decision-eyebrow">
                Revisión incompleta
              </span>
              <h3 id="catalog-ai-incomplete-review-title">
                Solo has aprobado {selectedIds.size} de {selectableItemCount} productos
              </h3>
              <p>
                Hay {pendingReviewCount} {pendingReviewCount === 1 ? "producto" : "productos"} que todavía no
                {pendingReviewCount === 1 ? " ha" : " han"} sido revisado{pendingReviewCount === 1 ? "" : "s"}.
                Si continúas, esos productos no se crearán ni se actualizarán.
              </p>

              <div className="catalog-ai-wizard__decision-summary">
                <div>
                  <span>Aprobados</span>
                  <strong>{selectedIds.size}</strong>
                </div>
                <div>
                  <span>Pendientes</span>
                  <strong>{pendingReviewCount}</strong>
                </div>
                <div>
                  <span>Total disponible</span>
                  <strong>{selectableItemCount}</strong>
                </div>
              </div>

              <div className="catalog-ai-wizard__decision-actions">
                <button
                  type="button"
                  className="is-subtle"
                  onClick={() => setIncompleteReviewDialog("confirm")}
                >
                  Continuar sin revisar
                </button>
                <button
                  type="button"
                  className="is-primary"
                  onClick={reviewRemainingProducts}
                >
                  Ir a revisar {pendingReviewCount === 1 ? "el producto" : "los productos"}
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {incompleteReviewDialog === "confirm" ? (
          <div
            className="catalog-ai-wizard__decision-backdrop"
            role="presentation"
          >
            <section
              className="catalog-ai-wizard__decision-dialog is-confirmation"
              role="alertdialog"
              aria-modal="true"
              aria-labelledby="catalog-ai-skip-review-title"
            >
              <span className="catalog-ai-wizard__decision-eyebrow is-warning">
                Confirmación
              </span>
              <h3 id="catalog-ai-skip-review-title">
                ¿Estás seguro de continuar sin revisar?
              </h3>
              <p>
                Los {pendingReviewCount} productos pendientes no se crearán ni se actualizarán en esta importación.
              </p>

              <div className="catalog-ai-wizard__decision-actions">
                <button
                  type="button"
                  className="is-subtle"
                  onClick={() => setIncompleteReviewDialog("summary")}
                >
                  No
                </button>
                <button
                  type="button"
                  className="is-confirm"
                  onClick={() => void confirmContinueWithoutReview()}
                >
                  Sí, continuar
                </button>
              </div>
            </section>
          </div>
        ) : null}

        {showBusyOverlay && busyState ? (
          <div
            className="catalog-ai-wizard__busy-overlay"
            role="status"
            aria-live="polite"
            aria-label={busyState.title}
          >
            <div className="catalog-ai-wizard__busy-sweep" aria-hidden="true" />
            <div className="catalog-ai-wizard__busy-card">
              <div className="catalog-ai-wizard__busy-orbit" aria-hidden="true">
                <span />
                <strong>✦</strong>
              </div>

              <span className="catalog-ai-wizard__busy-eyebrow">
                {busyState.eyebrow}
              </span>
              <h3>{busyState.title}</h3>
              <p>{busyState.description}</p>

              {busyState.progress !== null ? (
                <div className="catalog-ai-wizard__busy-progress">
                  <div>
                    <span style={{ width: `${busyState.progress}%` }} />
                  </div>
                  <strong>{busyState.progress}%</strong>
                </div>
              ) : (
                <div className="catalog-ai-wizard__busy-dots" aria-hidden="true">
                  <span />
                  <span />
                  <span />
                </div>
              )}

              <small>{busyState.counter}</small>
            </div>
          </div>
        ) : null}
      </section>

      <CatalogAiSessionRefreshModal
        open={sessionRefreshOpen}
        expectedBusinessId={businessId}
        onContinueLater={continueSessionLater}
        onRefreshed={handleSessionRefreshed}
      />
    </div>
  );
};
