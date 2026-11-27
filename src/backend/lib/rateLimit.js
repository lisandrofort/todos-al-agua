// Limitador en memoria por IP. La limpieza periódica evita que el Map crezca
// sin límite; el intervalo usa unref() para no mantener el proceso vivo.
function crearLimitador({ ventanaMs, max, mensaje }) {
  const intentos = new Map();

  const temporizador = setInterval(() => {
    const ahora = Date.now();
    for (const [ip, registro] of intentos) {
      if (ahora - registro.inicio > ventanaMs * 2) {
        intentos.delete(ip);
      }
    }
  }, Math.max(ventanaMs, 60_000));
  temporizador.unref?.();

  return function limitar(req, res, next) {
    const ip = req.ip ?? req.socket?.remoteAddress ?? "desconocida";
    const ahora = Date.now();
    const registro = intentos.get(ip) ?? { inicio: ahora, cantidad: 0 };

    if (ahora - registro.inicio >= ventanaMs) {
      registro.inicio = ahora;
      registro.cantidad = 0;
    }
    registro.cantidad += 1;
    intentos.set(ip, registro);

    if (registro.cantidad > max) {
      const restantes = Math.ceil((registro.inicio + ventanaMs - ahora) / 1000);
      res.setHeader("Retry-After", String(Math.max(restantes, 1)));
      return res.status(429).json({ error: mensaje });
    }
    next();
  };
}

const MINUTO = 60 * 1000;

module.exports = {
  crearLimitador,
  limitarLogin: crearLimitador({
    ventanaMs: 15 * MINUTO,
    max: 10,
    mensaje: "Demasiados intentos de inicio de sesión. Esperá unos minutos.",
  }),
  limitarRegistro: crearLimitador({
    ventanaMs: 60 * MINUTO,
    max: 5,
    mensaje: "Demasiados registros desde esta IP. Intentá más tarde.",
  }),
  limitarRecuperacion: crearLimitador({
    ventanaMs: 60 * MINUTO,
    max: 5,
    mensaje: "Demasiadas solicitudes de recuperación. Intentá más tarde.",
  }),
  limitarReset: crearLimitador({
    ventanaMs: 60 * MINUTO,
    max: 10,
    mensaje: "Demasiados intentos de restablecer la contraseña.",
  }),
  limitarExists: crearLimitador({
    ventanaMs: MINUTO,
    max: 30,
    mensaje: "Demasiadas consultas de email. Intentá en un momento.",
  }),
  limitarContacto: crearLimitador({
    ventanaMs: 10 * MINUTO,
    max: 5,
    mensaje: "Demasiados mensajes. Intentá de nuevo en unos minutos.",
  }),
};
