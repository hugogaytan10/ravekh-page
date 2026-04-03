import React from "react";
import "../styles/ProjectsShowcase.css";

interface ProjectItem {
  title: string;
  description: string;
  status: string;
  stack: string[];
  link?: string;
}

const projects: ProjectItem[] = [
  {
    title: "Ravekh POS",
    description:
      "Punto de venta moderno para ventas, inventario, caja, reportes, finanzas y operación diaria.",
    status: "Terminado",
    stack: ["React", "TypeScript", "Vite"],
    link: "/v2/login-punto-venta",
  },
  {
    title: "Ravekh Lealtad",
    description:
      "Experiencia de fidelización con cupones, recompensas, historial de visitas y canje para clientes.",
    status: "Terminado",
    stack: ["React", "Customer Experience", "QR"],
    link: "/v2/loyalty/clone/cupones",
  },
  {
    title: "Ravekh Catálogo",
    description:
      "Catálogo online con productos, carrito, detalle y flujo de pedido para negocios locales.",
    status: "Terminado",
    stack: ["Storefront", "Carrito", "Pedidos"],
    link: "/v2/catalogo/1",
  },
  {
    title: "Landing Ravekh",
    description:
      "Landing comercial de alta conversión, optimizada para presentar soluciones digitales y captar clientes.",
    status: "Terminado",
    stack: ["Branding", "SEO Base", "UI Moderna"],
    link: "/",
  },
];

export const ProjectsShowcase = () => {
  return (
    <div className="projects-showcase" id="proyectos">
      <div className="projects-showcase__header">
        <span className="projects-showcase__eyebrow">Proyectos</span>
        <h2>Proyectos terminados</h2>
        <p>
          Migramos lo legacy a una vitrina moderna para mostrar claramente los productos que ya están en producción.
        </p>
      </div>

      <div className="projects-showcase__grid">
        {projects.map((project) => (
          <article className="project-card" key={project.title}>
            <div className="project-card__top">
              <h3>{project.title}</h3>
              <span>{project.status}</span>
            </div>

            <p>{project.description}</p>

            <ul>
              {project.stack.map((item) => (
                <li key={`${project.title}-${item}`}>{item}</li>
              ))}
            </ul>

            {project.link ? (
              <a href={project.link} className="project-card__link">
                Ver proyecto
              </a>
            ) : null}
          </article>
        ))}
      </div>
    </div>
  );
};
