// URL del backend: la de producción si está configurada, si no el localhost.
const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";

// Nombre con el que guardamos el JWT en localStorage.
export const TOKEN_KEY = "todos-al-agua.token";
// Megáfono que avisa que alguien inició sesión.
export const LOGIN_EVENT = "todos-al-agua:login";
// Megáfono que avisa que el token venció (401).
export const SESSION_EXPIRED_EVENT = "todos-al-agua:session-expired";

// Leer el JWT guardado, o null si no hay sesión.
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

// Guardar el JWT; si no nos dan token, lo borramos (logout).
export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

// Motor de la API: hace el fetch, manda el token y convierte errores en mensajes.
export async function request(path, options = {}) {
  const { method = "GET", body, auth = false } = options;
  const headers = { "Content-Type": "application/json" };

  // Si la ruta pide autenticación, agregamos el Bearer.
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  // Llamamos al servidor; si no responde, damos un mensaje claro.
  let response;
  try {
    response = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (cause) {
    throw new Error("No se pudo conectar con el servidor. Intentá de nuevo.", { cause });
  }

  // Leemos la respuesta y, si falla, avisamos (y si es 401, cerramos sesión).
  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    if (auth && response.status === 401 && typeof window !== "undefined") {
      window.dispatchEvent(new Event(SESSION_EXPIRED_EVENT));
    }
    throw new Error(data.error ?? `Error ${response.status}`);
  }
  return data;
}

// Atajos para todo lo de sesión: login, registro, recuperación y refresh.
export const apiAuth = {
  // Ingresar con email y contraseña.
  login: (email, password) =>
    request("/users/login", { method: "POST", body: { email, password } }),
  // Crear cuenta (el email se guarda en minúsculas).
  register: (name, email, password) =>
    request("/users/register", {
      method: "POST",
      body: { name, email: email.trim().toLowerCase(), password },
    }),
  // Preguntar si un email ya está registrado.
  emailExists: (email) =>
    request(`/users/exists?email=${encodeURIComponent(email.trim().toLowerCase())}`),
  // Pedir el mail con el link para recuperar la contraseña.
  forgotPassword: (email) =>
    request("/users/forgot-password", { method: "POST", body: { email } }),
  // Guardar la contraseña nueva con el token del mail.
  resetPassword: (token, password) =>
    request("/users/reset-password", { method: "POST", body: { token, password } }),
  // Pedir un JWT nuevo sin volver a escribir la contraseña.
  refresh: () => request("/users/refresh", { method: "POST", auth: true }),
};

// Enviar el mensaje del formulario de contacto.
export const apiContact = {
  send: (data) => request("/contact", { method: "POST", body: data }),
};

// Atajos para la carta: leer es público, escribir requiere admin.
export const apiMenu = {
  // Traer todas las categorías y platos.
  getAll: () => request("/menu"),
  // Traer una categoría por ID.
  getById: (id) => request(`/menu/${id}`),
  // Crear una categoría nueva.
  create: (data) => request("/menu", { method: "POST", body: data, auth: true }),
  // Editar una categoría.
  update: (id, data) => request(`/menu/${id}`, { method: "PUT", body: data, auth: true }),
  // Borrar una categoría.
  remove: (id) => request(`/menu/${id}`, { method: "DELETE", auth: true }),
};

// Atajos para usuarios: todas las rutas piden token y rol admin.
export const apiUsers = {
  // Listar usuarios para el panel.
  getAll: () => request("/users", { auth: true }),
  // Traer un usuario por ID.
  getById: (id) => request(`/users/${id}`, { auth: true }),
  // Cambiar datos o rol de un usuario.
  update: (id, data) => request(`/users/${id}`, { method: "PUT", body: data, auth: true }),
  // Eliminar un usuario.
  remove: (id) => request(`/users/${id}`, { method: "DELETE", auth: true }),
};
