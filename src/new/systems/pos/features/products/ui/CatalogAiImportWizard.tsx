import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  CatalogAiApi,
  CatalogAiBatchProgress,
  CatalogAiItem,
  CatalogAiItemPatch,
  RegisteredCatalogAsset,
  SignedCatalogUpload,
} from "../api/CatalogAiApi";
import "./CatalogAiImportWizard.css";

const DEFAULT_CATALOG_AI_URL = "http://localhost:8095";
const CATALOG_AI_API_URL = String(
  import.meta.env.VITE_CATALOG_AI_API_URL ?? DEFAULT_CATALOG_AI_URL,
).replace(/\/+$/, "");

const MAX_FILES = 100;
const MAX_FILE_SIZE_BYTES = 10 * 1024 * 1024;
const ALLOWED_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
  "image/heic",
  "image/heif",
]);

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
  file: File;
  previewUrl: string;
};

type EditableCatalogAiItem = CatalogAiItem & {
  draftName: string;
  draftDescription: string;
  draftCategory: string;
  draftSubcategory: string;
  draftBrand: string;
  draftColor: string;
  dirty: boolean;
  saving: boolean;
};

type CatalogAiImportWizardProps = {
  open: boolean;
  businessId: number;
  token: string;
  onClose: () => void;
  onCompleted: (result: { created: number; productIds: number[] }) => void;
};

const createClientAssetId = (file: File, index: number) =>
  `web-${Date.now()}-${index}-${file.name.replace(/[^a-z0-9._-]/gi, "-").slice(0, 48)}`;

const toEditableItem = (item: CatalogAiItem): EditableCatalogAiItem => ({
  ...item,
  draftName: item.Suggested_Name ?? "",
  draftDescription: item.Suggested_Description ?? "",
  draftCategory: item.Suggested_Category ?? "",
  draftSubcategory: item.Suggested_Subcategory ?? "",
  draftBrand: item.Suggested_Brand ?? "",
  draftColor: item.Suggested_Color ?? "",
  dirty: false,
  saving: false,
});

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
      results[currentIndex] = await mapper(values[currentIndex], currentIndex);
    }
  };

  await Promise.all(
    Array.from({ length: Math.min(concurrency, values.length) }, () => run()),
  );
  return results;
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

const errorText = (cause: unknown): string => {
  if (cause instanceof Error && cause.message.trim()) return cause.message;
  return "Ocurrió un error al procesar el catálogo con IA.";
};

