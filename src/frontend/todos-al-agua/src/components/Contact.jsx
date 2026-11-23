import ContactDetails from "../ui/ContactDetails";
import ContactForm from "./ContactForm";
import Eyebrow from "../ui/Eyebrow";
import { ClockIcon, MailIcon, PinIcon } from "../ui/icons";
import "./Contact.css";

const contactItems = [
  {
    icon: PinIcon,
    label: "Ubicación",
    value: "Necochea, Buenos Aires",
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
      </div>
    </section>
  );
}
