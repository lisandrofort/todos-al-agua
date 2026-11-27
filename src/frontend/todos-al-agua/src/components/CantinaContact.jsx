import ContactDetails from "../ui/ContactDetails";
import ContactForm from "./ContactForm";
import Eyebrow from "../ui/Eyebrow";
import { ClockIcon, MailIcon, PinIcon } from "../ui/icons";
import "./Contact.css";

const contactItems = [
  {
    icon: PinIcon,
    label: "Ubicación",
    value: "Jesuita Cardiel y calle 62, Necochea",
  },
  {
    icon: MailIcon,
    label: "Pedidos",
    value: "hola@todosalagua.com.ar",
  },
  {
    icon: ClockIcon,
    label: "Respuesta",
    value: "Dentro de las 48 hs",
  },
];

export default function CantinaContact() {
  return (
    <section className="section contact-section" id="contacto">
      <div className="container">
        <div className="contact-card">
          <div className="contact-copy">
            <Eyebrow light>Pedidos</Eyebrow>
            <h2 className="text-subtitle contact-title">
              ¿Te quedaste con ganas de probar algo?
            </h2>
            <p className="text-body contact-text">
              Consultanos por el menú del día, las opciones sin TACC y los
              pedidos para llevar. Te respondemos a la brevedad.
            </p>
          </div>

          <ContactDetails
            items={contactItems}
            note="También podés acercarte a El Muelle y consultar por la carta del día."
          >
            <ContactForm label="Hacer un pedido" />
          </ContactDetails>
        </div>

        <div className="contact-map">
          <div className="contact-map-head">
            <div>
              <h3 className="contact-map-title">¿Dónde nos encontramos?</h3>
              <p className="contact-map-address">
                Cantina Inclusiva El Muelle · Necochea Rowing Club, Jesuita Cardiel y calle 62
              </p>
            </div>
            <a
              className="contact-map-link"
              href="https://www.google.com/maps/search/?api=1&query=-38.5447466%2C-58.7289501"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cómo llegar ↗
            </a>
          </div>
          <div className="contact-map-frame-wrap">
            <iframe
              className="contact-map-frame"
              title="Ubicación de la Cantina Inclusiva El Muelle en el Necochea Rowing Club"
              src="https://www.google.com/maps?q=-38.5447466%2C-58.7289501&z=15&output=embed"
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              allowFullScreen
            />
          </div>
        </div>
      </div>
    </section>
  );
}
