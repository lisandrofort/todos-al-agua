const BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:3000";
const TOKEN_KEY = "todos-al-agua.token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  if (token) localStorage.setItem(TOKEN_KEY, token);
  else localStorage.removeItem(TOKEN_KEY);
}

export async function request(path, options = {}) {
  const { method = "GET", body, auth = false } = options;
  const headers = { "Content-Type": "application/json" };

  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

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

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error ?? `Error ${response.status}`);
  }
  return data;
}

export const apiAuth = {
  login: (email, password) =>
    request("/users/login", { method: "POST", body: { email, password } }),
  register: (name, email, password) =>
    request("/users/register", { method: "POST", body: { name, email, password } }),
  forgotPassword: (email) =>
    request("/users/forgot-password", { method: "POST", body: { email } }),
  resetPassword: (token, password) =>
    request("/users/reset-password", { method: "POST", body: { token, password } }),
};

export const apiContact = {
  send: (data) => request("/contact", { method: "POST", body: data }),
};

export const apiMenu = {
  getAll: () => request("/menu"),
  getById: (id) => request(`/menu/${id}`),
  create: (data) => request("/menu", { method: "POST", body: data, auth: true }),
  update: (id, data) => request(`/menu/${id}`, { method: "PUT", body: data, auth: true }),
  remove: (id) => request(`/menu/${id}`, { method: "DELETE", auth: true }),
};

export const apiUsers = {
  getAll: () => request("/users", { auth: true }),
  getById: (id) => request(`/users/${id}`, { auth: true }),
  update: (id, data) => request(`/users/${id}`, { method: "PUT", body: data, auth: true }),
  remove: (id) => request(`/users/${id}`, { method: "DELETE", auth: true }),
};
