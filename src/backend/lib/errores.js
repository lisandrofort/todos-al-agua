function rutaNoEncontrada(req, res) {
  res.status(404).json({ error: "Ruta no encontrada" });
}

// Único lugar donde se arma la respuesta de error: los mensajes internos nunca
// se exponen al cliente (solo los creados con falla(), marcados como públicos).
function manejadorErrores(error, req, res, next) {
  if (res.headersSent) {
    return next(error);
  }

  if (error.type === "entity.parse.failed") {
    return res.status(400).json({ error: "El cuerpo de la petición no es un JSON válido" });
  }

  const status =
    Number.isInteger(error.status) && error.status >= 400 && error.status < 600
      ? error.status
      : 500;

  if (status >= 500) {
    console.error(`Error ${req.method} ${req.originalUrl}:`, error);
  }

  const mensaje = error.publico
    ? error.message
    : status === 500
      ? "Error interno del servidor"
      : error.message;

  return res.status(status).json({ error: mensaje });
}

module.exports = { rutaNoEncontrada, manejadorErrores };
