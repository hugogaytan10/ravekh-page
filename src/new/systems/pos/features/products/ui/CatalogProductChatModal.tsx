import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { ChangeEvent, FormEvent } from "react";
import type { PersistedPosSession } from "../../../shared/config/posSessionRuntime";
import {
  compressProductImage,
  PRODUCT_IMAGE_ACCEPTED_TYPES,
} from "../../../shared/api/productImageCompression";
import {
  CatalogProductChatApi,
  CatalogProductChatApiError,
  isCatalogProductChatAuthError,
  isCatalogProductChatGoneError,
} from "../api/CatalogProductChatApi";
import type {
  CatalogProductChatMessage,
  CatalogProductChatResponse,
  CatalogProductChatSession,
} from "../api/CatalogProductChatApi";
import { CatalogAiSessionRefreshModal } from "./CatalogAiSessionRefreshModal";
import "./CatalogProductChatModal.css";

const DEFAULT_API_URL = "http://localhost:8092";
const MAX_IMAGES_FALLBACK = 5;

const configuredApiUrl = String(
  import.meta.env.VITE_CATALOG_PRODUCT_CHAT_API_URL ?? DEFAULT_API_URL,
).trim();

const CATALOG_PRODUCT_CHAT_API_URL = configuredApiUrl || DEFAULT_API_URL;

type BusyAction =
  | "starting"
  | "uploading"
  | "sending"
  | "confirming"
  | "cancelling"
  | null;

type UploadedPreview = {
  clientAssetId: string;
  secureUrl: string;
  name: string;
};

type CatalogProductChatModalProps = {
  open: boolean;
  businessId: number;
  token: string;
  onClose: () => void;
  onSessionRefreshed: (token: string) => Promise<void> | void;
  onCompleted: (result: { productId: number }) => Promise<void> | void;
};

const fieldLabels: Record<string, string> = {
  name: "nombre",
  description: "descripción",
  price: "precio",
  stock: "existencias",
  wholesaleEnabled: "si manejará mayoreo",
  wholesalePrice: "precio de mayoreo",
  wholesaleMinQuantity: "piezas mínimas de mayoreo",
};

const messageTime = new Intl.DateTimeFormat("es-MX", {
  hour: "2-digit",
  minute: "2-digit",
});

const errorText = (cause: unknown): string => {
  if (cause instanceof CatalogProductChatApiError) return cause.message;
  if (cause instanceof Error && cause.message.trim()) return cause.message;
  return "Ocurrió un error inesperado. Intenta nuevamente.";
};

const storageKeyFor = (businessId: number): string =>
  `ravekh:catalog-product-chat:${businessId}`;

const createClientAssetId = (index: number): string =>
  `web-image-${Date.now()}-${index}-${Math.random().toString(16).slice(2, 10)}`;

const isActiveSession = (session: CatalogProductChatSession): boolean =>
  session.status === "ACTIVE" &&
  new Date(session.expiresAt).getTime() > Date.now();

