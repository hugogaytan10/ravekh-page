export const LoyaltyCustomerHomePage = () => {
  return (
    <section className="loyalty-customer-portal__card">
      <h2>Inicio fidelidad</h2>
      <p>Bienvenido al portal fidelidad. Desde aquí puedes revisar visitas y tus cupones activos.</p>
      <ul>
        <li>Valida token en <strong>/cupones</strong>.</li>
        <li>Revisa avance en <strong>/cupones/visitas</strong>.</li>
        <li>Canjea en <strong>/cupones/cupones</strong>.</li>
      </ul>
    </section>
  );
};
