import ContactDetails from "../ui/ContactDetails";
import ContactForm from "./ContactForm";
import Eyebrow from "../ui/Eyebrow";
import { ClockIcon, MailIcon, PinIcon } from "../ui/icons";
import "./Contact.css";

const contactItems = [
  {
    icon: PinIcon,
    label: "Ubicación",
    value: "Calle 55 N° 2765, Necochea",
  },
  {
    icon: MailIcon,
    label: "Consultas",
    value: "hola@todosalagua.com.ar",
  },
  {
    icon: ClockIcon,
    label: "Respuesta",
    value: "Dentro de las 48 hs",
  },
];

export default function Contact() {
  return (
    <section className="section contact-section" id="contacto">
      <div className="container">
        <div className="contact-card">
          <div className="contact-copy">
            <Eyebrow light>Sumate</Eyebrow>
            <h2 className="text-subtitle contact-title">
              ¿Arrancamos con el primer chapuzón?
            </h2>
            <p className="text-body contact-text">
              Contanos tu edad, tu experiencia en el agua y qué te gustaría
              lograr. Te ayudamos a encontrar el grupo ideal.
            </p>
          </div>

          <ContactDetails
            items={contactItems}
            note="También podés acercarte a la pileta y charlar con nosotros."
          >
            <ContactForm label="Pedir información" />
          </ContactDetails>
        </div>

        <div className="contact-map">
          <div className="contact-map-head">
            <div>
              <h3 className="contact-map-title">¿Dónde nos encontramos?</h3>
              <p className="contact-map-address">
                Natatorio del Gimnasio Palestra · Calle 55 N° 2765, Necochea
              </p>
            </div>
            <a
              className="contact-map-link"
              href="https://www.google.com/maps/search/?api=1&query=Calle+55+2765%2C+Necochea%2C+Buenos+Aires%2C+Argentina"
              target="_blank"
              rel="noopener noreferrer"
            >
              Cómo llegar ↗
            </a>
          </div>
          <div className="contact-map-frame-wrap">
            <iframe
              className="contact-map-frame"
              title="Ubicación de Todos al Agua en el Gimnasio Palestra, Necochea"
              src="https://www.google.com/maps?q=Calle+55+2765%2C+Necochea%2C+Buenos+Aires%2C+Argentina&z=15&output=embed"
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
