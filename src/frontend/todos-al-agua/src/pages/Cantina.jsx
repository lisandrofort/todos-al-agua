import "../theme.css";
import "./Cantina.css";
import Header from "../components/Header";
import MenuHighlights from "../components/MenuHighlights";
import MenuList from "../components/MenuList";
import CantinaInfo from "../components/CantinaInfo";
import CantinaContact from "../components/CantinaContact";
import Footer from "../components/Footer";
import { linksPara } from "../utils/navLinks";

const navLinks = linksPara("cantina");

export default function Cantina() {
  return (
    <div className="cantina">
      <Header
        links={navLinks}
        logoHref="/"
        cta={{ href: "#contacto", label: "Pedidos" }}
      />

      <main>
        <MenuHighlights />

        <section className="section cantina-fotos-section">
          <div className="container">
            <div className="cantina-fotos">
              <figure>
                <img
                  src="/cantina/el-muelle-1.jpeg"
                  alt="Salón de la Cantina Inclusiva El Muelle"
                  loading="lazy"
                />
                <figcaption>
                  El Muelle · Necochea Rowing Club ·{" "}
                  <a
                    href="https://necochea.gov.ar/una-asociacion-que-nacio-para-apoyar-la-natacion-adaptada-y-hoy-es-eje-de-inclusion-laboral/"
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Municipalidad de Necochea ↗
                  </a>
                </figcaption>
              </figure>
              <figure>
                <img
                  src="/cantina/el-muelle-2.jpg"
                  alt="Fachada de la Cantina Inclusiva El Muelle"
                  loading="lazy"
                />
                <figcaption>
                  Un espacio de trabajo y encuentro abierto a la comunidad
                </figcaption>
              </figure>
            </div>
          </div>
        </section>

        <MenuList />
        <CantinaInfo />
        <CantinaContact />
      </main>

      <Footer links={navLinks} />
    </div>
  );
}
