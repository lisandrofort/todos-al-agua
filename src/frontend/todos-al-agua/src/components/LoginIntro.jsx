import Logo from "../ui/Logo";

// Texto de presentación que aparece a la izquierda del formulario.
export default function LoginIntro() {
  return (
    <section className="login-intro" aria-labelledby="login-intro-title">
      <Logo />

      <p className="login-eyebrow">Todos al Agua Necochea</p>
      <h1 id="login-intro-title" className="text-title">
        Tu cuenta, tu lugar
      </h1>
      <p className="login-intro-copy">
        Ingresá con tu cuenta para acceder a las áreas de cantina y huerta y
        mantenerte al tanto de todo lo que pasa en la asociación.
      </p>

      <ul className="login-benefits">
        <li>Consultá la carta y los horarios del Muelle Cantina.</li>
        <li>Enterate de las actividades de Flor de Pan.</li>
        <li>Accedé a los espacios según tus permisos.</li>
      </ul>
    </section>
  );
}
