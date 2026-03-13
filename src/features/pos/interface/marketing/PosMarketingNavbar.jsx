export const PosMarketingNavbar = ({
  items,
  activeSection,
  isMenuOpen,
  setIsMenuOpen,
  onNavigate,
}) => {
  return (
    <header className="sticky top-0 z-40 border-b border-purple-100 bg-white/90 backdrop-blur">
      <nav className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-4 md:px-8">
        <button
          type="button"
          onClick={() => onNavigate("inicio")}
          className="text-lg font-extrabold tracking-tight text-[#5E2E98]"
        >
          RAVEKH POS
        </button>

        <ul className="hidden items-center gap-6 text-sm font-medium text-gray-600 lg:flex">
          {items.map((item) => (
            <li key={item.id}>
              <button
                type="button"
                onClick={() => onNavigate(item.id)}
                className={`transition-colors hover:text-[#5E2E98] ${
                  activeSection === item.id ? "text-[#5E2E98]" : "text-gray-600"
                }`}
              >
                {item.label}
              </button>
            </li>
          ))}
        </ul>

        <div className="hidden lg:block">
          <a
            href="/sistema/pos/login"
            className="rounded-full bg-[#6D01D1] px-6 py-2 text-sm font-semibold text-white shadow-md transition hover:bg-[#5500B4]"
          >
            Entrar
          </a>
        </div>

        <button
          type="button"
          className="rounded-lg border border-purple-200 px-3 py-2 text-sm font-semibold text-[#5E2E98] lg:hidden"
          onClick={() => setIsMenuOpen((prev) => !prev)}
          aria-label="Abrir menú"
          aria-expanded={isMenuOpen}
        >
          Menú
        </button>
      </nav>

      {isMenuOpen ? (
        <div className="border-t border-purple-100 bg-white px-4 py-3 lg:hidden">
          <ul className="flex flex-col gap-2">
            {items.map((item) => (
              <li key={item.id}>
                <button
                  type="button"
                  onClick={() => onNavigate(item.id)}
                  className={`w-full rounded-lg px-3 py-2 text-left text-sm transition ${
                    activeSection === item.id
                      ? "bg-purple-50 font-semibold text-[#5E2E98]"
                      : "text-gray-700 hover:bg-gray-50"
                  }`}
                >
                  {item.label}
                </button>
              </li>
            ))}
          </ul>
        </div>
      ) : null}
    </header>
  );
};
