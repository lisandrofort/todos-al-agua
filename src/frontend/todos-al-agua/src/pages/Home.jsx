import "../theme.css";
import "./Home.css";
import Header from "../components/Header";
import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import SectionHeading from "../ui/SectionHeading";
import Contact from "../components/Contact";
import Footer from "../components/Footer";
import { linksPara } from "../utils/navLinks";

const navLinks = linksPara("home");

const areas = [
  {
    nombre: "Cantina El Muelle",
    imagen: "/cantina/el-muelle-1.jpeg",
    texto:
      "Cantina inclusiva en el Necochea Rowing Club. Un espacio de trabajo y encuentro abierto a la comunidad.",
    href: "/cantina",
    etiqueta: "Cantina inclusiva",
  },
  {
    nombre: "Flor de Pan",
    imagen: "/panificadora/flor-de-pan-1.webp",
    texto:
      "Panificados sin TACC elaborados por jóvenes y adultos con discapacidad en el proyecto inclusivo.",
    href: "/panificadora",
    etiqueta: "Sin TACC",
  },
  {
    nombre: "Huerta y vivero",
    imagen: "/huerta/vivero-1.jpg",
    texto:
      "Plantines, aromáticas, flores y semillas producidas en el vivero comunitario del proyecto.",
    href: "/huerta",
    etiqueta: "Vivero",
  },
];

export default function Home() {
  return (
    <div className="home">
      <Header links={navLinks} />

      <main>
        <section className="asoc-hero">
          <div className="container asoc-hero-inner">
            <div className="asoc-hero-copy">
              <Eyebrow light dot>
                Asociación Civil · Necochea
              </Eyebrow>
              <h1 className="text-title asoc-hero-title">
                Inclusión que se hace todos los días
              </h1>
              <p className="text-subtitle asoc-hero-subtitle">
                Cantina, panificadora y huerta: tres espacios para aprender,
                trabajar y compartir.
              </p>
              <p className="text-body asoc-hero-text">
                Somos la Asociación Civil Todos al Agua. Nacimos acompañando un
                programa de natación adaptada y hoy nuestro trabajo está en la
                inclusión laboral y comunitaria.
              </p>
              <div className="asoc-hero-actions">
                <Button href="#areas" variant="light">
                  Conocé nuestras áreas
                </Button>
                <Button href="#asociacion" variant="outline">
                  Quiénes somos
                </Button>
              </div>
            </div>
            <div className="asoc-hero-art" aria-hidden="true">
              <img
                src="/asociacion-civil-todos-al-agua-transparente.png"
                alt=""
                width="432"
                height="260"
              />
            </div>
          </div>
        </section>

        <section className="section" id="areas">
          <div className="container">
            <SectionHeading
              eyebrow="Nuestro trabajo"
              title="Tres espacios, un mismo propósito"
              description="Cada área es una oportunidad para que personas con discapacidad aprendan un oficio, trabajen y sean parte de la comunidad."
            />
            <div className="asoc-areas">
              {areas.map((area) => (
                <article className="asoc-area" key={area.nombre}>
                  <div className="asoc-area-img">
                    <img src={area.imagen} alt="" loading="lazy" />
                  </div>
                  <div className="asoc-area-body">
                    <span className="asoc-area-tag">{area.etiqueta}</span>
                    <h3>{area.nombre}</h3>
                    <p>{area.texto}</p>
                    <a href={area.href}>Entrar ↗</a>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--soft" id="asociacion">
          <div className="container asoc-nosotros">
            <div>
              <Eyebrow>La asociación</Eyebrow>
              <h2 className="text-subtitle">
                Del apoyo al deporte a la inclusión laboral
              </h2>
            </div>
            <div>
              <p className="text-body">
                La Asociación Civil Todos al Agua se creó para acompañar la
                escuela municipal de natación adaptada. Con el tiempo amplió su
                trabajo y hoy gestiona la cantina inclusiva El Muelle, el
                proyecto de panificados sin TACC Flor de Pan y la huerta y el
                vivero comunitario.
              </p>
              <p className="text-body">
                El programa de natación sigue siendo municipal; nosotros lo
                acompañamos. Nuestra función principal es generar espacios de
                formación, trabajo y pertenencia.
              </p>
            </div>
          </div>
        </section>

        <Contact />
      </main>

      <Footer links={navLinks} />
    </div>
  );
}
