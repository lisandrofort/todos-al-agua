// URL del backend (producción o local).
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const TOKEN_KEY = "todos-al-agua.token";
export const LOGIN_EVENT = "todos-al-agua:login";
export const SESSION_EXPIRED_EVENT = "todos-al-agua:session-expired";

// Devuelve el token guardado, o null.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Guarda el token. Si no hay token, lo descarta.
export function setToken(token) {
  if (!token) {
    localStorage.removeItem(TOKEN_KEY);
    return;
  }
  localStorage.setItem(TOKEN_KEY, token);
}

// Prepara las cabeceras. Sin token, devuelve solo el Content-Type.
function armarCabeceras(necesitaToken) {
  const cabeceras = { "Content-Type": "application/json" };

  if (!necesitaToken) return cabeceras;

  const token = getToken();
  if (!token) return cabeceras;

  cabeceras.Authorization = "Bearer " + token;
  return cabeceras;
}

// Prepara el cuerpo. Sin datos, no manda nada.
function armarCuerpo(datos) {
  if (!datos) return undefined;
  return JSON.stringify(datos);
}

// Llama al servidor. Si falla la red, da un mensaje claro.
async function llamar(ruta, metodo, cabeceras, cuerpo) {
  try {
    return await fetch(BASE_URL + ruta, {
      method: metodo,
      headers: cabeceras,
      body: cuerpo,
    });
  } catch {
    throw new Error("No se pudo conectar con el servidor. Intentá de nuevo.");
  }
}

// Lee la respuesta. Si está bien devuelve datos; si no, tira error.
async function verificar(respuesta, necesitaToken) {
  const datos = await respuesta.json().catch(() => ({}));

  if (respuesta.ok) return datos;

  if (necesitaToken && respuesta.status === 401) {
    window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
  }

  if (datos.error) throw new Error(datos.error);

  throw new Error("Error " + respuesta.status);
}

// Motor: cuatro pasos, sin condiciones adentro.
export async function request(ruta, metodo, datos, necesitaToken) {
  const cabeceras = armarCabeceras(necesitaToken);
  const cuerpo = armarCuerpo(datos);
  const respuesta = await llamar(ruta, metodo, cabeceras, cuerpo);
  return verificar(respuesta, necesitaToken);
}

// Deja el email sin espacios y en minúsculas.
function normalizarEmail(email) {
  return email.trim().toLowerCase();
}

// Login, registro y recuperación.
export const apiAuth = {
  // Ingresar con email y contraseña.
  login(email, password) {
    return request("/users/login", "POST", { email, password });
  },

  // Crear cuenta con el email normalizado.
  register(name, email, password) {
    const emailLimpio = normalizarEmail(email);
    return request("/users/register", "POST", {
      name,
      email: emailLimpio,
      password,
    });
  },

  // Preguntar si el email ya está registrado.
  emailExists(email) {
    const emailLimpio = normalizarEmail(email);
    const query = encodeURIComponent(emailLimpio);
    return request("/users/exists?email=" + query);
  },

  // Pedir el mail con el link de recuperación.
  forgotPassword(email) {
    return request("/users/forgot-password", "POST", { email });
  },

  // Guardar la contraseña nueva con el token del mail.
  resetPassword(token, password) {
    return request("/users/reset-password", "POST", { token, password });
  },

  // Pedir un JWT nuevo sin escribir la contraseña.
  refresh() {
    return request("/users/refresh", "POST", null, true);
  },
};

// Formulario de contacto.
export const apiContact = {
  send: (data) => request("/contact", "POST", data),
};

// Carta: leer es público, escribir pide admin.
export const apiMenu = {
  getAll: () => request("/menu"),
  getById: (id) => request("/menu/" + id),
  create: (data) => request("/menu", "POST", data, true),
  update: (id, data) => request("/menu/" + id, "PUT", data, true),
  remove: (id) => request("/menu/" + id, "DELETE", null, true),
};

// Usuarios: todo pide admin.
export const apiUsers = {
  getAll: () => request("/users", "GET", null, true),
  getById: (id) => request("/users/" + id, "GET", null, true),
  update: (id, data) => request("/users/" + id, "PUT", data, true),
  remove: (id) => request("/users/" + id, "DELETE", null, true),
};
