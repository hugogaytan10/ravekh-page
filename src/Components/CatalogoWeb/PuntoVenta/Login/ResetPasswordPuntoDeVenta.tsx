import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronBack } from "../../../../assets/POS/ChevronBack";
import { ThemeLight } from "../Theme/Theme";
import { SearchSelect } from "../Utilities/SearchSelect";
import {
  compareQuestionsServer,
  getQuestions,
} from "./Peticiones";

type QuestionType = {
  Id: string;
  Name?: string;
  Question?: string;
};

type CompareResponse = {
  Status?: boolean;
  status?: boolean;
  Message?: string;
  message?: string;
};

export const PasswordRecovery: React.FC = () => {
  const navigate = useNavigate();

  const [email, setEmail] = useState("");
  const [focusEmail, setFocusEmail] = useState(false);

  const [password, setPassword] = useState("");
  const [focusPassword, setFocusPassword] = useState(false);
  const [showPassword, setShowPassword] = useState(true);

  const [questions, setQuestions] = useState<QuestionType[]>([]);
  const [selectedQuestion, setSelectedQuestion] = useState<QuestionType | null>(
    null
  );

  const [answer, setAnswer] = useState("");
  const [focusAnswer, setFocusAnswer] = useState(false);

  const [modalVisible, setModalVisible] = useState(false);
  const [modalMessage, setModalMessage] = useState("");

  const handleTextChange = (
    value: string,
    setter: React.Dispatch<React.SetStateAction<string>>,
    maximo: number
  ) => {
    const emojiRegex = /[\uD83C-\uDBFF\uDC00-\uDFFF]+/g;

    if (value.length <= maximo && !emojiRegex.test(value)) {
      setter(value);
    }
  };

  const compareQuestions = async () => {
    if (!email || !password || !selectedQuestion || !answer) {
      setModalMessage("Todos los campos son requeridos");
      setModalVisible(true);
      return;
    }

    try {
      const body = {
        Question_Id: selectedQuestion.Id,
        Answer: answer,
        Password: password,
      };

      const responseAnswer: CompareResponse = await compareQuestionsServer(
        body,
        email
      );

      if (responseAnswer.Status || responseAnswer.status) {
        const newPassword = {
          Password: password,
        };

        setModalMessage(
          responseAnswer.Message ||
            responseAnswer.message ||
            "Contraseña actualizada correctamente"
        );
        setModalVisible(true);

        setTimeout(() => {
          navigate(-1);
        }, 2000);
      } else {
        setModalMessage(
          responseAnswer.Message ||
            responseAnswer.message ||
            "No fue posible validar la información"
        );
        setModalVisible(true);
      }
    } catch (error) {
      console.error("Error al recuperar contraseña:", error);
      setModalMessage("Ocurrió un error al recuperar la contraseña");
      setModalVisible(true);
    }
  };

  useEffect(() => {
    const loadQuestions = async () => {
      try {
        const data = await getQuestions();
        setQuestions(data || []);
      } catch (error) {
        console.error("Error loading questions:", error);
      }
    };

    loadQuestions();
  }, []);

  const mappedQuestions = useMemo(
    () =>
      questions.map((item) => ({
        ...item,
        Name: item.Name || item.Question || "",
      })),
    [questions]
  );

  return (
    <div className="min-h-screen bg-white">

      <button
        type="button"
        onClick={() => navigate(-1)}
        className="flex w-full items-center gap-2 rounded-b-[20px] px-4 py-3"
        style={{ backgroundColor: ThemeLight.primaryColor }}
      >
        <ChevronBack width={30} height={30} strokeColor="#fff" />
        <span className="text-xl font-bold text-white">
          Recuperar contraseña
        </span>
      </button>

      <div className="flex min-h-[calc(100vh-60px)] items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div
            className={`relative mt-3 mb-5 flex items-center justify-between rounded-lg border bg-white px-4 pt-2 ${
              focusEmail ? "border-[var(--primary)]" : "border-[var(--border)]"
            }`}
            style={
              {
                "--primary": ThemeLight.primaryColor,
                "--border": ThemeLight.borderColor,
              } as React.CSSProperties
            }
          >
            <input
              type="email"
              autoComplete="email"
              placeholder="Ravekh@gmail.com"
              value={email}
              onChange={(e) => handleTextChange(e.target.value, setEmail, 44)}
              onFocus={() => setFocusEmail(true)}
              onBlur={() => setFocusEmail(false)}
              className="h-11 w-full bg-transparent text-base font-semibold outline-none placeholder:text-gray-400"
              style={{ color: ThemeLight.primaryColor }}
            />

            <div className="absolute -top-3 left-4 bg-white px-1">
              <span
                className="text-base font-semibold"
                style={{
                  color: focusEmail
                    ? ThemeLight.primaryColor
                    : ThemeLight.borderColor,
                }}
              >
                Email
              </span>
            </div>
          </div>

          <div
            className={`relative mt-3 mb-5 flex items-center justify-between rounded-lg border bg-white px-4 pt-2 ${
              focusPassword
                ? "border-[var(--primary)]"
                : "border-[var(--border)]"
            }`}
            style={
              {
                "--primary": ThemeLight.primaryColor,
                "--border": ThemeLight.borderColor,
              } as React.CSSProperties
            }
          >
            <input
              type={showPassword ? "password" : "text"}
              autoComplete="new-password"
              placeholder="******"
              value={password}
              onChange={(e) =>
                handleTextChange(e.target.value, setPassword, 44)
              }
              onFocus={() => setFocusPassword(true)}
              onBlur={() => setFocusPassword(false)}
              className="h-11 w-full bg-transparent text-base font-semibold outline-none placeholder:text-gray-400"
              style={{ color: ThemeLight.primaryColor }}
            />

            <button
              type="button"
              onClick={() => setShowPassword((prev) => !prev)}
              className="ml-2 flex items-center justify-center p-2"
            >
            </button>

            <div className="absolute -top-3 left-4 bg-white px-1">
              <span
                className="text-base font-semibold"
                style={{
                  color: focusPassword
                    ? ThemeLight.primaryColor
                    : ThemeLight.borderColor,
                }}
              >
                Contraseña
              </span>
            </div>
          </div>

          <div className="mb-5 w-full">
            <SearchSelect<QuestionType>
              dataSelect={mappedQuestions}
              setGruop={setSelectedQuestion}
              update={false}
              labelSelect="Pregunta de Seguridad"
              labelSeach="Buscar Pregunta"
              className="w-full"
            />
          </div>

          <div
            className={`relative mt-3 mb-5 flex items-center justify-between rounded-lg border bg-white px-4 pt-2 ${
              focusAnswer ? "border-[var(--primary)]" : "border-[var(--border)]"
            }`}
            style={
              {
                "--primary": ThemeLight.primaryColor,
                "--border": ThemeLight.borderColor,
              } as React.CSSProperties
            }
          >
            <input
              type="text"
              placeholder="Respuesta"
              value={answer}
              onChange={(e) => {
                const value = e.target.value;
                if (value.length > 44) return;
                setAnswer(value);
              }}
              onFocus={() => setFocusAnswer(true)}
              onBlur={() => setFocusAnswer(false)}
              className="h-11 w-full bg-transparent text-base font-semibold outline-none placeholder:text-gray-400"
              style={{ color: ThemeLight.primaryColor }}
            />

            <div className="absolute -top-3 left-4 bg-white px-1">
              <span
                className="text-base font-semibold"
                style={{
                  color: focusAnswer
                    ? ThemeLight.primaryColor
                    : ThemeLight.borderColor,
                }}
              >
                Respuesta
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={compareQuestions}
            className="w-full rounded-lg py-3 text-center text-xl font-semibold text-white"
            style={{ backgroundColor: ThemeLight.primaryColor }}
          >
            Recuperar
          </button>
        </div>
      </div>

      {modalVisible && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/50 px-4">
          <div className="w-full max-w-sm rounded-xl bg-white p-5 text-center shadow-lg">
            <p className="mb-5 text-base text-gray-700">{modalMessage}</p>

            <button
              type="button"
              onClick={() => setModalVisible(false)}
              className="rounded-lg px-5 py-2.5 text-white"
              style={{ backgroundColor: ThemeLight.secondaryColor }}
            >
              Cerrar
            </button>
          </div>
        </div>
      )}
    </div>
  );
};