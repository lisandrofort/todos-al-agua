import HeroArt from "../ui/HeroArt";
import WaveDivider from "../ui/WaveDivider";
import "./Hero.css";

export default function Hero() {
  return (
    <section className="hero" id="inicio">
      <div className="container hero-inner">
        <div className="hero-copy">
          <h1 className="text-title hero-title">Todos al Agua</h1>
          <p className="text-subtitle hero-subtitle">
            Un lugar para aprender, entrenar y disfrutar del agua.
          </p>
          <p className="text-body hero-text">
            Clases de natación para niños, jóvenes y adultos en un ambiente
            cuidado, con grupos por nivel y docentes que te acompañan desde el
            primer día.
          </p>
        </div>

        <HeroArt />
      </div>

      <WaveDivider />
    </section>
  );
}
