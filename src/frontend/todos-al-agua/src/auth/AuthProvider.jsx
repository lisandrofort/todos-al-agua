import { useCallback, useEffect, useState } from "react";
import { AuthContext } from "./AuthContext";
import { permisosDeRol } from "./permissions";
import { useSesion } from "./useSesion";
import { apiAuth, getToken, setToken } from "../api/client";

// Leer el token guardado y convertirlo en usuario.
// Si no hay token o venció, devuelve null.
function leerUsuario() {
  const token = getToken();

  if (!token) {
    return null;
  }

  try {
    // Para decodificar el base64 a string normal:
    // ejemplo: {"id":"123","rol":"admin","exp":1790000000}
    const payload = JSON.parse(atob(token.split(".")[1]));

    if (payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return payload;
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  // Estado del usuario al abrir la app.
  const [user, setUser] = useState(leerUsuario);

  // Estados que leen otras pantallas.
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Cerrar sesión: borrar token y estados.
  const cerrarSesion = useCallback(function cerrarSesion() {
    setToken(null);
    setUser(null);
    setSessionExpired(false);
    localStorage.removeItem("todos-al-agua.last-activity");
  }, []);

  // Toda la lógica del cronómetro vive en este hook.
  const { mostrarAviso, extendSession } = useSesion({
    user,
    setUser,
    logout: cerrarSesion,
    setSessionExpired,
  });

  // Iniciar sesión: pedir token al backend y guardarlo.
  async function login({ email, password }) {
    setLoading(true);

    try {
      const { token } = await apiAuth.login(email, password);
      setToken(token);
      setUser(leerUsuario());
      setSessionExpired(false);
      localStorage.setItem("todos-al-agua.last-activity", String(Date.now()));
      window.dispatchEvent(new Event("todos-al-agua:login"));
    } finally {
      setLoading(false);
    }
  }

  // Si venció el JWT en una petición, cerrar la sesión.
  useEffect(() => {
    function alVencer() {
      setSessionExpired(true);
      cerrarSesion();
    }

    window.addEventListener("todos-al-agua:session-expired", alVencer);
    return () =>
      window.removeEventListener("todos-al-agua:session-expired", alVencer);
  }, [cerrarSesion]);

  // Lo que pueden leer todos los componentes con useAuth().
  const value = {
    user,
    login,
    logout: cerrarSesion,
    loading,
    sessionExpired,
    isAuthenticated: Boolean(user),
    hasPermission: (permiso) => permisosDeRol(user?.rol).includes(permiso),
    showSessionWarning: mostrarAviso,
    extendSession,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
