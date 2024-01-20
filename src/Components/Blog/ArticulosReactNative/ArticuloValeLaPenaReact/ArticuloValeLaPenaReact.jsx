import React from "react";
import "./estilosValeLaPena.css";
import calendario from "./imgs/calendario.png";
import capturas from "./imgs/capturas.png";
import  comparativa from "./imgs/comparativa.png";
import conclusion from "./imgs/conclusion.png";
import problemas from "./imgs/problemas.png";
export const ArticuloValeLaPenaReact = () => {
  return (
    <div className="min-h-screen w-full flex justify-center">
      <div className="w-3/4 bg-gray-100 p-5">
        <h2 className="text-2xl text-center font-bold">
          ¿Vale la Pena React Native en 2024?
        </h2>
        <section>
          <h3 className="pl-2 text-xl mb-4">Introducción</h3>
          <img src={calendario} alt="React Native y el 2024" className="h-96 w-full object-contain rounded-md mb-20"/>
          <p className="mb-4">
            En la era del desarrollo móvil, la elección de la tecnología
            adecuada es crucial...
          </p>
        </section>

        <section>
          <h3 className="mb-4">Ventajas de React Native en 2024</h3>
          <img
            src={capturas}
            alt="Aplicaciones exitosas con React Native"
          />
          <p className="mb-20 mt-20">
            1. Desarrollo Multiplataforma Eficiente: React Native permite a los
            desarrolladores...
          </p>
        </section>

        <section>
          <h3 className="mb-14 text-xl font-bold">Desventajas de React Native en 2024</h3>
          <img src={problemas} alt="Desafíos con React Native" />
          <p className="mt-14">
            1. Limitaciones en Capacidades Nativas: Para funcionalidades muy
            específicas...
          </p>
        </section>

        <section>
          <h3 className="text-xl mt-14 mb-14">React Native vs Alternativas en 2024</h3>
          <img
            src={comparativa}
            alt="Comparativa entre React Native y otras tecnologías"
          />
        
        </section>

        <section>
          <h3 className="mt-14 mb-14 text-xl font-bold">Conclusión</h3>
          <img src={conclusion} alt="El futuro de React Native" />
          <p className="mb-20 mt-10">
            En conclusión, React Native sigue siendo una opción sólida en
            2024...
          </p>
        </section>
      </div>
    </div>
  );
};
