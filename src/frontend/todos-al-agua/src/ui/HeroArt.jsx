import "./HeroArt.css";

// Logo de la Asociación Civil sin fondo, directamente sobre el azul del hero.
export default function HeroArt() {
  return (
    <div className="hero-art">
      <img
        className="hero-logo-img"
        src="/asociacion-civil-todos-al-agua-transparente.png"
        alt="Asociación Civil Todos al Agua de Necochea"
        width="1329"
        height="800"
      />
      <p className="hero-logo-caption">
        <span className="hero-logo-dot" aria-hidden="true" />
        Asociación Civil · Necochea
      </p>
    </div>
  );
}
