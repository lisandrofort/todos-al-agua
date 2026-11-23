const User = require("../repositories/repository.user.js");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const ROL_POR_DEFECTO = "usuario";
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
