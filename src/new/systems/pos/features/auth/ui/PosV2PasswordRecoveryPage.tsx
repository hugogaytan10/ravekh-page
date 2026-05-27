import { FormEvent, useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Eye } from "../../../../../../assets/POS/Eye";
import { EyeOff } from "../../../../../../assets/POS/EyeOff";
import { ModernSystemsFactory } from "../../../../../index";
import { getPosApiBaseUrl } from "../../../shared/config/posEnv";
import { POS_V2_PATHS } from "../../../routing/PosV2Paths";
import "./PosV2LoginPage.css";
import "./PosV2PasswordRecoveryPage.css";

const API_BASE_URL = getPosApiBaseUrl();

type SecurityQuestionOption = {
  id: unknown;
  text: string;
};

export const PosV2PasswordRecoveryPage = () => {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [selectedQuestionId, setSelectedQuestionId] = useState("");
  const [answer, setAnswer] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [questions, setQuestions] = useState<SecurityQuestionOption[]>([]);
  const [loadingQuestions, setLoadingQuestions] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  const authPage = useMemo(() => {
    const factory = new ModernSystemsFactory(API_BASE_URL);
    return factory.createPosAuthOnboardingPage();
  }, []);

  useEffect(() => {
    let isMounted = true;

    const loadQuestions = async () => {
      setLoadingQuestions(true);
      setError(null);

      try {
        const recoveryQuestions = await authPage.getPasswordRecoveryQuestions();
        if (!isMounted) {
          return;
        }

        setQuestions(recoveryQuestions);
        setSelectedQuestionId(recoveryQuestions[0] ? String(recoveryQuestions[0].id) : "");
      } catch (cause) {
        if (!isMounted) {
          return;
        }

        setError(cause instanceof Error ? cause.message : "No se pudieron cargar las preguntas de seguridad.");
      } finally {
        if (isMounted) {
          setLoadingQuestions(false);
        }
      }
    };

    loadQuestions();

    return () => {
      isMounted = false;
    };
  }, [authPage]);

  const selectedQuestion = questions.find((question) => String(question.id) === selectedQuestionId);

  const handleRecoverySubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage(null);

    if (!selectedQuestion) {
      setError("Selecciona una pregunta de seguridad para continuar.");
      return;
    }

    if (!user.trim() || !answer.trim() || !password.trim() || !confirmPassword.trim()) {
      setError("Completa usuario, pregunta, respuesta y nueva contraseña.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden.");
      return;
    }

    setSubmitting(true);

    try {
      await authPage.comparePasswordRecoveryAnswers(
        {
          questionId: selectedQuestion.id,
          answer: answer.trim(),
          password,
        },
        user.trim(),
      );

      setSuccessMessage("Tu contraseña fue actualizada. Ya puedes iniciar sesión con tus nuevos datos.");
      setAnswer("");
      setPassword("");
      setConfirmPassword("");
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : "No se pudo recuperar la contraseña.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="pos-v2-auth-page pos-v2-recovery-page">
      <section className="pos-v2-recovery-card" aria-labelledby="password-recovery-title">
        <div className="pos-v2-recovery-hero">
          <span className="pos-v2-recovery-eyebrow">Punto de venta Ravekh</span>
          <h1 id="password-recovery-title">Recupera tu contraseña</h1>
          <p>
            Selecciona tu pregunta de seguridad, confirma tu respuesta y define una nueva contraseña para volver a
            acceder a tu negocio.
          </p>
        </div>

        <form className="pos-v2-recovery-form" onSubmit={handleRecoverySubmit}>
          <div className="pos-v2-field">
            <label htmlFor="recovery-user" className="pos-v2-label">
              Usuario o correo
            </label>
            <input
              id="recovery-user"
              className="pos-v2-input"
              type="text"
              placeholder="correo@negocio.com"
              value={user}
              autoComplete="username"
              onChange={(event) => {
                setUser(event.target.value);
                setError(null);
                setSuccessMessage(null);
              }}
              required
            />
          </div>

          <div className="pos-v2-field">
            <label htmlFor="recovery-question" className="pos-v2-label">
              Pregunta de seguridad
            </label>
            <select
              id="recovery-question"
              className="pos-v2-input pos-v2-select"
              value={selectedQuestionId}
              onChange={(event) => {
                setSelectedQuestionId(event.target.value);
                setError(null);
                setSuccessMessage(null);
              }}
              disabled={loadingQuestions || questions.length === 0}
              required
            >
              {loadingQuestions ? <option value="">Cargando preguntas...</option> : null}
              {!loadingQuestions && questions.length === 0 ? <option value="">Sin preguntas disponibles</option> : null}
              {questions.map((question) => (
                <option key={String(question.id)} value={String(question.id)}>
                  {question.text}
                </option>
              ))}
            </select>
          </div>

          <div className="pos-v2-field">
            <label htmlFor="recovery-answer" className="pos-v2-label">
              Respuesta
            </label>
            <input
              id="recovery-answer"
              className="pos-v2-input"
              type="text"
              placeholder="Tu respuesta de seguridad"
              value={answer}
              autoComplete="off"
              onChange={(event) => {
                setAnswer(event.target.value);
                setError(null);
                setSuccessMessage(null);
              }}
              required
            />
          </div>

          <div className="pos-v2-recovery-grid">
            <div className="pos-v2-field">
              <label htmlFor="recovery-password" className="pos-v2-label">
                Nueva contraseña
              </label>
              <div className="pos-v2-password-input-wrap">
                <input
                  id="recovery-password"
                  className="pos-v2-input pos-v2-password-input"
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  value={password}
                  autoComplete="new-password"
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  required
                />
                <button
                  type="button"
                  className="pos-v2-password-visibility-btn"
                  aria-label={showPassword ? "Ocultar nueva contraseña" : "Ver nueva contraseña"}
                  aria-pressed={showPassword}
                  onClick={() => setShowPassword((currentValue) => !currentValue)}
                >
                  {showPassword ? (
                    <EyeOff width={20} height={20} strokeColor="#6d01d1" fillColor="#6d01d1" />
                  ) : (
                    <Eye width={20} height={20} strokeColor="#6d01d1" />
                  )}
                </button>
              </div>
            </div>

            <div className="pos-v2-field">
              <label htmlFor="recovery-confirm-password" className="pos-v2-label">
                Confirmar contraseña
              </label>
              <div className="pos-v2-password-input-wrap">
                <input
                  id="recovery-confirm-password"
                  className="pos-v2-input pos-v2-password-input"
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="********"
                  value={confirmPassword}
                  autoComplete="new-password"
                  onChange={(event) => {
                    setConfirmPassword(event.target.value);
                    setError(null);
                    setSuccessMessage(null);
                  }}
                  required
                />
                <button
                  type="button"
                  className="pos-v2-password-visibility-btn"
                  aria-label={
                    showConfirmPassword ? "Ocultar confirmación de contraseña" : "Ver confirmación de contraseña"
                  }
                  aria-pressed={showConfirmPassword}
                  onClick={() => setShowConfirmPassword((currentValue) => !currentValue)}
                >
                  {showConfirmPassword ? (
                    <EyeOff width={20} height={20} strokeColor="#6d01d1" fillColor="#6d01d1" />
                  ) : (
                    <Eye width={20} height={20} strokeColor="#6d01d1" />
                  )}
                </button>
              </div>
            </div>
          </div>

          {error ? <span className="pos-v2-error pos-v2-recovery-message">{error}</span> : null}
          {successMessage ? <span className="pos-v2-success pos-v2-recovery-message">{successMessage}</span> : null}

          <button
            type="submit"
            className="pos-v2-btn pos-v2-recovery-submit"
            disabled={submitting || loadingQuestions}
          >
            {submitting ? "Actualizando..." : "Actualizar contraseña"}
          </button>

          <button type="button" className="pos-v2-recovery-back" onClick={() => navigate(POS_V2_PATHS.login)}>
            Volver a iniciar sesión
          </button>
        </form>
      </section>
    </div>
  );
};
