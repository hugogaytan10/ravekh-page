import { ContactPage } from "../../contact";
import { posMarketingNavigationItems } from "../model/posMarketingNavigation";
import { usePosMarketingNavigation } from "../hooks/usePosMarketingNavigation";
import { PosMarketingNavbar } from "./marketing/PosMarketingNavbar";

const marketingHighlights = [
  {
    title: "Ventas rápidas",
    description:
      "Cobra en segundos con un flujo optimizado para caja, sin pasos innecesarios.",
  },
  {
    title: "Control de inventario",
    description:
      "Revisa existencias, ajusta productos y mantén tu catálogo actualizado en tiempo real.",
  },
  {
    title: "Reportes accionables",
    description:
      "Visualiza métricas de ventas y ticket promedio para tomar mejores decisiones.",
  },
];

export const PosMarketingView = () => {
  const { isMenuOpen, activeSection, setIsMenuOpen, handleNavigateTo } =
    usePosMarketingNavigation(posMarketingNavigationItems);

  return (
    <div className="bg-white text-gray-900">
      <PosMarketingNavbar
        items={posMarketingNavigationItems}
        activeSection={activeSection}
        isMenuOpen={isMenuOpen}
        setIsMenuOpen={setIsMenuOpen}
        onNavigate={handleNavigateTo}
      />

      <section id="inicio" className="mx-auto max-w-6xl px-4 pb-8 pt-16 md:px-8">
        <span className="inline-block rounded-full bg-purple-50 px-3 py-1 text-xs font-semibold text-[#5E2E98]">
          POS moderno
        </span>
        <h1 className="mt-4 text-4xl font-extrabold leading-tight md:text-5xl">
          Lleva tu punto de venta a una estructura nueva, estable y escalable.
        </h1>
        <p className="mt-4 max-w-2xl text-base text-gray-600 md:text-lg">
          Esta versión elimina dependencias directas de la capa legacy para acelerar pruebas y despliegues del POS.
        </p>
      </section>

      <section id="funciones" className="mx-auto grid max-w-6xl gap-4 px-4 py-8 md:grid-cols-3 md:px-8">
        {marketingHighlights.map((item) => (
          <article key={item.title} className="rounded-2xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="text-lg font-bold text-[#5E2E98]">{item.title}</h2>
            <p className="mt-2 text-sm text-gray-600">{item.description}</p>
          </article>
        ))}
      </section>

      <section id="inventario" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <h2 className="text-2xl font-bold">Inventario y catálogo en la misma plataforma</h2>
      </section>
      <section id="reportes" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <h2 className="text-2xl font-bold">Reportes simples para tu operación diaria</h2>
      </section>
      <section id="tienda-online" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <h2 className="text-2xl font-bold">Conexión con tienda online</h2>
      </section>
      <section id="lealtad" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <h2 className="text-2xl font-bold">Lealtad y recompensas</h2>
      </section>
      <section id="precios" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <h2 className="text-2xl font-bold">Precios transparentes para tu negocio</h2>
      </section>
      <section id="testimonios" className="mx-auto max-w-6xl px-4 py-10 md:px-8">
        <h2 className="text-2xl font-bold">Negocios reales usando RAVEKH POS</h2>
      </section>
      <section id="contacto">
        <ContactPage catalogo />
      </section>
    </div>
  );
};
