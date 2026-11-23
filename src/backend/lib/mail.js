// Envío de emails con Resend. No hace falta dependencia: Node 20+ trae fetch.
// RESEND_API_URL se puede sobreescribir para apuntar a un mock en desarrollo.
const RESEND_API_URL = (process.env.RESEND_API_URL ?? "https://api.resend.com").replace(/\/$/, "");

async function sendEmail({ to, subject, html }) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM;

  if (!apiKey || !from) {
    throw new Error("Falta configurar RESEND_API_KEY o EMAIL_FROM en el backend");
  }

  const response = await fetch(`${RESEND_API_URL}/emails`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ from, to: [to], subject, html }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.message ?? `Error al enviar el email (${response.status})`);
  }
  return data;
}

async function sendResetEmail(to, link) {
  return sendEmail({
    to,
    subject: "Restablecé tu contraseña — Todos al Agua",
    html: `
      <div style="font-family: Arial, sans-serif; color: #35434d;">
        <h1 style="color: #0055A5;">Todos al Agua</h1>
        <p>Recibimos un pedido para restablecer tu contraseña.</p>
        <p>
          <a href="${link}" style="display:inline-block;padding:12px 20px;background:#0055A5;color:#fff;text-decoration:none;border-radius:6px;">
            Restablecer contraseña
          </a>
        </p>
        <p>Si no fuiste vos, ignorá este email. El link vence en 30 minutos.</p>
        <p style="font-size:12px;color:#65717a;">${link}</p>
      </div>
    `,
  });
}

module.exports = { sendEmail, sendResetEmail };
