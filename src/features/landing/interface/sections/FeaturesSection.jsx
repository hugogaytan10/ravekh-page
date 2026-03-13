import "../styles/landingVisuals.css";

export const FeaturesSection = () => {
  return (
    <div className="container-caracteristicas min-h-screen">
      <h2 className="text-seccion-animacion">Animaciones increíbles</h2>
      {Array.from({ length: 9 }).map((_, index) => (
        <div className="rain" key={index}>
          <div className="drop" />
          <div className="waves">
            <div />
            <div />
          </div>
          <div className="splash" />
          <div className="particles">
            <div />
            <div />
            <div />
            <div />
          </div>
        </div>
      ))}
    </div>
  );
};
