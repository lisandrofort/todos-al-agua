// URL del backend (producción o local).
const BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const TOKEN_KEY = "todos-al-agua.token";
export const LOGIN_EVENT = "todos-al-agua:login";
export const SESSION_EXPIRED_EVENT = "todos-al-agua:session-expired";

// Devuelve el token guardado, o null.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Guarda el token. Si no hay token, lo borra.
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

// Login, registro y recuperación.
export const apiAuth = {
  login: (email, password) => request("/users/login", "POST", { email, password }),
  register: (name, email, password) =>
    request("/users/register", "POST", { name, email: email.trim().toLowerCase(), password }),
  emailExists: (email) => request("/users/exists?email=" + encodeURIComponent(email.trim().toLowerCase())),
  forgotPassword: (email) => request("/users/forgot-password", "POST", { email }),
  resetPassword: (token, password) => request("/users/reset-password", "POST", { token, password }),
  refresh: () => request("/users/refresh", "POST", null, true),
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
  getAll: () => request("/users", null, null, true),
  getById: (id) => request("/users/" + id, null, null, true),
  update: (id, data) => request("/users/" + id, "PUT", data, true),
  remove: (id) => request("/users/" + id, "DELETE", null, true),
};
