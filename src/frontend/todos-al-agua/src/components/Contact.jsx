import ContactDetails from "../ui/ContactDetails";
import ContactForm from "./ContactForm";
import Eyebrow from "../ui/Eyebrow";
import { ClockIcon, MailIcon, PinIcon } from "../ui/icons";
import "./Contact.css";

const contactItems = [
  {
    icon: PinIcon,
    label: "Dónde estamos",
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
            <Eyebrow light>Contacto</Eyebrow>
            <h2 className="text-subtitle contact-title">
              ¿Querés sumarte o conocer nuestro trabajo?
            </h2>
            <p className="text-body contact-text">
              Escribinos para consultar por la cantina, los panificados sin TACC,
              la huerta o para sumarte al proyecto.
            </p>
          </div>

          <ContactDetails
            items={contactItems}
            note="También podés escribirnos para coordinar una visita a El Muelle o al vivero."
          >
            <ContactForm label="Enviar consulta" />
          </ContactDetails>
        </div>
      </div>
    </section>
  );
}
