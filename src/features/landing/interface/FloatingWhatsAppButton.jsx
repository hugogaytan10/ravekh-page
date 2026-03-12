import logoWhasa from "../../../assets/logo-whatsapp.svg";

export const FloatingWhatsAppButton = () => {
  return (
    <div className="bg-color-whats rounded-full p-1 fixed right-2 bottom-4">
      <a href="https://api.whatsapp.com/send?phone=524451113370">
        <img src={logoWhasa} alt="WS" />
      </a>
    </div>
  );
};
