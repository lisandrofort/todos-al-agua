const { sendEmail } = require("../lib/mail.js");
const { falla, textoRequerido, email: validarEmail } = require("../lib/validacion.js");

const DESTINATARIO = () =>
  process.env.CONTACT_TO_EMAIL ?? "hola@todosalagua.com.ar";

function escapar(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

async function sendContactMessage(data = {}) {
  const nombre = textoRequerido(data.nombre, "Ingresá tu nombre", 100);
  const email = validarEmail(data.email);
  const mensaje = textoRequerido(
    data.mensaje,
    "Ingresá tu mensaje",
    2000,
  );

  await sendEmail({
    to: DESTINATARIO(),
    subject: `Consulta desde la web — ${nombre}`,
    html: `
      <div style="font-family: Arial, sans-serif; color: #35434d;">
        <h2 style="color: #0055A5;">Nueva consulta desde la web</h2>
        <p><strong>Nombre:</strong> ${escapar(nombre)}</p>
        <p><strong>Email:</strong> ${escapar(email)}</p>
        <p><strong>Mensaje:</strong></p>
        <p>${escapar(mensaje).replace(/\n/g, "<br>")}</p>
      </div>
    `,
  });

  return {
    message:
      "¡Gracias! Tu mensaje fue enviado. Te respondemos dentro de las 48 hs.",
  };
}

module.exports = { sendContactMessage };
