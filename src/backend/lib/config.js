// Configuración obligatoria: si falta algo, el servidor no arranca (fail-fast).
let cache;

const LONGITUD_MINIMA_SECRETO = 32;
const SECRETO_CONOCIDO = "trabajo-final-integrador-secreto-2026";

function requerir(nombre) {
  const valor = process.env[nombre];
  if (!valor || !String(valor).trim()) {
    throw new Error(`Falta la variable de entorno obligatoria ${nombre}`);
  }
  return String(valor).trim();
}

function cargarConfig() {
  const jwtSecret = requerir("CANTINA_TOKEN");
  if (
    jwtSecret.length < LONGITUD_MINIMA_SECRETO ||
    jwtSecret.toLowerCase() === SECRETO_CONOCIDO
  ) {
    throw new Error(
      "CANTINA_TOKEN debe ser un secreto aleatorio de al menos 32 caracteres",
    );
  }

  const rolAdmin = requerir("ROL_ADMIN");
  const frontendUrl = requerir("FRONTEND_URL");
  if (!/^https?:\/\/\S+$/.test(frontendUrl)) {
    throw new Error("FRONTEND_URL debe ser una URL absoluta (http o https)");
  }

  return {
    jwtSecret,
    rolAdmin,
    frontendUrl: frontendUrl.replace(/\/$/, ""),
  };
}

function configuracion() {
  if (!cache) {
    cache = cargarConfig();
  }
  return cache;
}

module.exports = { configuracion };
