import "./HeroArt.css";

// Visual del hero: el logo de la Asociación Civil sobre una tarjeta clara que
// contrasta con el fondo azul y mantiene el texto legible en todos los tamaños.
export default function HeroArt() {
  return (
    <div className="hero-art">
      <div className="hero-logo-card">
        <img
          className="hero-logo-img"
          src="/asociacion-civil-todos-al-agua.png"
          alt="Asociación Civil Todos al Agua de Necochea"
          width="432"
          height="260"
        />
        <p className="hero-logo-caption">
          <span className="hero-logo-dot" aria-hidden="true" />
          Asociación Civil · Necochea
        </p>
      </div>
    </div>
  );
}
