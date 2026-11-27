const crypto = require("crypto");
const User = require("../repositories/repository.user.js");
const Reset = require("../repositories/repository.reset.js");
const { sendResetEmail } = require("../lib/mail.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { configuracion } = require("../lib/config.js");
const { falla, email: validarEmail, clave, textoRequerido } = require("../lib/validacion.js");

const ROL_POR_DEFECTO = "usuario";
const ROLES = ["admin", "cantina", "huerta", "usuario"];
const DURACION_SESION = "15m";
const MENSAJE_RECUPERACION =
  "Si el email existe, enviamos instrucciones para restablecer tu contraseña.";

function publicUser(user) {
  if (!user) return null;
  const { pass, ...safe } = user;
  return safe;
}

async function createUser(name, password, email) {
  const nombre = textoRequerido(name, "Falta el nombre", 100);
  const emailValido = validarEmail(email);
  const pass = await encryptWord(clave(password));

  const created = await new User().createUnique({
    name: nombre,
    email: emailValido,
    pass,
    rol: ROL_POR_DEFECTO,
  });
  return publicUser(created);
}

async function emailExists(email) {
  return { exists: await User.exists(validarEmail(email)) };
}

async function verifyUser(email, password) {
  if (typeof password !== "string" || !password) {
    throw falla("El email o contraseña son incorrectos", 401);
  }
  const dataUser = await new User().login(String(email ?? "").trim(), password);
  if (!dataUser) {
    throw falla("El email o contraseña son incorrectos", 401);
  }
  return signSession({
    id: dataUser.id,
    email: dataUser.email,
    name: dataUser.name ?? dataUser.nombre,
    rol: dataUser.rol ?? ROL_POR_DEFECTO,
  });
}

function signSession({ id, email, name, rol }) {
  return jwt.sign({ id, email, name, rol }, configuracion().jwtSecret, {
    algorithm: "HS256",
    expiresIn: DURACION_SESION,
  });
}

async function refreshSession(dataUser) {
  // Se relee el usuario: si fue borrado o cambiado de rol, el token nuevo
  // refleja el estado actual en vez de perpetuar el payload anterior.
  const user = await new User().getById(dataUser?.id);
  if (!user) {
    return null;
  }
  return signSession({
    id: user.id,
    email: user.email,
    name: user.name ?? user.nombre,
    rol: user.rol ?? ROL_POR_DEFECTO,
  });
}

async function getAllUsers() {
  const allUsers = await new User().getAll();
  return allUsers.map(publicUser);
}

async function getUserById(id) {
  return publicUser(await new User().getById(id));
}

async function updateUserById(id, data = {}) {
  const userFound = await new User().getById(id);
  if (!userFound) {
    return null;
  }

  if (data.rol !== undefined && userFound.rol === "admin") {
    throw falla("No se puede modificar el rol de un administrador", 403);
  }
  if (data.rol !== undefined && !ROLES.includes(data.rol)) {
    throw falla("El rol no es válido");
  }

  const allowedFields = ["name", "nombre", "email", "rol", "pass"];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    throw falla("No hay campos válidos para actualizar");
  }
  if (updateData.name !== undefined || updateData.nombre !== undefined) {
    const nombre = textoRequerido(
      updateData.name ?? updateData.nombre,
      "El nombre no puede estar vacío",
      100,
    );
    updateData.name = nombre;
    delete updateData.nombre;
  }
  if (updateData.email !== undefined) {
    updateData.email = validarEmail(updateData.email);
  }
  if (updateData.pass !== undefined) {
    updateData.pass = await encryptWord(clave(updateData.pass));
  }

  return publicUser(await new User().update(id, updateData));
}

async function deleteUserById(id) {
  const userFound = await new User().getById(id);
  if (!userFound) {
    return null;
  }
  return await new User().delete(id);
}

async function requestPasswordReset(email) {
  const emailValido = validarEmail(email);
  const user = await User.getByEmail(emailValido);
  if (!user) {
    // Respuesta genérica: no revelamos si la cuenta existe.
    return { message: MENSAJE_RECUPERACION };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await Reset.invalidateForUser(user.id);
  await Reset.create(user.id, token);

  const { frontendUrl } = configuracion();
  const link = `${frontendUrl}/restablecer?token=${token}`;

  try {
    await sendResetEmail(user.email, link);
  } catch (error) {
    // Igualmente respondemos con el mensaje genérico, pero dejamos el error en el log.
    console.error("No se pudo enviar el email de recuperación:", error.message);
  }

  return { message: MENSAJE_RECUPERACION };
}

async function resetPassword(token, password) {
  const tokenValido = textoRequerido(token, "Faltan datos: token y contraseña", 200);
  const pass = await encryptWord(clave(password));

  const reset = await Reset.findValid(tokenValido);
  if (!reset) {
    throw falla("El link es inválido o venció");
  }

  const aplicado = await Reset.consumeAndChangePassword(
    reset.id,
    reset.userId,
    pass,
  );
  if (!aplicado) {
    throw falla("El link es inválido o venció");
  }

  return { message: "Contraseña actualizada. Ya podés iniciar sesión." };
}

async function encryptWord(pass) {
  return await bcrypt.hash(pass, 10);
}

module.exports = {
  createUser,
  emailExists,
  verifyUser,
  refreshSession,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
  requestPasswordReset,
  resetPassword,
};
