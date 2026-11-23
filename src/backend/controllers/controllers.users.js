const User = require("../repositories/repository.user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ROL_POR_DEFECTO = "usuario";
const ROL_ADMIN = process.env.ROL_ADMIN ?? "admin";
const DURACION_SESION = "1m";

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

  const emailFound = await findByEmail(email);
  if (emailFound) {
    const error = new Error("Ya hay un registro con este email");
    error.status = 409;
    throw error;
  }

  const pass = await encryptWord(password);
  const created = await new User().create({
    name,
    email,
    pass,
    rol: ROL_POR_DEFECTO,
  });
  return publicUser(created);
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

function esMismoUsuario(target, actor) {
  if (!actor) return false;
  if (target.id != null && actor.id != null) {
    return String(target.id) === String(actor.id);
  }
  return target.email?.toLowerCase() === actor.email?.toLowerCase();
}

async function contarAdministradores() {
  const users = await new User().getAll();
  return users.filter((user) => (user.rol ?? ROL_POR_DEFECTO) === ROL_ADMIN).length;
}

function error403(mensaje) {
  const error = new Error(mensaje);
  error.status = 403;
  return error;
}

async function updateUserById(id, data, actor) {
  const userFound = await new User().getById(id);
  if (!userFound) {
    return null;
  }

  const esAdmin = (userFound.rol ?? ROL_POR_DEFECTO) === ROL_ADMIN;
  const esUnoMismo = esMismoUsuario(userFound, actor);

  if (esUnoMismo && data.rol !== undefined) {
    throw error403("No podés cambiar tu propio rol");
  }

  if (esAdmin && !esUnoMismo) {
    throw error403("No podés modificar a otro administrador");
  }

  if (esAdmin && data.rol !== undefined && data.rol !== ROL_ADMIN) {
    const totalAdmins = await contarAdministradores();
    if (totalAdmins <= 1) {
      throw error403("No podés quitarle el rol al último administrador");
    }
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

async function deleteUserById(id, actor) {
  const userFound = await new User().getById(id);
  if (!userFound) {
    return null;
  }

  const esAdmin = (userFound.rol ?? ROL_POR_DEFECTO) === ROL_ADMIN;

  if (esMismoUsuario(userFound, actor)) {
    throw error403("No podés eliminar tu propia cuenta");
  }

  if (esAdmin) {
    const totalAdmins = await contarAdministradores();
    const mensaje =
      totalAdmins <= 1
        ? "No podés eliminar al último administrador"
        : "No podés eliminar a otro administrador";
    throw error403(mensaje);
  }

  return await new User().delete(id);
}

async function encryptWord(pass) {
  return await bcrypt.hash(pass, 10);
}

module.exports = {
  createUser,
  verifyUser,
  refreshSession,
  getAllUsers,
  getUserById,
  updateUserById,
  deleteUserById,
};
