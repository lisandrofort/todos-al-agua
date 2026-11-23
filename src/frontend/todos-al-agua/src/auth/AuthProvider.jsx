import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AuthContext } from "./AuthContext";
import { permisosDeRol } from "./permissions";
import {
  getToken,
  setToken,
  apiAuth,
  TOKEN_KEY,
  LOGIN_EVENT,
  SESSION_EXPIRED_EVENT,
} from "../api/client";

const REFRESH_WINDOW_MS = 20 * 1000;
const WARNING_WINDOW_MS = 10 * 1000;
const ACTIVITY_THROTTLE_MS = 5 * 1000;
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "visibilitychange"];
const ACTIVITY_LISTENER_OPTIONS = { passive: true, capture: true };

function userFromToken(token) {
  if (!token) return null;
  try {
    const rawPayload = token.split(".")[1];
    const base64 = rawPayload.replace(/-/g, "+").replace(/_/g, "/");
    const padded = base64.padEnd(Math.ceil(base64.length / 4) * 4, "=");
    const payload = JSON.parse(atob(padded));

    if (typeof payload.exp !== "number" || payload.exp * 1000 <= Date.now()) {
      return null;
    }

    return {
      email: payload.email,
      rol: payload.rol,
      name: payload.name,
      id: payload.id,
      exp: payload.exp,
    };
  } catch {
    return null;
  }
}

export default function AuthProvider({ children }) {
  const [user, setUser] = useState(() => userFromToken(getToken()));
  const [loading, setLoading] = useState(false);
  const [sessionExpired, setSessionExpired] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const refreshingRef = useRef(false);

  useEffect(() => {
    if (getToken() && !user) setToken(null);
  }, [user]);

  const expireSession = useCallback(() => {
    setToken(null);
    setUser(null);
    setSessionExpired(true);
    setShowWarning(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    setSessionExpired(false);
    setShowWarning(false);
  }, []);

  const refreshSession = useCallback(async () => {
    if (refreshingRef.current) return false;
    refreshingRef.current = true;

    try {
      const { token } = await apiAuth.refresh();
      const nextUser = userFromToken(token);
      if (!nextUser) {
        expireSession();
        return false;
      }
      setToken(token);
      setUser(nextUser);
      setShowWarning(false);
      return true;
    } catch {
      // Un 401 ya dispara SESSION_EXPIRED_EVENT. Ante un error de red se conserva
      // el token actual y el temporizador original sigue rigiendo el vencimiento.
      return false;
    } finally {
      refreshingRef.current = false;
    }
  }, [expireSession]);

  const login = useCallback(async ({ email, password }) => {
    setLoading(true);
    try {
      const { token } = await apiAuth.login(email, password);
      setToken(token);
      const nextUser = userFromToken(token);
      if (!nextUser) throw new Error("No se pudo leer la sesión del servidor");
      setUser(nextUser);
      setSessionExpired(false);
      setShowWarning(false);
      window.dispatchEvent(new Event(LOGIN_EVENT));
      return nextUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // Cierre exacto cuando vence el JWT (el backend sigue siendo la autoridad).
  useEffect(() => {
    if (!user?.exp) return undefined;

    const msUntilExpiry = user.exp * 1000 - Date.now();
    if (msUntilExpiry <= 0) {
      const timer = setTimeout(expireSession, 0);
      return () => clearTimeout(timer);
    }

    const timer = setTimeout(expireSession, msUntilExpiry);
    return () => clearTimeout(timer);
  }, [user?.exp, expireSession]);

  // Aviso previo para que el usuario pueda renovar o cerrar.
  useEffect(() => {
    if (!user?.exp) return undefined;

    const msUntilWarning = user.exp * 1000 - Date.now() - WARNING_WINDOW_MS;
    const delay = msUntilWarning > 0 ? msUntilWarning : 0;
    const timer = setTimeout(() => setShowWarning(true), delay);
    return () => clearTimeout(timer);
  }, [user?.exp]);

  // Renovación por actividad real: si no hay actividad, el token vence solo.
  useEffect(() => {
    if (!user?.exp) return undefined;

    let lastHandled = 0;

    async function handleActivity(event) {
      if (event.type === "visibilitychange" && document.visibilityState !== "visible") {
        return;
      }

      const now = Date.now();
      if (now - lastHandled < ACTIVITY_THROTTLE_MS) return;
      lastHandled = now;

      if (user.exp * 1000 - now <= REFRESH_WINDOW_MS) {
        await refreshSession();
      }
    }

    ACTIVITY_EVENTS.forEach((type) => {
      const target = type === "visibilitychange" ? document : window;
      target.addEventListener(type, handleActivity, ACTIVITY_LISTENER_OPTIONS);
    });

    return () => {
      ACTIVITY_EVENTS.forEach((type) => {
        const target = type === "visibilitychange" ? document : window;
        target.removeEventListener(type, handleActivity, ACTIVITY_LISTENER_OPTIONS);
      });
    };
  }, [user?.exp, refreshSession]);

  // Un 401 en cualquier petición autenticada cierra la sesión en todo el frontend.
  useEffect(() => {
    function handleSessionExpired() {
      expireSession();
    }

    window.addEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
    return () => window.removeEventListener(SESSION_EXPIRED_EVENT, handleSessionExpired);
  }, [expireSession]);

  // Mantener pestañas sincronizadas (login, refresh y logout).
  useEffect(() => {
    function handleStorage(event) {
      if (event.key !== TOKEN_KEY) return;

      const nextUser = userFromToken(event.newValue);
      if (nextUser) {
        setUser(nextUser);
        setShowWarning(false);
      } else {
        logout();
      }
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, [logout]);

  const permissions = useMemo(() => permisosDeRol(user?.rol), [user?.rol]);
  const hasPermission = useCallback(
    (permission) => permissions.includes(permission),
    [permissions],
  );

  const value = useMemo(
    () => ({
      user,
      permissions,
      isAuthenticated: Boolean(user),
      isAdmin: user?.rol === "admin",
      hasPermission,
      login,
      logout,
      loading,
      sessionExpired,
      showSessionWarning: showWarning,
      extendSession: refreshSession,
    }),
    [
      user,
      permissions,
      hasPermission,
      login,
      logout,
      loading,
      sessionExpired,
      showWarning,
      refreshSession,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
