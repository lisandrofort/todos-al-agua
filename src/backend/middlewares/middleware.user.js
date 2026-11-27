const jwt = require("jsonwebtoken");
const { configuracion } = require("../lib/config.js");

function adminOnly(req, res, next) {
  const { rolAdmin } = configuracion();
  if (req.dataUser?.rol !== rolAdmin) {
    return res.status(403).json({ error: "No tenés roles de administrador" });
  }
  next();
}

function middlewareToken(req, res, next) {
  const [tipo, token] = (req.headers.authorization ?? "").split(" ");

  if (tipo !== "Bearer" || !token) {
    return res.status(401).json({ error: "Hace falta iniciar sesión" });
  }
  try {
    req.dataUser = jwt.verify(token, configuracion().jwtSecret, {
      algorithms: ["HS256"],
    });
    next();
  } catch (e) {
    if (e.name === "TokenExpiredError") {
      return res.status(401).json({ error: "Tu sesión venció. Iniciá sesión nuevamente." });
    }
    return res.status(401).json({ error: "La sesión no es válida" });
  }
}

module.exports = { adminOnly, middlewareToken };
