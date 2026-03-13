import fb from "../../../../assets/logo-facebook.svg";
import ig from "../../../../assets/logo-instagram.svg";

export const FooterSection = () => {
  return (
    <div className="bg-fondo-oscuro min-h-screen w-full flex justify-center items-center">
      <div>
        <h3 className="text-white text-center text-2xl font-bold">RAVEKH</h3>
        <h4 className="text-white w-3/4 text-center m-auto mt-2">
          Lleva tu negocio al siguiente nivel, convierte las visitas en ventas con nuestra ayuda.
        </h4>
        <div className="flex justify-center gap-2 mt-5">
          <a target="_blank" rel="noreferrer" href="https://web.facebook.com/profile.php?id=61554291776089">
            <img src={fb} alt="Facebook" />
          </a>
          <a target="_blank" rel="noreferrer" href="https://www.instagram.com/rave_kh/">
            <img src={ig} alt="Instagram" />
          </a>
        </div>
      </div>
    </div>
  );
};
