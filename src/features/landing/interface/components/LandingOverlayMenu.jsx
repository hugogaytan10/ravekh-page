import PropTypes from "prop-types";
import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import menuIcon from "../../../../assets/menu.svg";

const sectionItems = [
  { label: "Inicio", targetId: "landing-banner" },
  { label: "Proyectos", targetId: "landing-muestra" },
  { label: "Paquetes", targetId: "landing-paquetes" },
  { label: "Contacto", targetId: "landing-contacto" },
];

const routeItems = [
  { label: "Blog", to: "/blog" },
  { label: "Punto de Venta", to: "/sistema/pos" },
  { label: "Cupones", to: "/sistema/cupones" },
  { label: "Política de Privacidad", to: "/politica-privacidad" },
];

export const LandingOverlayMenu = ({ containerRef }) => {
  const [isOpen, setIsOpen] = useState(false);

  const links = useMemo(() => [...sectionItems, ...routeItems], []);

  const closeMenu = () => {
    setIsOpen(false);
  };

  const openMenu = () => {
    setIsOpen((previous) => !previous);
  };

  const handleSectionClick = (targetId) => {
    closeMenu();

    requestAnimationFrame(() => {
      const scope = containerRef?.current;
      const target = document.getElementById(targetId);

      if (!scope || !target) {
        return;
      }

      scope.scrollTo({
        top: target.offsetTop,
        behavior: "smooth",
      });
    });
  };

  return (
    <>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls="landing-overlay-menu"
        aria-label={isOpen ? "Cerrar menú" : "Abrir menú"}
        className="landing-menu-toggle"
        onClick={openMenu}
      >
        <img src={menuIcon} alt="menu" className="landing-menu-toggle__icon" />
      </button>

      <nav id="landing-overlay-menu" className={`landing-overlay-menu ${isOpen ? "is-open" : ""}`}>
        <ul className="landing-overlay-menu__list">
          {links.map((item) => {
            if ("targetId" in item) {
              return (
                <li key={item.label}>
                  <button
                    type="button"
                    className="landing-overlay-menu__link "
                    onClick={() => handleSectionClick(item.targetId)}
                  >
                    {item.label}
                  </button>
                </li>
              );
            }

            return (
              <li key={item.label}>
                <Link className="landing-overlay-menu__link" to={item.to} onClick={closeMenu}>
                  {item.label}
                </Link>
              </li>
            );
          })}
          <li>
            <p className="landing-overlay-menu__email">ravekh.team@gmail.com</p>
          </li>
        </ul>
      </nav>
    </>
  );
};


LandingOverlayMenu.propTypes = {
  containerRef: PropTypes.shape({
    current: PropTypes.any,
  }),
};
