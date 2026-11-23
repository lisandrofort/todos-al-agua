const crypto = require("crypto");
const User = require("../repositories/repository.user.js");
const Reset = require("../repositories/repository.reset.js");
const { sendResetEmail } = require("../lib/mail.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ROL_POR_DEFECTO = "usuario";
const DURACION_SESION = "1m";
const MENSAJE_RECUPERACION =
  "Si el email existe, enviamos instrucciones para restablecer tu contraseña.";

function publicUser(user) {
  if (!user) return user;
  const { pass, encryptedPass, ...safe } = user;
  return safe;
}

async function findByEmail(email) {
  return await User.getByEmail(email);
}

async function createUser(name, password, email) {
  if (!name || !email || !password) {
    const error = new Error("Faltan datos: nombre, email y contraseña");
    error.status = 400;
    throw error;
  }

  const pass = await encryptWord(password);
  const created = await new User().createUnique({
    name,
    email,
    pass,
    rol: ROL_POR_DEFECTO,
  });
  return publicUser(created);
}

async function emailExists(email) {
  if (!email || !String(email).trim()) {
    const error = new Error("Ingresá un email");
    error.status = 400;
    throw error;
  }
  return { exists: await User.exists(email) };
}

async function verifyUser(email, password) {
  try {
    const dataUser = await new User().login(email, password);
    if (!dataUser) {
      return new Error("El email o contraseña son incorrectos");
    }
    return signSession({
      id: dataUser.id,
      email: dataUser.email,
      name: dataUser.name ?? dataUser.nombre,
      rol: dataUser.rol ?? ROL_POR_DEFECTO,
    });
  } catch (e) {
    return new Error(e.message);
  }
}

function signSession({ id, email, name, rol }) {
  return jwt.sign(
    { id, email, name, rol },
    process.env.CANTINA_TOKEN,
    { expiresIn: DURACION_SESION },
  );
}

function refreshSession(dataUser) {
  return signSession({
    id: dataUser.id,
    email: dataUser.email,
    name: dataUser.name ?? dataUser.nombre,
    rol: dataUser.rol ?? ROL_POR_DEFECTO,
  });
}

async function getAllUsers() {
  const allUsers = await new User().getAll();
  return allUsers.map(publicUser);
}

async function getUserById(id) {
  return publicUser(await new User().getById(id));
}

async function updateUserById(id, data) {
  const userFound = await new User().getById(id);
  if (!userFound) {
    return null;
  }

  const allowedFields = ["name", "nombre", "email", "rol", "pass"];
  const updateData = {};
  allowedFields.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (Object.keys(updateData).length === 0) {
    const error = new Error("No hay campos válidos para actualizar");
    error.status = 400;
    throw error;
  }

  if (updateData.pass) {
    updateData.pass = await encryptWord(updateData.pass);
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
  if (!email || typeof email !== "string") {
    const error = new Error("Ingresá un email");
    error.status = 400;
    throw error;
  }

  const user = await findByEmail(email.trim());
  if (!user) {
    // Respuesta genérica: no revelamos si la cuenta existe.
    return { message: MENSAJE_RECUPERACION };
  }

  const token = crypto.randomBytes(32).toString("hex");
  await Reset.invalidateForUser(user.id);
  await Reset.create(user.id, token);

  const frontendUrl = (process.env.FRONTEND_URL ?? "http://localhost:5173").replace(/\/$/, "");
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
  if (!token || !password) {
    const error = new Error("Faltan datos: token y contraseña");
    error.status = 400;
    throw error;
  }
  if (password.length < 6) {
    const error = new Error("La contraseña debe tener al menos 6 caracteres");
    error.status = 400;
    throw error;
  }

  const reset = await Reset.findValid(token);
  if (!reset) {
    const error = new Error("El link es inválido o venció");
    error.status = 400;
    throw error;
  }

  const user = await new User().getById(reset.userId);
  if (!user) {
    const error = new Error("El link es inválido o venció");
    error.status = 400;
    throw error;
  }

  await new User().update(user.id, { pass: await encryptWord(password) });
  await Reset.markUsed(reset.id);
  await Reset.invalidateForUser(user.id);

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
