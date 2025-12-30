import React, { useContext, useEffect, useState, useRef } from "react";
import "./Login.css";
//import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { useNavigate } from "react-router-dom";
import { loginToServer, signUpToServer } from "./Peticiones";
import { jwtDecode } from "jwt-decode";
import { AppContext } from "../../Context/AppContext";
interface DecodedToken {
  name: string;
  email: string;
  picture: string;
}
export const AuthPage: React.FC = () => {
  const context = useContext(AppContext);
  const navigate = useNavigate();
  // variables para el control del login y errores
  const [errorUsuario, setErrorUsuario] = useState("");
  const [errorPassword, setErrorPassword] = useState("");

  // Referencias a los elementos del DOM
  const signUpButtonRef = useRef<HTMLButtonElement>(null);
  const signUpMobileButtonRef = useRef<HTMLButtonElement>(null);
  const signInMobileButtonRef = useRef<HTMLButtonElement>(null);
  const signInButtonRef = useRef<HTMLButtonElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const containerSignUpMobileRef = useRef<HTMLDivElement>(null);
  const containerSignUpRef = useRef<HTMLDivElement>(null);

  // Añadir event listeners al montar el componente
  useEffect(() => {
    const signUpButton = signUpButtonRef.current;
    const signUpMobileButton = signUpMobileButtonRef.current;
    const signInMobileButton = signInMobileButtonRef.current;
    const signInButton = signInButtonRef.current;
    const container = containerRef.current;
    const containerSignUpMobile = containerSignUpMobileRef.current;
    const containerSignUp = containerSignUpRef.current;

    const handleSignUpClick = () => {
      container?.classList.add("right-panel-active");
    };

    const handleSignUpMobileClick = () => {
      containerSignUpMobile?.classList.add("hidden-sign-in");
      containerSignUp?.classList.add("show-sign-in");
      if (window.innerWidth > 768) {
        container?.classList.add("right-panel-active");
      }
    };

    const handleSignInMobileClick = () => {
      containerSignUpMobile?.classList.remove("hidden-sign-in");
      containerSignUp?.classList.remove("show-sign-in");
      if (window.innerWidth > 768) {
        container?.classList.remove("right-panel-active");
      }
    };

    const handleSignInClick = () => {
      container?.classList.remove("right-panel-active");
    };

    signUpButton?.addEventListener("click", handleSignUpClick);
    signUpMobileButton?.addEventListener("click", handleSignUpMobileClick);
    signInMobileButton?.addEventListener("click", handleSignInMobileClick);
    signInButton?.addEventListener("click", handleSignInClick);

    // Limpiar listeners al desmontar
    return () => {
      signUpButton?.removeEventListener("click", handleSignUpClick);
      signUpMobileButton?.removeEventListener("click", handleSignUpMobileClick);
      signInMobileButton?.removeEventListener("click", handleSignInMobileClick);
      signInButton?.removeEventListener("click", handleSignInClick);
    };
  }, []);

  const creatAccount = async (e) => {
    e.preventDefault();
    const name = e.target[0].value;
    const email = e.target[1].value;
    const password = e.target[2].value;
    if (name && email && password) {
      const dataSignUp = await signUpToServer(name, email, password);
      if (dataSignUp) {
        //si todo fue cvalido guardar el correo y contraseña en el localstorage
        //como un objeto user
        localStorage.setItem("user", JSON.stringify({ email, password }));
        context.setUser(dataSignUp);
        /*console.log("data inicio: ", dataSignUp);
        console.log("setUser: ", context.user);*/
        navigate("/");
      }
    }
  };

  const login = async (e) => {
    e.preventDefault();
    const email = e.target[0].value;
    const password = e.target[1].value;
    const dataLogin = await loginToServer(email, password);
    if (dataLogin.message === "Ocurrió un error al iniciar sesión.") {
      setErrorUsuario("Revise sus datos");
      setErrorPassword("Revise sus datos");
    } else {
      //como un objeto user
      localStorage.setItem("user", JSON.stringify({ email, password }));
      context.setUser(dataLogin);
      context.setShowNavBarBottom(true);
      navigate("/MainSales");
    
    }
  };
  /*
  const responseMessage = async (response: CredentialResponse) => {
    if (response.credential) {
      const token = response.credential;
      try {
        const decoded: DecodedToken = jwtDecode(token);
        const dataLogin = await loginToServer(decoded.email, null);
        if (!dataLogin) {
          const dataSignUp = await signUpToServer(
            decoded.name,
            decoded.email,
            ""
          );
          const user = await loginToServer(decoded.email, null);
          context.setUser(user);
        }
        context.setUser(dataLogin);
        navigate("/");
      } catch (error) {
        console.error("Error decoding token: ", error);
      }
    }
  };
  const errorMessage = (error) => {
    console.log(error);
  };
  */
  useEffect(() => {
    //verificamos si contamos con un usuario en el localstorage
    const user = localStorage.getItem("user");
    if (user) {
      const { email, password } = JSON.parse(user);
      loginToServer(email, password).then((data) => {
        if (data.message) {
          localStorage.removeItem("user");
        } else {
          context.setUser(data);
          context.setShowNavBarBottom(true);
          navigate("/MainSales");
        }
      });
    }
  }, []);
  return (
    <div className="w-full h-screen flex justify-center items-center">
      <div className="container" id="container" ref={containerRef}>
        <div
          className="form-container sign-up-container"
          id="sign-up-container"
          ref={containerSignUpRef}
        >
          <form
            action="#"
            className="w-full form-login"
            onSubmit={(e) => {
              creatAccount(e);
            }}
          >
            <h1>Crear Cuenta</h1>
            {/*
               <div className="social-container">
                <GoogleLogin onSuccess={responseMessage} />{" "}
              </div>
              */}

            <span>Usa tu correo para registrarte</span>
            <input type="text" placeholder="Nombre" className="input-login" />
            <input type="email" placeholder="Correo" className="input-login" />
            <input
              type="password"
              placeholder="Contraseña"
              className="input-login"
            />
            <button className="btn-login">Registrarme</button>
            <button
              className="btn-crear-cuenta"
              id="signIn-Mobile"
              ref={signInMobileButtonRef}
            >
              Tengo Cuenta
            </button>
          </form>
        </div>
        <div
          className="form-container sign-in-container"
          id="sign-in-container"
          ref={containerSignUpMobileRef}
        >
          <form
            action="#"
            className="form-login"
            onSubmit={(e) => {
              login(e);
            }}
          >
            <h1>Iniciar Sesión</h1>
            {/*
               <div className="social-container">
                <GoogleLogin onSuccess={responseMessage} />
              </div>
              */}

            <span>Usa tu cuenta</span>
            <input
              type="email"
              placeholder="Correo"
              className="input-login"
              onChange={(e) => {
                setErrorUsuario("");
              }}
            />
            {errorUsuario != "" && (
              <span className="text-red-500 text-xs self-start">
                {errorUsuario}
              </span>
            )}
            <input
              type="password"
              placeholder="Contraseña"
              className="input-login"
              onChange={(e) => {
                setErrorPassword("");
              }}
            />
            {errorPassword != "" && (
              <span className="text-red-500 text-xs self-start">
                {errorPassword}
              </span>
            )}
            <a href="#" className="self-end text-xs mt-2 mb-2">
              Olvidaste tu contraseña?
            </a>
            <button className="btn-login mt-2">Iniciar Sesión</button>
            {/*<button
              className="btn-crear-cuenta mt-3"
              id="signUp-Mobile"
              ref={signUpMobileButtonRef}
            >
              Crear Cuenta
            </button>*/}
          </form>
        </div>
        <div className="overlay-container">
          <div className="overlay">
            <div className="overlay-panel overlay-left">
              <h2>Hola de Nuevo!</h2>
              <p className="mt-2">
                Para seguir conectado con nosotros por favor inicia sesión con
                tus datos personales
              </p>
              <button
                className="ghost btn-login mt-2"
                id="signIn"
                ref={signInButtonRef}
              >
                Inicio de Sesión
              </button>
            </div>
            <div className="overlay-panel overlay-right">
              <h2>Hola, Bienvenido</h2>
              <p className="mt-2">Ingresa tus datos y comienza a comprar</p>
              {/*<button
                className="ghost btn-login mt-2"
                id="signUp"
                ref={signUpButtonRef}
              >
                Crear Cuenta
              </button>*/}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
