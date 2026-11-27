import { useCallback, useEffect, useMemo, useState } from "react";
import { AuthContext } from "./AuthContext";
import { permisosDeRol } from "./permissions";
import { useSesion } from "./useSesion";
import { decodificarToken } from "./token";
import {
  apiAuth,
  getToken,
  setToken,
  LOGIN_EVENT,
  SESSION_EXPIRED_EVENT,
} from "../api/client";

const ACTIVIDAD_KEY = "todos-al-agua.last-activity";

// Lee el token guardado y devuelve el payload, o null si venció/no es válido.
function leerUsuario() {
  return decodificarToken(getToken());
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(leerUsuario);
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);

  // Cierre manual: no muestra el aviso de "sesión vencida".
  const cerrarSesion = useCallback(() => {
    setToken(null);
    setUser(null);
    setSessionExpired(false);
    localStorage.removeItem(ACTIVIDAD_KEY);
  }, []);

  // Cierre automático: sí muestra el aviso en /login.
  const expirarSesion = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(ACTIVIDAD_KEY);
    setSessionExpired(true);
  }, []);

  const { mostrarAviso, extendSession } = useSesion({
    user,
    setUser,
    logout: expirarSesion,
    cerrarSesion,
    setSessionExpired,
  });

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const { token } = await apiAuth.login(email, password);
      setToken(token);
      setUser(leerUsuario());
      setSessionExpired(false);
      localStorage.setItem(ACTIVIDAD_KEY, String(Date.now()));
      window.dispatchEvent(new Event(LOGIN_EVENT));
    } finally {
      setLoading(false);
    }
  }, []);

  // Cualquier petición con un JWT rechazado cierra la sesión y avisa.
  useEffect(() => {
    window.addEventListener(SESSION_EXPIRED_EVENT, expirarSesion);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, expirarSesion);
  }, [expirarSesion]);

  const hasPermission = useCallback(
    (permiso) => permisosDeRol(user?.rol).includes(permiso),
    [user],
  );

  const value = useMemo(
    () => ({
      user,
      login,
      logout: cerrarSesion,
      loading,
      sessionExpired,
      isAuthenticated: Boolean(user),
      hasPermission,
      showSessionWarning: mostrarAviso,
      extendSession,
    }),
    [
      user,
      login,
      cerrarSesion,
      loading,
      sessionExpired,
      hasPermission,
      mostrarAviso,
      extendSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
