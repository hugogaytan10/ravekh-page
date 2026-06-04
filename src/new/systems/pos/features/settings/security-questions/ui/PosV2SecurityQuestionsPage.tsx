import { FormEvent, useEffect, useMemo, useState } from "react";
import { PosV2Shell } from "../../../../shared/ui/PosV2Shell";
import { getPosApiBaseUrl } from "../../../../shared/config/posEnv";
import { readPosSessionSnapshot } from "../../../../shared/config/posSession";
import "./PosV2SecurityQuestionsPage.css";

const API_BASE_URL = getPosApiBaseUrl();

type SecurityQuestionOption = {
  id: unknown;
  text: string;
};

type SecurityQuestionResponse = {
  Id?: unknown;
  Question_Id?: unknown;
  Question?: string;
  Description?: string;
  Name?: string;
  Text?: string;
};

type UserSecurityQuestionsResponse =
  | SecurityQuestionResponse[]
  | null
  | { Questions?: SecurityQuestionResponse[]; questions?: SecurityQuestionResponse[] };

type QuestionsResponse =
  | SecurityQuestionResponse[]
  | { Questions?: SecurityQuestionResponse[]; questions?: SecurityQuestionResponse[] };

const toSecurityQuestion = (question: SecurityQuestionResponse): SecurityQuestionOption | null => {
  const id = question.Id ?? question.Question_Id;
  const text = question.Question ?? question.Description ?? question.Name ?? question.Text ?? "";

  if (id === undefined || id === null || !text.trim()) {
    return null;
  }

  return { id, text };
};

const toQuestionList = (payload: QuestionsResponse | UserSecurityQuestionsResponse): SecurityQuestionOption[] => {
  if (!payload) return [];

  const questions = Array.isArray(payload)
    ? payload
    : payload.Questions ?? payload.questions ?? [];

  return questions
    .map(toSecurityQuestion)
    .filter((question): question is SecurityQuestionOption => question !== null);
};

const requestJson = async <TResponse,>(path: string, token: string, init?: RequestInit): Promise<TResponse> => {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers.Authorization = `Bearer ${token}`;
    headers.token = token;
  }

  const response = await fetch(new URL(path, API_BASE_URL).toString(), {
    ...init,
    headers: {
      ...headers,
      ...(init?.headers as Record<string, string> | undefined),
    },
  });
  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error((payload as { message?: string } | null)?.message ?? `Request failed: ${response.status}`);
  }

  return payload as TResponse;
};

