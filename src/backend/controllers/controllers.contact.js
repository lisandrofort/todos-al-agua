const { sendEmail } = require("../lib/mail.js");

const DESTINATARIO = () => process.env.CONTACT_TO_EMAIL ?? "hola@todosalagua.com.ar";
const LIMITE_POR_IP = 5;
const VENTANA_MS = 10 * 60 * 1000;
const intentosPorIp = new Map();

function validar({ nombre, email, mensaje }) {
  if (!nombre || !nombre.trim()) return "Ingresá tu nombre";
  if (!email || !email.trim()) return "Ingresá tu email";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) return "Ingresá un email válido";
  if (!mensaje || !mensaje.trim()) return "Ingresá tu mensaje";
  if (nombre.length > 100) return "El nombre es demasiado largo";
  if (email.length > 200) return "El email es demasiado largo";
  if (mensaje.length > 2000) return "El mensaje es demasiado largo (máximo 2000 caracteres)";
  return null;
}

function escapar(texto) {
  return texto
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function excedioLimite(ip) {
  const ahora = Date.now();
  const registro = intentosPorIp.get(ip) ?? [];
  const recientes = registro.filter((t) => ahora - t < VENTANA_MS);
  intentosPorIp.set(ip, recientes);
  if (recientes.length >= LIMITE_POR_IP) return true;
  recientes.push(ahora);
  return false;
}

async function sendContactMessage(data, ip) {
  const error = validar(data ?? {});
  if (error) {
    const e = new Error(error);
    e.status = 400;
    throw e;
  }
  if (excedioLimite(ip ?? "desconocida")) {
    const e = new Error("Demasiados mensajes. Intentá de nuevo en unos minutos");
    e.status = 429;
    throw e;
  }

  const nombre = data.nombre.trim();
  const email = data.email.trim();
  const mensaje = data.mensaje.trim();

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

  return { message: "¡Gracias! Tu mensaje fue enviado. Te respondemos dentro de las 48 hs." };
}

module.exports = { sendContactMessage };