export const CatalogAiImportWizard = ({
  open,
  businessId,
  token,
  onClose,
  onCompleted,
}: CatalogAiImportWizardProps) => {
  const [step, setStep] = useState<WizardStep>(1);
  const [photos, setPhotos] = useState<SelectedPhoto[]>([]);
  const [batchId, setBatchId] = useState<string | null>(null);
  const [batchProgress, setBatchProgress] = useState<CatalogAiBatchProgress | null>(null);
  const [items, setItems] = useState<EditableCatalogAiItem[]>([]);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [priceMode, setPriceMode] = useState<PriceMode>("whatsapp");
  const [uploading, setUploading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [uploadCompleted, setUploadCompleted] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [publishedProductIds, setPublishedProductIds] = useState<number[]>([]);
  const [startedAt, setStartedAt] = useState<number | null>(null);
  const [finishedAt, setFinishedAt] = useState<number | null>(null);
  const [filter, setFilter] = useState<"all" | "ready" | "review" | "duplicate" | "error">("all");
  const inputRef = useRef<HTMLInputElement | null>(null);
  const pollInFlightRef = useRef(false);
  const photosRef = useRef<SelectedPhoto[]>([]);

  const api = useMemo(() => new CatalogAiApi(CATALOG_AI_API_URL, token), [token]);

  const reset = () => {
    photos.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    setStep(1);
    setPhotos([]);
    setBatchId(null);
    setBatchProgress(null);
    setItems([]);
    setSelectedIds(new Set());
    setPriceMode("whatsapp");
    setUploading(false);
    setPublishing(false);
    setUploadCompleted(0);
    setError(null);
    setPublishedProductIds([]);
    setStartedAt(null);
    setFinishedAt(null);
    setFilter("all");
  };

  useEffect(() => {
    if (!open) return;
    setError(null);
  }, [open]);

  useEffect(() => {
    photosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      photosRef.current.forEach((photo) => URL.revokeObjectURL(photo.previewUrl));
    };
  }, []);

  const safeClose = () => {
    if (uploading || publishing) return;
    if (step === 2 && !TERMINAL_BATCH_STATUSES.has(batchProgress?.status ?? "")) {
      const confirmed = window.confirm(
        "La IA sigue procesando tus fotos. Si cierras esta ventana tendrás que retomar el lote después. ¿Deseas cerrar?",
      );
      if (!confirmed) return;
    }
    reset();
    onClose();
  };

  const addFiles = (incoming: File[]) => {
    setError(null);
    const existingKeys = new Set(
      photos.map(({ file }) => `${file.name}:${file.size}:${file.lastModified}`),
    );
    const accepted: SelectedPhoto[] = [];
    const rejectedMessages: string[] = [];

    for (const file of incoming) {
      const key = `${file.name}:${file.size}:${file.lastModified}`;
      if (existingKeys.has(key)) continue;
      if (!ALLOWED_TYPES.has(file.type)) {
        rejectedMessages.push(`${file.name}: formato no permitido.`);
        continue;
      }
      if (file.size > MAX_FILE_SIZE_BYTES) {
        rejectedMessages.push(`${file.name}: supera 10 MB.`);
        continue;
      }
      if (photos.length + accepted.length >= MAX_FILES) {
        rejectedMessages.push(`Solo puedes procesar hasta ${MAX_FILES} imágenes por lote.`);
        break;
      }
      accepted.push({
        id: createClientAssetId(file, photos.length + accepted.length),
        file,
        previewUrl: URL.createObjectURL(file),
      });
      existingKeys.add(key);
    }

    if (rejectedMessages.length > 0) {
      setError(rejectedMessages.slice(0, 3).join(" "));
    }
    if (accepted.length > 0) {
      setPhotos((current) => [...current, ...accepted]);
    }
  };

  const handleFileInput = (event: ChangeEvent<HTMLInputElement>) => {
    addFiles(Array.from(event.target.files ?? []));
    event.target.value = "";
  };

  const removePhoto = (photoId: string) => {
    setPhotos((current) => {
      const target = current.find((photo) => photo.id === photoId);
      if (target) URL.revokeObjectURL(target.previewUrl);
      return current.filter((photo) => photo.id !== photoId);
    });
  };

  const uploadAndStart = async () => {
    if (!businessId || !token) {
      setError("Inicia sesión y selecciona un negocio antes de usar la IA.");
      return;
    }
    if (photos.length === 0) {
      setError("Selecciona al menos una fotografía.");
      return;
    }

    setUploading(true);
    setUploadCompleted(0);
    setError(null);
    setStartedAt(Date.now());

    try {
      const created = await api.createBatch(photos.length);
      const newBatchId = created.batchId;
      setBatchId(newBatchId);

      const signedUploads = await api.signUploads(
        newBatchId,
        photos.map((photo) => ({
          clientAssetId: photo.id,
          mimeType: photo.file.type,
        })),
      );
      const signedByClientId = new Map<string, SignedCatalogUpload>(
        signedUploads.map((signed) => [signed.clientAssetId, signed]),
      );

      const registeredAssets = await mapWithConcurrency(
        photos,
        3,
        async (photo): Promise<RegisteredCatalogAsset> => {
          const signed = signedByClientId.get(photo.id);
          if (!signed) throw new Error(`No se recibió firma para ${photo.file.name}.`);
          const uploaded = await api.uploadToCloudinary(photo.file, signed);
          setUploadCompleted((current) => current + 1);
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
            mimeType: photo.file.type,
          };
        },
      );

      await api.registerAssets(newBatchId, registeredAssets);
      await api.startBatch(newBatchId);
      setStep(2);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setUploading(false);
    }
  };

  useEffect(() => {
    if (!open || step !== 2 || !batchId) return;

    let cancelled = false;

    const poll = async () => {
      if (pollInFlightRef.current || cancelled) return;
      pollInFlightRef.current = true;
      try {
        const progress = await api.getBatch(batchId);
        if (cancelled) return;
        setBatchProgress(progress);

        if (TERMINAL_BATCH_STATUSES.has(progress.status)) {
          const batchItems = await api.listBatchItems(batchId);
          if (cancelled) return;
          const editable = batchItems.map(toEditableItem);
          setItems(editable);
          setSelectedIds(
            new Set(
              editable
                .filter((item) => DEFAULT_SELECTED_STATUSES.has(item.Status))
                .map((item) => item.Id),
            ),
          );
          setFinishedAt(Date.now());
          setStep(3);
        }
      } catch (cause) {
        if (!cancelled) setError(errorText(cause));
      } finally {
        pollInFlightRef.current = false;
      }
    };

    void poll();
    const interval = window.setInterval(() => void poll(), 1600);
    return () => {
      cancelled = true;
      window.clearInterval(interval);
    };
  }, [api, batchId, open, step]);

  const updateDraft = (
    itemId: number,
    field:
      | "draftName"
      | "draftDescription"
      | "draftCategory"
      | "draftSubcategory"
      | "draftBrand"
      | "draftColor",
    value: string,
  ) => {
    setItems((current) =>
      current.map((item) =>
        item.Id === itemId ? { ...item, [field]: value, dirty: true } : item,
      ),
    );
  };

  const saveItem = async (itemId: number) => {
    if (!batchId) return;
    const item = items.find((row) => row.Id === itemId);
    if (!item || !item.dirty) return;
    if (!item.draftName.trim()) {
      setError("Todos los productos aprobados necesitan un nombre.");
      return;
    }

    setItems((current) =>
      current.map((row) =>
        row.Id === itemId ? { ...row, saving: true } : row,
      ),
    );

    const patch: CatalogAiItemPatch = {
      name: item.draftName.trim(),
      description: item.draftDescription.trim() || null,
      category: item.draftCategory.trim() || null,
      subcategory: item.draftSubcategory.trim() || null,
      brand: item.draftBrand.trim() || null,
      color: item.draftColor.trim() || null,
    };

    try {
      await api.updateItem(batchId, itemId, patch);
      setItems((current) =>
        current.map((row) =>
          row.Id === itemId
            ? {
                ...row,
                Suggested_Name: patch.name ?? row.Suggested_Name,
                Suggested_Description: patch.description ?? null,
                Suggested_Category: patch.category ?? null,
                Suggested_Subcategory: patch.subcategory ?? null,
                Suggested_Brand: patch.brand ?? null,
                Suggested_Color: patch.color ?? null,
                dirty: false,
                saving: false,
              }
            : row,
        ),
      );
    } catch (cause) {
      setItems((current) =>
        current.map((row) =>
          row.Id === itemId ? { ...row, saving: false } : row,
        ),
      );
      throw cause;
    }
  };

  const saveDirtyItems = async () => {
    const dirtyIds = items.filter((item) => item.dirty).map((item) => item.Id);
    for (const itemId of dirtyIds) {
      await saveItem(itemId);
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

    setError(null);
    try {
      await saveDirtyItems();
      setStep(4);
    } catch (cause) {
      setError(errorText(cause));
    }
  };

  const publishApproved = async () => {
    if (!batchId || selectedIds.size === 0) return;
    setPublishing(true);
    setError(null);

    try {
      await saveDirtyItems();
      const selectedItems = items.filter((item) => selectedIds.has(item.Id));
      const productIds = await mapWithConcurrency(selectedItems, 2, (item) =>
        api.publishItem(batchId, item),
      );
      setPublishedProductIds(productIds);
      setFinishedAt(Date.now());
      setStep(5);
    } catch (cause) {
      setError(errorText(cause));
    } finally {
      setPublishing(false);
    }
  };

  const retryItem = async (itemId: number) => {
    if (!batchId) return;
    setError(null);
    try {
      await api.retryItem(batchId, itemId);
      setStep(2);
    } catch (cause) {
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

  if (!open) return null;

  return (
    <div className="catalog-ai-wizard__backdrop" role="presentation">
      <section
        className="catalog-ai-wizard"
        role="dialog"
        aria-modal="true"
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
            disabled={uploading || publishing}
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

        <div className="catalog-ai-wizard__content">
          {step === 1 ? (
            <div className="catalog-ai-wizard__upload-step">
              <div
                className="catalog-ai-wizard__dropzone"
                onDragOver={(event) => event.preventDefault()}
                onDrop={(event) => {
                  event.preventDefault();
                  addFiles(Array.from(event.dataTransfer.files));
                }}
              >
                <div className="catalog-ai-wizard__upload-icon">⇧</div>
                <h3>Sube las fotos de tus productos</h3>
                <p>Arrástralas aquí o selecciónalas desde tu computadora.</p>
                <button type="button" onClick={() => inputRef.current?.click()}>
                  Seleccionar fotos
                </button>
                <input
                  ref={inputRef}
                  type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp,image/heic,image/heif"
                  multiple
                  hidden
                  onChange={handleFileInput}
                />
                <small>JPG, PNG, WEBP, HEIC · máximo {MAX_FILES} fotos · 10 MB por archivo</small>
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

              {photos.length > 0 ? (
                <div className="catalog-ai-wizard__photo-grid">
                  {photos.map((photo, index) => (
                    <figure key={photo.id}>
                      <img src={photo.previewUrl} alt={`Producto seleccionado ${index + 1}`} />
                      <span>{index + 1}</span>
                      <button type="button" onClick={() => removePhoto(photo.id)} aria-label={`Quitar ${photo.file.name}`}>×</button>
                    </figure>
                  ))}
                </div>
              ) : (
                <div className="catalog-ai-wizard__empty-selection">Tus fotografías aparecerán aquí antes de enviarlas.</div>
              )}

              <footer className="catalog-ai-wizard__actions">
                <button type="button" className="is-secondary" onClick={safeClose}>Cancelar</button>
                <button
                  type="button"
                  className="is-primary"
                  onClick={() => void uploadAndStart()}
                  disabled={photos.length === 0 || uploading}
                >
                  {uploading
                    ? `Subiendo ${uploadCompleted}/${photos.length}`
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
                  <p>Selecciona únicamente los productos que deseas crear.</p>
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
                  return (
                    <article key={item.Id} className={`${isSelected ? "is-selected" : ""} ${!selectable ? "is-disabled" : ""}`}>
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
                        {item.Secure_Url ? <img src={item.Secure_Url} alt={item.draftName || "Producto analizado"} /> : <span>Sin foto</span>}
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
                        <div className="catalog-ai-wizard__field-grid">
                          <label>Categoría<input value={item.draftCategory} disabled={!selectable} onChange={(event) => updateDraft(item.Id, "draftCategory", event.target.value)} /></label>
                          <label>Subcategoría<input value={item.draftSubcategory} disabled={!selectable} onChange={(event) => updateDraft(item.Id, "draftSubcategory", event.target.value)} /></label>
                          <label>Marca<input value={item.draftBrand} disabled={!selectable} onChange={(event) => updateDraft(item.Id, "draftBrand", event.target.value)} /></label>
                          <label>Color<input value={item.draftColor} disabled={!selectable} onChange={(event) => updateDraft(item.Id, "draftColor", event.target.value)} /></label>
                        </div>
                        {item.Duplicate_Reason ? <p className="catalog-ai-wizard__inline-warning">Posible duplicado: {item.Duplicate_Reason}</p> : null}
                        {item.Error_Message ? <p className="catalog-ai-wizard__inline-error">{item.Error_Message}</p> : null}
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
                <p>Los productos todavía no existen en tu base. Se crearán cuando confirmes este paso.</p>
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
                <label className="is-disabled">
                  <input type="radio" name="price-mode" value="show" disabled />
                  <span className="catalog-ai-wizard__price-radio" />
                  <div><strong>Mostrar precio</strong><p>Disponible cuando agreguemos la edición masiva de precios.</p><small>Próximamente</small></div>
                </label>
              </div>

              <div className="catalog-ai-wizard__notice">
                <span>✓</span>
                <div>
                  <strong>Confirmación obligatoria</strong>
                  <p>Al presionar “Crear productos” se insertarán {selectedIds.size} registros en tu base de datos.</p>
                </div>
              </div>

              <footer className="catalog-ai-wizard__actions">
                <button type="button" className="is-secondary" onClick={() => setStep(3)} disabled={publishing}>Volver a revisar</button>
                <button type="button" className="is-primary" onClick={() => void publishApproved()} disabled={publishing || selectedIds.size === 0}>
                  {publishing ? "Creando productos…" : `Crear ${selectedIds.size} productos`}
                </button>
              </footer>
            </div>
          ) : null}

          {step === 5 ? (
            <div className="catalog-ai-wizard__success-step">
              <div className="catalog-ai-wizard__success-icon">✓</div>
              <h3>¡Catálogo creado!</h3>
              <p>Los productos aprobados ya fueron agregados a Ravekh.</p>

              <div className="catalog-ai-wizard__success-stats">
                <div><span>Productos creados</span><strong>{publishedProductIds.length}</strong></div>
                <div><span>Categorías detectadas</span><strong>{new Set(items.map((item) => item.draftCategory.trim()).filter(Boolean)).size}</strong></div>
                <div><span>Imágenes procesadas</span><strong>{items.length}</strong></div>
                <div><span>Tiempo total</span><strong>{elapsedText}</strong></div>
              </div>

              <div className="catalog-ai-wizard__notice is-success">
                <span>✓</span>
                <div><strong>La aprobación fue respetada</strong><p>Solo se insertaron los {publishedProductIds.length} productos que seleccionaste.</p></div>
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
      </section>
    </div>
  );
};
