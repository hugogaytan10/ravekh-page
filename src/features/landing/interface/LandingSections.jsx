
export const LandingSections = ({ sections }) => {
  return sections.map(({ id, endColor, Component }) => (
    <section
      className="h-screen snap-start w-full"
      data-endcolor={endColor ?? undefined}
      key={id}
    >
      <Component />
    </section>
  ));
};
