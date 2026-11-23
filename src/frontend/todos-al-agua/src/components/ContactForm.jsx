import { useState } from "react";
import { apiContact } from "../api/client";
import "./Contact.css";

const VACIO = { nombre: "", email: "", mensaje: "" };

export default function ContactForm({ label = "Enviar mensaje" }) {
  const [form, setForm] = useState(VACIO);
  const [errors, setErrors] = useState({});
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "", general: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.nombre.trim()) nextErrors.nombre = "Ingresá tu nombre";
    if (!form.email.trim()) nextErrors.email = "Ingresá tu email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = "Ingresá un email válido";
    }
    if (!form.mensaje.trim()) nextErrors.mensaje = "Ingresá tu mensaje";

    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSending(true);
    setErrors({});
    try {
      await apiContact.send(form);
      setForm(VACIO);
      setSent(true);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <div className="contact-form-field">
        <label htmlFor="contact-nombre">Nombre</label>
        <input
          id="contact-nombre"
          name="nombre"
          type="text"
          autoComplete="name"
          placeholder="Tu nombre"
          value={form.nombre}
          onChange={handleChange}
          aria-invalid={Boolean(errors.nombre)}
        />
        {errors.nombre && <span className="contact-form-error">{errors.nombre}</span>}
      </div>

      <div className="contact-form-field">
        <label htmlFor="contact-email">Email</label>
        <input
          id="contact-email"
          name="email"
          type="email"
          autoComplete="email"
          placeholder="tu@email.com"
          value={form.email}
          onChange={handleChange}
          aria-invalid={Boolean(errors.email)}
        />
        {errors.email && <span className="contact-form-error">{errors.email}</span>}
      </div>

      <div className="contact-form-field">
        <label htmlFor="contact-mensaje">Mensaje</label>
        <textarea
          id="contact-mensaje"
          name="mensaje"
          rows="4"
          placeholder="Contanos qué necesitás..."
          value={form.mensaje}
          onChange={handleChange}
          aria-invalid={Boolean(errors.mensaje)}
        />
        {errors.mensaje && <span className="contact-form-error">{errors.mensaje}</span>}
      </div>

      {errors.general && (
        <p className="contact-form-error" role="alert">
          {errors.general}
        </p>
      )}

      {sent && (
        <p className="contact-form-success" role="status">
          ¡Gracias! Tu mensaje fue enviado. Te respondemos dentro de las 48 hs.
        </p>
      )}

      <button className="btn btn-light btn-block" type="submit" disabled={sending}>
        {sending ? "Enviando..." : label}
      </button>
    </form>
  );
}