export const CatalogProductChatModal = ({
  open,
  businessId,
  token,
  onClose,
  onSessionRefreshed,
  onCompleted,
}: CatalogProductChatModalProps) => {
  const [requestToken, setRequestToken] = useState(token);
  const [session, setSession] = useState<CatalogProductChatSession | null>(null);
  const [messages, setMessages] = useState<CatalogProductChatMessage[]>([]);
  const [uploadedPreviews, setUploadedPreviews] = useState<UploadedPreview[]>([]);
  const [messageDraft, setMessageDraft] = useState("");
  const [busyAction, setBusyAction] = useState<BusyAction>(null);
  const [uploadProgress, setUploadProgress] = useState({ current: 0, total: 0 });
  const [maxImages, setMaxImages] = useState(MAX_IMAGES_FALLBACK);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const initializingRef = useRef(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const chatEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setRequestToken(token);
  }, [token]);

  const api = useMemo(
    () => new CatalogProductChatApi(CATALOG_PRODUCT_CHAT_API_URL, requestToken),
    [requestToken],
  );

  const rememberSession = useCallback(
    (nextSession: CatalogProductChatSession) => {
      setSession(nextSession);
      if (isActiveSession(nextSession)) {
        window.localStorage.setItem(
          storageKeyFor(businessId),
          nextSession.sessionId,
        );
      } else {
        window.localStorage.removeItem(storageKeyFor(businessId));
      }
    },
    [businessId],
  );

  const appendMessage = useCallback((message: CatalogProductChatMessage) => {
    setMessages((current) =>
      current.some(({ messageId }) => messageId === message.messageId)
        ? current
        : [...current, message],
    );
  }, []);

  const resetLocalConversation = useCallback(() => {
    window.localStorage.removeItem(storageKeyFor(businessId));
    setSession(null);
    setMessages([]);
    setUploadedPreviews([]);
    setMessageDraft("");
    setUploadProgress({ current: 0, total: 0 });
    setMaxImages(MAX_IMAGES_FALLBACK);
  }, [businessId]);

  const finishCompletedConversation = useCallback(
    async (nextSession: CatalogProductChatSession): Promise<boolean> => {
      if (nextSession.status !== "COMPLETED" || !nextSession.productId) {
        return false;
      }
      const productId = nextSession.productId;
      resetLocalConversation();
      await onCompleted({ productId });
      return true;
    },
    [onCompleted, resetLocalConversation],
  );

  const consumeResponse = useCallback(
    async (response: CatalogProductChatResponse): Promise<boolean> => {
      rememberSession(response.session);
      appendMessage(response.assistantMessage);
      return finishCompletedConversation(response.session);
    },
    [appendMessage, finishCompletedConversation, rememberSession],
  );

  const showRequestError = useCallback((cause: unknown) => {
    if (isCatalogProductChatAuthError(cause)) {
      setAuthModalOpen(true);
      setError("Tu sesión expiró. Inicia sesión para continuar sin perder el avance.");
      return;
    }
    setError(errorText(cause));
  }, []);

  const initializeConversation = useCallback(
    async (client: CatalogProductChatApi = api) => {
      if (initializingRef.current || !businessId || !requestToken) return;
      initializingRef.current = true;
      setBusyAction("starting");
      setError(null);
      setNotice(null);

      try {
        const savedSessionId = window.localStorage.getItem(
          storageKeyFor(businessId),
        );

        if (savedSessionId) {
          try {
            const [{ session: savedSession }, { messages: savedMessages }] =
              await Promise.all([
                client.getSession(savedSessionId),
                client.listMessages(savedSessionId),
              ]);

            if (isActiveSession(savedSession)) {
              rememberSession(savedSession);
              setMessages(savedMessages);
              setNotice("Retomamos la conversación que dejaste pendiente.");
              return;
            }
            window.localStorage.removeItem(storageKeyFor(businessId));
          } catch (cause) {
            if (isCatalogProductChatAuthError(cause)) throw cause;
            if (!isCatalogProductChatGoneError(cause)) throw cause;
            window.localStorage.removeItem(storageKeyFor(businessId));
          }
        }

        const created = await client.createSession();
        rememberSession(created.session);
        setMessages([created.assistantMessage]);
      } catch (cause) {
        showRequestError(cause);
      } finally {
        initializingRef.current = false;
        setBusyAction(null);
      }
    },
    [api, businessId, rememberSession, requestToken, showRequestError],
  );

  useEffect(() => {
    if (!open || !businessId || !requestToken || session) return;
    void initializeConversation();
  }, [businessId, initializeConversation, open, requestToken, session]);

  useEffect(() => {
    if (!open) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyAction && !authModalOpen) onClose();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [authModalOpen, busyAction, onClose, open]);

  useEffect(() => {
    if (!open) return;
    chatEndRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
  }, [busyAction, messages, open, uploadedPreviews]);

  const handleRefreshedSession = async (refreshed: PersistedPosSession) => {
    setRequestToken(refreshed.token);
    await onSessionRefreshed(refreshed.token);
    setAuthModalOpen(false);
    setError(null);
    setNotice("Sesión renovada. Ya puedes continuar.");

    const refreshedApi = new CatalogProductChatApi(
      CATALOG_PRODUCT_CHAT_API_URL,
      refreshed.token,
    );
    if (session) {
      try {
        const [{ session: nextSession }, { messages: nextMessages }] =
          await Promise.all([
            refreshedApi.getSession(session.sessionId),
            refreshedApi.listMessages(session.sessionId),
          ]);
        rememberSession(nextSession);
        setMessages(nextMessages);
      } catch (cause) {
        if (isCatalogProductChatGoneError(cause)) {
          resetLocalConversation();
          await initializeConversation(refreshedApi);
          return;
        }
        showRequestError(cause);
      }
      return;
    }
    await initializeConversation(refreshedApi);
  };

  const refreshMessages = async (sessionId: string) => {
    const { messages: nextMessages } = await api.listMessages(sessionId);
    setMessages(nextMessages);
  };

  const handleFilesSelected = async (
    event: ChangeEvent<HTMLInputElement>,
  ) => {
    const selectedFiles = Array.from(event.target.files ?? []);
    event.target.value = "";
    if (!session || selectedFiles.length === 0) return;

    const remaining = Math.max(0, maxImages - session.imageCount);
    if (remaining === 0) {
      setError(`Ya agregaste el máximo de ${maxImages} imágenes.`);
      return;
    }

    const files = selectedFiles.slice(0, remaining);
    setError(
      selectedFiles.length > remaining
        ? `Solo se tomarán ${remaining} imagen(es) para no superar el límite.`
        : null,
    );
    setNotice(null);
    setBusyAction("uploading");
    setUploadProgress({ current: 0, total: files.length });

    try {
      const preparedUploads = await Promise.all(
        files.map(async (file, index) => {
          const prepared = await compressProductImage(file);
          return {
            clientAssetId: createClientAssetId(index),
            file: prepared.file,
            originalName: file.name,
          };
        }),
      );

      const result = await api.uploadImages(
        session.sessionId,
        preparedUploads.map(({ clientAssetId, file }) => ({
          clientAssetId,
          file,
        })),
        (current, total) => setUploadProgress({ current, total }),
      );

      setMaxImages(result.maxImages);
      setUploadedPreviews((current) => [
        ...current,
        ...result.uploadedImages.map((uploaded) => ({
          ...uploaded,
          name:
            preparedUploads.find(
              ({ clientAssetId }) => clientAssetId === uploaded.clientAssetId,
            )?.originalName ?? "Imagen del producto",
        })),
      ]);
      await consumeResponse(result);
      setNotice(
        `${files.length} imagen${files.length === 1 ? " agregada" : "es agregadas"}.`,
      );
    } catch (cause) {
      showRequestError(cause);
    } finally {
      setBusyAction(null);
      setUploadProgress({ current: 0, total: 0 });
    }
  };

  const handleSendMessage = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const text = messageDraft.trim();
    if (!session || !text || busyAction) return;

    setBusyAction("sending");
    setError(null);
    setNotice(null);
    const clientMessageId = `web-message-${Date.now()}-${Math.random()
      .toString(16)
      .slice(2, 10)}`;
    const optimisticMessage: CatalogProductChatMessage = {
      messageId: clientMessageId,
      role: "USER",
      type: "TEXT",
      text,
      intent: null,
      createdAt: new Date().toISOString(),
    };
    appendMessage(optimisticMessage);

    try {
      const response = await api.sendMessage(
        session.sessionId,
        text,
        clientMessageId,
      );
      setMessageDraft("");
      const completed = await consumeResponse(response);
      if (!completed) await refreshMessages(session.sessionId);
    } catch (cause) {
      setMessages((current) =>
        current.filter(({ messageId }) => messageId !== clientMessageId),
      );
      showRequestError(cause);
    } finally {
      setBusyAction(null);
    }
  };

  const handleConfirm = async () => {
    if (!session?.canConfirm || busyAction) return;
    setBusyAction("confirming");
    setError(null);
    try {
      const response = await api.confirm(session.sessionId);
      await consumeResponse(response);
    } catch (cause) {
      showRequestError(cause);
    } finally {
      setBusyAction(null);
    }
  };

  const handleCancel = async () => {
    if (!session || busyAction) return;
    const shouldCancel = window.confirm(
      "¿Cancelar esta conversación? El borrador no se convertirá en producto.",
    );
    if (!shouldCancel) return;

    setBusyAction("cancelling");
    setError(null);
    try {
      await api.cancel(session.sessionId);
      resetLocalConversation();
      onClose();
    } catch (cause) {
      showRequestError(cause);
    } finally {
      setBusyAction(null);
    }
  };

  if (!open) return null;

  const missingFields = session?.missingFields ?? [];
  const remainingImages = Math.max(
    0,
    maxImages - (session?.imageCount ?? 0),
  );
  const isBusy = busyAction !== null;

  return (
    <div
      className="catalog-product-chat__backdrop"
      role="presentation"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget && !isBusy) onClose();
      }}
    >
      <section
        className="catalog-product-chat__modal"
        role="dialog"
        aria-modal="true"
        aria-labelledby="catalog-product-chat-title"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <header className="catalog-product-chat__header">
          <div>
            <span className="catalog-product-chat__eyebrow">Asistente de catálogo</span>
            <h2 id="catalog-product-chat-title">Crear producto por chat</h2>
            <p>Envía fotos y datos del producto como si estuvieras chateando.</p>
          </div>
          <button
            type="button"
            className="catalog-product-chat__icon-button"
            aria-label="Cerrar asistente"
            onClick={onClose}
            disabled={isBusy}
          >
            ×
          </button>
        </header>

        <div className="catalog-product-chat__content">
          <main className="catalog-product-chat__conversation">
            <div className="catalog-product-chat__messages" aria-live="polite">
              {busyAction === "starting" ? (
                <div className="catalog-product-chat__empty">
                  <span className="catalog-product-chat__spinner" />
                  <p>Preparando una conversación segura…</p>
                </div>
              ) : null}

              {uploadedPreviews.length > 0 ? (
                <div className="catalog-product-chat__image-strip">
                  {uploadedPreviews.map((preview) => (
                    <img
                      key={preview.clientAssetId}
                      src={preview.secureUrl}
                      alt={preview.name}
                    />
                  ))}
                </div>
              ) : null}

              {messages.map((message) => (
                <article
                  key={message.messageId}
                  className={`catalog-product-chat__message is-${message.role.toLowerCase()}`}
                >
                  <div className="catalog-product-chat__avatar" aria-hidden="true">
                    {message.role === "USER" ? "Tú" : "✦"}
                  </div>
                  <div>
                    <p>{message.text ?? "Imagen agregada."}</p>
                    <time dateTime={message.createdAt}>
                      {messageTime.format(new Date(message.createdAt))}
                    </time>
                  </div>
                </article>
              ))}

              {busyAction === "sending" ? (
                <div className="catalog-product-chat__typing">
                  <span />
                  <span />
                  <span />
                  El asistente está escribiendo
                </div>
              ) : null}

              {busyAction === "uploading" ? (
                <div className="catalog-product-chat__uploading" role="status">
                  <span className="catalog-product-chat__spinner" />
                  <div>
                    <strong>Subiendo imágenes</strong>
                    <span>
                      {uploadProgress.current} de {uploadProgress.total}
                    </span>
                  </div>
                </div>
              ) : null}
              <div ref={chatEndRef} />
            </div>

            {notice ? (
              <p className="catalog-product-chat__notice" role="status">
                {notice}
              </p>
            ) : null}
            {error ? (
              <p className="catalog-product-chat__error" role="alert">
                {error}
              </p>
            ) : null}

            <div className="catalog-product-chat__quick-actions">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={!session || isBusy || remainingImages === 0}
              >
                + Agregar {session?.imageCount ? "otra foto" : "foto"}
              </button>
              {session?.state === "COLLECTING_DETAILS" ? (
                <button
                  type="button"
                  onClick={() =>
                    setMessageDraft(
                      "Nombre: \nDescripción: \nPrecio: \nExistencias: \n¿Mayoreo?: \nPrecio mayoreo: \nDesde cuántas piezas: ",
                    )
                  }
                  disabled={isBusy}
                >
                  Usar plantilla
                </button>
              ) : null}
            </div>

            <form
              className="catalog-product-chat__composer"
              onSubmit={handleSendMessage}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept={Array.from(PRODUCT_IMAGE_ACCEPTED_TYPES).join(",")}
                multiple
                hidden
                onChange={(event) => void handleFilesSelected(event)}
              />
              <textarea
                value={messageDraft}
                onChange={(event) => setMessageDraft(event.target.value)}
                placeholder="Ej. Blusa halter, tela licra, cuesta $103, tengo 25 piezas y mayoreo $92 desde 12 piezas…"
                rows={2}
                maxLength={4000}
                disabled={!session || isBusy}
                onKeyDown={(event) => {
                  if (event.key === "Enter" && !event.shiftKey) {
                    event.preventDefault();
                    event.currentTarget.form?.requestSubmit();
                  }
                }}
              />
              <button
                type="submit"
                disabled={!session || !messageDraft.trim() || isBusy}
                aria-label="Enviar mensaje"
              >
                Enviar
              </button>
            </form>
          </main>

          <aside className="catalog-product-chat__summary">
            <div className="catalog-product-chat__summary-head">
              <div>
                <span>Borrador actual</span>
                <strong>
                  {session?.canConfirm ? "Listo para crear" : "En progreso"}
                </strong>
              </div>
              <span
                className={`catalog-product-chat__status ${
                  session?.canConfirm ? "is-ready" : ""
                }`}
              >
                {session?.canConfirm ? "Completo" : "Borrador"}
              </span>
            </div>

            <dl className="catalog-product-chat__draft">
              <div>
                <dt>Nombre</dt>
                <dd>{session?.draft.name || "Pendiente"}</dd>
              </div>
              <div>
                <dt>Descripción</dt>
                <dd>{session?.draft.description || "Pendiente"}</dd>
              </div>
              <div>
                <dt>Precio</dt>
                <dd>
                  {session?.draft.price != null
                    ? `$${session.draft.price.toFixed(2)}`
                    : "Pendiente"}
                </dd>
              </div>
              <div>
                <dt>Existencias</dt>
                <dd>
                  {session?.draft.stock != null
                    ? `${session.draft.stock} pieza${session.draft.stock === 1 ? "" : "s"}`
                    : "No especificadas"}
                </dd>
              </div>
              <div>
                <dt>Mayoreo</dt>
                <dd>
                  {session?.draft.wholesaleEnabled == null
                    ? "Pendiente"
                    : session.draft.wholesaleEnabled
                      ? `$${session.draft.wholesalePrice?.toFixed(2) ?? "—"} desde ${session.draft.wholesaleMinQuantity ?? "—"} piezas`
                      : "No"}
                </dd>
              </div>
              <div>
                <dt>Imágenes</dt>
                <dd>
                  {session?.imageCount ?? 0} de {maxImages}
                </dd>
              </div>
            </dl>

            {missingFields.length > 0 ? (
              <div className="catalog-product-chat__missing">
                <strong>Falta por completar</strong>
                <ul>
                  {missingFields.map((field) => (
                    <li key={field}>{fieldLabels[field] ?? field}</li>
                  ))}
                </ul>
              </div>
            ) : (
              <p className="catalog-product-chat__ready-copy">
                Revisa el resumen y confirma para guardarlo en tu catálogo.
              </p>
            )}

            <div className="catalog-product-chat__summary-actions">
              <button
                type="button"
                className="is-primary"
                onClick={() => void handleConfirm()}
                disabled={!session?.canConfirm || isBusy}
              >
                {busyAction === "confirming"
                  ? "Creando producto…"
                  : "Confirmar y crear"}
              </button>
              <button
                type="button"
                className="is-danger"
                onClick={() => void handleCancel()}
                disabled={!session || isBusy}
              >
                {busyAction === "cancelling" ? "Cancelando…" : "Cancelar borrador"}
              </button>
            </div>
          </aside>
        </div>

        <CatalogAiSessionRefreshModal
          open={authModalOpen}
          expectedBusinessId={businessId}
          onContinueLater={() => {
            setAuthModalOpen(false);
            onClose();
          }}
          onRefreshed={handleRefreshedSession}
        />
      </section>
    </div>
  );
};
