import "./HeroArt.css";

// Logo de la Asociación Civil a resolución nativa, sin fondo ni leyenda.
export default function HeroArt() {
  return (
    <div className="hero-art">
      <img
        className="hero-logo-img"
        src="/asociacion-civil-todos-al-agua-transparente.png"
        alt="Asociación Civil Todos al Agua de Necochea"
        width="432"
        height="260"
      />
    </div>
  );
}
