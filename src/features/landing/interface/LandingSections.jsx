export const LandingSections = ({ sections }) => {
  return sections.map(({ id, endColor, bgClassName = "bg-transparent", minHeightClassName = "h-screen", Component }) => (
    <section
      id={`landing-${id}`}
      aria-label={`Sección ${id}`}
      className={`${minHeightClassName} snap-start w-full transition-colors duration-500 ${bgClassName}`}
      data-endcolor={endColor ?? undefined}
      key={id}
    >
      <Component />
    </section>
  ));
};
