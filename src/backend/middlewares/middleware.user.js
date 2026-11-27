const jwt = require("jsonwebtoken");
const User = require("../repositories/repository.user.js");
const { configuracion } = require("../lib/config.js");

// El claim del JWT no basta: se verifica el rol vigente en Firestore para que
// un token firmado con privilegios ya revocados no siga dando acceso.
async function adminOnly(req, res, next) {
  const { rolAdmin } = configuracion();
  try {
    const user = req.dataUser?.id
      ? await new User().getById(req.dataUser.id)
      : null;

    if (!user) {
      return res.status(401).json({ error: "Tu sesión no es válida" });
    }
    if (user.rol !== rolAdmin) {
      return res.status(403).json({ error: "No tenés roles de administrador" });
    }
    next();
  } catch (e) {
    console.error("No se pudo verificar el rol del usuario:", e.message);
    return res.status(500).json({ error: "No se pudo verificar tu rol" });
  }
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