export const PosV2SecurityQuestionsPage = () => {
  const session = useMemo(() => readPosSessionSnapshot(), []);
  const [existingQuestions, setExistingQuestions] = useState<SecurityQuestionOption[]>([]);
  const [questions, setQuestions] = useState<SecurityQuestionOption[]>([]);
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [selectedExistingQuestionId, setSelectedExistingQuestionId] = useState("");
  const [answer, setAnswer] = useState("");
  const [existingAnswer, setExistingAnswer] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [email, setEmail] = useState(session.email);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;

    const loadSecurityQuestionState = async () => {
      setLoading(true);
      setError(null);
      setSuccessMessage(null);

      try {
        const userQuestionsPayload = await requestJson<UserSecurityQuestionsResponse>(
          `questions/user/${session.employeeId}`,
          session.token,
          { method: "GET" },
        );

        if (!isMounted) return;

        const configuredQuestions = toQuestionList(userQuestionsPayload);

        if (configuredQuestions.length > 0) {
          setExistingQuestions(configuredQuestions);
          setQuestions([]);
          setSelectedQuestionId("");
          setSelectedExistingQuestionId(String(configuredQuestions[0].id));
          return;
        }

        const questionsPayload = await requestJson<QuestionsResponse>("questions", session.token, { method: "GET" });
        if (!isMounted) return;

        const availableQuestions = toQuestionList(questionsPayload);

        setExistingQuestions([]);
        setQuestions(availableQuestions);
        setSelectedQuestionId(availableQuestions[0] ? String(availableQuestions[0].id) : "");
        setSelectedExistingQuestionId("");
      } catch (cause) {
        if (!isMounted) return;
        setError(cause instanceof Error ? cause.message : "No se pudo cargar la configuración de seguridad.");
      } finally {
        if (isMounted) setLoading(false);
      }
    };

    loadSecurityQuestionState();

    return () => {
      isMounted = false;
    };
  }, [session.employeeId, session.token]);

  const selectedQuestion = questions.find((question) => String(question.id) === selectedQuestionId);
  const selectedExistingQuestion = existingQuestions.find(
    (question) => String(question.id) === selectedExistingQuestionId,
  ) ?? existingQuestions[0];
  const hasExistingQuestions = existingQuestions.length > 0;

  const handleCreateSecurityAnswer = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedQuestion) {
      setError("Selecciona una pregunta de seguridad para continuar.");
      return;
    }

    if (!answer.trim()) {
      setError("Escribe la respuesta de seguridad para guardar la configuración.");
      return;
    }

    if (!session.employeeId) {
      setError("No se encontró el usuario de la sesión actual.");
      return;
    }

    setSubmitting(true);

    try {
      await requestJson<Record<string, unknown>>("passwordanswers", session.token, {
        method: "POST",
        body: JSON.stringify({
          Question_Id: selectedQuestion.id,
          User_Id: session.employeeId,
          Answer: answer.trim(),
        }),
      });

      setExistingQuestions([selectedQuestion]);
      setSelectedExistingQuestionId(String(selectedQuestion.id));
      setQuestions([]);
      setAnswer("");
      setSuccessMessage("Pregunta de seguridad guardada correctamente.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo guardar la pregunta de seguridad.");
    } finally {
      setSubmitting(false);
    }
  };

  const handleExistingQuestionSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedExistingQuestion) {
      setError("No se encontró la pregunta de seguridad configurada.");
      return;
    }

    if (!email.trim() || !existingAnswer.trim() || !newPassword.trim()) {
      setError("Completa correo, respuesta y nueva contraseña para continuar.");
      return;
    }

    setSubmitting(true);

    try {
      await requestJson<Record<string, unknown>>(
        `comparepasswordanswers/${encodeURIComponent(email.trim())}`,
        session.token,
        {
          method: "POST",
          body: JSON.stringify({
            Question_Id: selectedExistingQuestion.id,
            Answer: existingAnswer.trim(),
            Password: newPassword,
          }),
        },
      );

      setExistingAnswer("");
      setNewPassword("");
      setSuccessMessage("Respuesta validada correctamente. La contraseña fue actualizada.");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "La respuesta de seguridad es incorrecta.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <PosV2Shell
      title="Preguntas de seguridad"
      subtitle="Configura la pregunta que ayudará a validar la recuperación de contraseña del usuario actual."
    >
      <section className="pos-v2-security-questions" aria-labelledby="security-questions-title">
        <header className="pos-v2-security-questions__header">
          <span>Configuración</span>
          <h2 id="security-questions-title">Pregunta de seguridad</h2>
          <p>
            Primero validamos si el usuario ya cuenta con preguntas registradas. Si ya existe una pregunta, pedimos
            respuesta y nueva contraseña; si no existe, mostramos las preguntas disponibles para guardar una respuesta.
          </p>
        </header>

        {loading ? (
          <article className="pos-v2-security-questions__card">
            <p>Cargando configuración de seguridad...</p>
          </article>
        ) : null}

        {!loading && hasExistingQuestions ? (
          <form
            className="pos-v2-security-questions__card pos-v2-security-questions__card--success"
            onSubmit={handleExistingQuestionSubmit}
          >
            <span>Pregunta configurada</span>
            <h3>Responde tu pregunta para actualizar contraseña</h3>

            <div className="pos-v2-security-questions__field">
              <label htmlFor="configured-security-question">Pregunta configurada</label>
              <select
                id="configured-security-question"
                value={selectedExistingQuestion ? String(selectedExistingQuestion.id) : ""}
                onChange={(event) => {
                  setSelectedExistingQuestionId(event.target.value);
                  setError(null);
                  setSuccessMessage(null);
                }}
                disabled={existingQuestions.length <= 1}
                required
              >
                {existingQuestions.map((question) => (
                  <option key={String(question.id)} value={String(question.id)}>
                    {question.text}
                  </option>
                ))}
              </select>
            </div>

            <div className="pos-v2-security-questions__field">
              <label htmlFor="configured-security-email">Correo del usuario</label>
              <input
                id="configured-security-email"
                type="email"
                value={email}
                placeholder="correo@negocio.com"
                autoComplete="email"
                onChange={(event) => {
                  setEmail(event.target.value);
                  setError(null);
                  setSuccessMessage(null);
                }}
                required
              />
            </div>

            <div className="pos-v2-security-questions__field">
              <label htmlFor="configured-security-answer">Respuesta</label>
              <input
                id="configured-security-answer"
                type="text"
                value={existingAnswer}
                placeholder="Respuesta de seguridad"
                autoComplete="off"
                onChange={(event) => {
                  setExistingAnswer(event.target.value);
                  setError(null);
                  setSuccessMessage(null);
                }}
                required
              />
            </div>

            <div className="pos-v2-security-questions__field">
              <label htmlFor="configured-security-password">Nueva contraseña</label>
              <input
                id="configured-security-password"
                type="password"
                value={newPassword}
                placeholder="********"
                autoComplete="new-password"
                onChange={(event) => {
                  setNewPassword(event.target.value);
                  setError(null);
                  setSuccessMessage(null);
                }}
                required
              />
            </div>

            {error ? <p className="pos-v2-security-questions__error">{error}</p> : null}
            {successMessage ? <p className="pos-v2-security-questions__success">{successMessage}</p> : null}

            <button type="submit" disabled={submitting}>
              {submitting ? "Validando..." : "Validar respuesta y actualizar contraseña"}
            </button>
          </form>
        ) : null}

        {!loading && !hasExistingQuestions ? (
          <form className="pos-v2-security-questions__card" onSubmit={handleCreateSecurityAnswer}>
            <div className="pos-v2-security-questions__field">
              <label htmlFor="security-question">Pregunta de seguridad</label>
              <select
                id="security-question"
                value={selectedQuestionId}
                onChange={(event) => {
                  setSelectedQuestionId(event.target.value);
                  setError(null);
                  setSuccessMessage(null);
                }}
                disabled={questions.length === 0}
                required
              >
                {questions.length === 0 ? <option value="">Sin preguntas disponibles</option> : null}
                {questions.map((question) => (
                  <option key={String(question.id)} value={String(question.id)}>
                    {question.text}
                  </option>
                ))}
              </select>
            </div>

            <div className="pos-v2-security-questions__field">
              <label htmlFor="security-answer">Respuesta</label>
              <input
                id="security-answer"
                type="text"
                value={answer}
                placeholder="Escribe tu respuesta"
                autoComplete="off"
                onChange={(event) => {
                  setAnswer(event.target.value);
                  setError(null);
                  setSuccessMessage(null);
                }}
                required
              />
            </div>

            {error ? <p className="pos-v2-security-questions__error">{error}</p> : null}
            {successMessage ? <p className="pos-v2-security-questions__success">{successMessage}</p> : null}

            <button type="submit" disabled={submitting || questions.length === 0}>
              {submitting ? "Guardando..." : "Guardar pregunta de seguridad"}
            </button>
          </form>
        ) : null}
      </section>
    </PosV2Shell>
  );
};
