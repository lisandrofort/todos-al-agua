import ContactDetails from "../ui/ContactDetails";
import ContactForm from "./ContactForm";
import Eyebrow from "../ui/Eyebrow";
import { ClockIcon, MailIcon, PinIcon } from "../ui/icons";
import "./Contact.css";

const contactItems = [
  {
    icon: PinIcon,
    label: "Ubicación",
    value: "Calle 14 Nº 2949, El Samaritano",
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

export default function HuertaContact() {
  return (
    <section className="section contact-section" id="contacto">
      <div className="container">
        <div className="contact-card">
          <div className="contact-copy">
            <Eyebrow light>Contacto</Eyebrow>
            <h2 className="text-subtitle contact-title">
              ¿Querés visitar la huerta o hacer una consulta?
            </h2>
            <p className="text-body contact-text">
              Escribinos o llamanos para consultar por plantines, semillas y
              panificados sin TACC, o para acercarte al vivero del proyecto
              Flor de Pan.
            </p>
          </div>

          <ContactDetails
            items={contactItems}
            note="Pedidos y consultas: 2262-50-9574. El vivero abre los viernes de 10:00 a 12:00."
          >
            <ContactForm label="Hacer una consulta" />
          </ContactDetails>
        </div>
      </div>
    </section>
  );
}
