import React, { useRef, useEffect, useState } from "react";
import { Helmet, HelmetProvider } from "react-helmet-async";
import { NavLink } from "react-router-dom";
import "./LandingPage.css";
import { Heero } from "../Hero/pages/Hero";
import { ProcessOne } from "../Process-one/pages/ProcessOne";
import { ProcessTwo } from "../Process-two/pages/ProcessTwo";
import { ProcessThree } from "../Process-Three/pages/ProcessThree";
import { ProcessFour } from "../Process-Four/pages/ProcessFour";
import { ProcessFive } from "../Process-Five/pages/ProcessFive";
import { ProjectsShowcase } from "../Projects/pages/ProjectsShowcase";
import { Characteristics } from "../Characteristics/pages/Characteristics";
import { Contact } from "../Contact/pages/Contact";
import { Footer } from "../Footer/pages/Footer";
import logoWhasa from "../assets/logo-whatsapp.svg";

export const LandingPageRavekhPage = (): JSX.Element => {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [statusBarColor, setStatusBarColor] = useState<string>("#6D01D1");
  const [isSystemsMenuOpen, setIsSystemsMenuOpen] = useState(false);
  const [isSystemsMenuClosing, setIsSystemsMenuClosing] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const sections = container.querySelectorAll<HTMLElement>("section");

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const section = entry.target as HTMLElement;
            const endColorValue = section.dataset.endcolor ?? "109,1,209";
            const endColor = `rgb(${endColorValue})`;

            setStatusBarColor(endColor);
            section.style.backgroundColor = endColor;
          }
        });
      },
      {
        root: container,
        threshold: 0.5,
      }
    );

    sections.forEach((section) => observer.observe(section));

    return () => {
      sections.forEach((section) => observer.unobserve(section));
      observer.disconnect();
    };
  }, []);

  const isSystemsMenuVisible = isSystemsMenuOpen || isSystemsMenuClosing;

  const openSystemsMenu = () => {
    setIsSystemsMenuClosing(false);
    setIsSystemsMenuOpen(true);
  };

  const closeSystemsMenu = () => {
    if (!isSystemsMenuVisible) {
      return;
    }

    setIsSystemsMenuOpen(false);
    setIsSystemsMenuClosing(true);
  };

  const scrollToSection = (sectionId: string) => {
    const container = containerRef.current;
    if (!container) return;

    const target = container.querySelector<HTMLElement>(`#${sectionId}`);
    if (!target) return;

    target.scrollIntoView({ behavior: "smooth", block: "start" });
    closeSystemsMenu();
  };

  useEffect(() => {
    if (!isSystemsMenuVisible) {
      return;
    }

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        closeSystemsMenu();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
    };
  }, [isSystemsMenuVisible]);

  return (
    <HelmetProvider>
      <Helmet>
        <meta name="theme-color" content={statusBarColor} />
      </Helmet>

      <div
        ref={containerRef}
        className="h-screen flex flex-col overflow-y-scroll snap-y snap-mandatory scrollbar-hidden"
      >
        <button
          type="button"
          className="floating-systems-menu__trigger"
          aria-label={isSystemsMenuVisible ? "Cerrar menú de sistemas" : "Abrir menú de sistemas"}
          aria-expanded={isSystemsMenuVisible}
          onClick={() => (isSystemsMenuVisible ? closeSystemsMenu() : openSystemsMenu())}
        >
          ☰
        </button>

        {isSystemsMenuVisible && (
          <nav
            className={`floating-systems-menu ${isSystemsMenuOpen ? "floating-systems-menu--open" : "floating-systems-menu--close"}`}
            aria-label="Menú de sistemas"
            onAnimationEnd={() => {
              if (!isSystemsMenuOpen) {
                setIsSystemsMenuClosing(false);
              }
            }}
          >
            <ul className="floating-systems-menu__list">
              <li>
                <NavLink to="/v2/login-punto-venta" onClick={closeSystemsMenu}>
                  POS V2
                </NavLink>
              </li>
              <li>
                <NavLink to="/v2/pos/health" onClick={closeSystemsMenu}>
                  POS Health
                </NavLink>
              </li>
              <li>
                <NavLink to="/pos" onClick={closeSystemsMenu}>
                  Acceso POS
                </NavLink>
              </li>
              <li>
                <NavLink to="/v2/loyalty/clone/cupones" onClick={closeSystemsMenu}>
                  Fidelidad 1:1
                </NavLink>
              </li>
              <li>
                <NavLink to="/catalogo/1" onClick={closeSystemsMenu}>
                  Catálogo público
                </NavLink>
              </li>
              <li>
                <button type="button" onClick={() => scrollToSection("proyectos")} className="floating-systems-menu__button">
                  Proyectos
                </button>
              </li>
              <li>
                <NavLink to="/politicas" onClick={closeSystemsMenu}>
                  Políticas
                </NavLink>
              </li>
            </ul>
          </nav>
        )}

        <section
          className="h-screen snap-start w-full"
          data-endcolor="109,1,209"
        >
          <Heero />
        </section>

        <section
          className="h-screen snap-start w-full"
          data-endcolor="78,10,148"
        >
          <ProcessOne />
        </section>

        <section
          className="h-screen snap-start w-full"
          data-endcolor="250,171,171"
        >
          <ProcessTwo />
        </section>

        <section
          className="h-screen snap-start w-full"
          data-endcolor="124,204,190"
        >
          <ProcessThree />
        </section>

        <section
          className="h-screen snap-start w-full"
          data-endcolor="151,194,217"
        >
          <ProcessFour />
        </section>

        <section
          className="h-screen snap-start w-full"
          data-endcolor="177,192,203"
        >
          <ProcessFive />
        </section>

        <section
          className="h-screen snap-start w-full"
          data-endcolor="0,0,0"
        >
          <Characteristics />
        </section>

        <section
          className="snap-start w-full"
          data-endcolor="20,0,40"
        >
          <ProjectsShowcase />
        </section>

        <section
          className="h-screen snap-start w-full"
          data-endcolor="30,30,30"
        >
          <Contact />
        </section>

        <section className="h-screen snap-start w-full">
          <Footer />
        </section>

        <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
          <a href="https://api.whatsapp.com/send?phone=524451113370">
            <img src={logoWhasa} alt="WS" />
          </a>
        </div>
      </div>
    </HelmetProvider>
  );
};
