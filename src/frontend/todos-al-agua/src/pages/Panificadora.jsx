import "../theme.css";
import "./Panificadora.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Button from "../ui/Button";
import Eyebrow from "../ui/Eyebrow";
import SectionHeading from "../ui/SectionHeading";
import ContactDetails from "../ui/ContactDetails";
import ContactForm from "../components/ContactForm";
import { ClockIcon, MailIcon, PinIcon } from "../ui/icons";
import { linksPara } from "../utils/navLinks";

const navLinks = linksPara("panificadora");

const productos = [
  {
    nombre: "Panes y pizzetas",
    texto: "Elaborados en cocina exclusiva sin TACC.",
  },
  { nombre: "Empanadas", texto: "Variedades saladas del proyecto." },
  { nombre: "Pepas y cookies", texto: "Clásicos dulces aptos para celíacos." },
  { nombre: "Brownies y pastafrolas", texto: "Producción propia sin gluten." },
];

const contacto = [
  { icon: PinIcon, label: "Producción", value: "El Samaritano, Necochea" },
  { icon: MailIcon, label: "Consultas", value: "hola@todosalagua.com.ar" },
  { icon: ClockIcon, label: "Pedidos", value: "2262-50-9574" },
];

export default function Panificadora() {
  return (
    <div className="panificadora">
      <Header
        links={navLinks}
        logoHref="/"
        cta={{ href: "#contacto", label: "Hacer un pedido" }}
      />

      <main>
        <section className="pan-hero">
          <div className="container pan-hero-inner">
            <div>
              <Eyebrow light dot>
                Proyecto inclusivo · Flor de Pan
              </Eyebrow>
              <h1 className="text-title pan-hero-title">
                Panificados sin TACC, hechos con dedicación
              </h1>
              <p className="text-subtitle pan-hero-text">
                Jóvenes y adultos con discapacidad aprenden un oficio, elaboran
                y venden productos aptos para celíacos.
              </p>
              <div className="pan-hero-actions">
                <Button href="#productos" variant="light">
                  Ver productos
                </Button>
                <Button href="#contacto" variant="outline">
                  Hacer un pedido
                </Button>
              </div>
            </div>
            <div className="pan-hero-img">
              <img
                src="/panificadora/flor-de-pan-1.webp"
                alt="Integrantes del proyecto Flor de Pan con sus productos"
              />
            </div>
          </div>
        </section>

        <section className="section" id="productos">
          <div className="container">
            <SectionHeading
              eyebrow="Nuestra producción"
              title="Lo que elaboramos"
              description="Toda la producción es sin TACC. Consultá disponibilidad y precios directamente al teléfono 2262-50-9574."
            />
            <div className="pan-productos">
              {productos.map((producto) => (
                <article className="pan-producto" key={producto.nombre}>
                  <span aria-hidden="true">✦</span>
                  <div>
                    <h3>{producto.nombre}</h3>
                    <p>{producto.texto}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="section section--soft">
          <div className="container pan-donde">
            <div>
              <Eyebrow>Dónde encontrarlos</Eyebrow>
              <h2 className="text-subtitle">Venta directa y ferias</h2>
              <p className="text-body">
                Los panificados se venden los fines de semana y feriados en la
                Feria 4 Estaciones del Parque Miguel Lillo, y en comercios
                adheridos de la playa. También podés pedirlos por teléfono.
              </p>
            </div>
            <figure className="pan-foto">
              <img
                src="/panificadora/flor-de-pan-2.webp"
                alt="Puesto de Flor de Pan en la feria"
                loading="lazy"
              />
              <figcaption>
                Puesto de Flor de Pan · Feria 4 Estaciones, Necochea
              </figcaption>
            </figure>
          </div>
        </section>

        <section className="section contact-section" id="contacto">
          <div className="container">
            <div className="contact-card">
              <div className="contact-copy">
                <Eyebrow light>Pedidos</Eyebrow>
                <h2 className="text-subtitle contact-title">
                  ¿Querés hacer un pedido o sumar tu comercio?
                </h2>
                <p className="text-body contact-text">
                  Escribinos para consultar por los productos sin TACC, hacer un
                  pedido o incorporarlos a tu local.
                </p>
              </div>
              <ContactDetails items={contacto} note="Teléfono de pedidos: 2262-50-9574.">
                <ContactForm label="Enviar pedido" />
              </ContactDetails>
            </div>
          </div>
        </section>
      </main>

      <Footer links={navLinks} />
    </div>
  );
}
