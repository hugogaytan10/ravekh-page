import { showcaseProjects } from "../../model/showcaseProjects";

export const ShowcaseSection = () => {
  return (
    <div className="w-full min-h-screen px-4 py-14 md:px-8 lg:px-12">
      <div className="mx-auto w-full max-w-7xl">
        <h3 className="text-center text-3xl font-bold text-white mb-3">Desarrollo Web</h3>
        <p className="text-center text-slate-300 mb-10 max-w-3xl mx-auto">
          Algunos proyectos publicados para distintas industrias. Puedes abrir cada uno para revisar el
          resultado en producción.
        </p>

        <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
          {showcaseProjects.map((project) => (
            <a
              key={project.link}
              href={project.link}
              target="_blank"
              rel="noreferrer"
              className="group mb-4 block break-inside-avoid overflow-hidden rounded-xl border border-slate-600/70 bg-slate-900/40"
            >
              <img
                src={project.src}
                alt={project.alt}
                loading="lazy"
                className="w-full h-auto object-cover transition-transform duration-300 group-hover:scale-[1.03]"
              />
              <div className="px-4 py-3">
                <p className="text-sm md:text-base text-slate-100">{project.title}</p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
};
