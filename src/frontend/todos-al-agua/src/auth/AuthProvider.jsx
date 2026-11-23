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

const INACTIVITY_LIMIT_MS = 60 * 1000;
const INACTIVITY_WARNING_MS = 50 * 1000;
const REFRESH_THRESHOLD_MS = 30 * 1000;
const ACTIVITY_THROTTLE_MS = 1000;
const LAST_ACTIVITY_KEY = "todos-al-agua.last-activity";
const ACTIVITY_EVENTS = ["pointerdown", "keydown", "scroll", "visibilitychange"];
const ACTIVITY_LISTENER_OPTIONS = { passive: true, capture: true };

function readLastActivity() {
  const stored = Number(localStorage.getItem(LAST_ACTIVITY_KEY));
  return Number.isFinite(stored) && stored > 0 ? stored : Date.now();
}

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
  const lastActivityRef = useRef(readLastActivity());

  useEffect(() => {
    if (getToken() && !user) setToken(null);
  }, [user]);

  const expireSession = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    lastActivityRef.current = Date.now();
    setSessionExpired(true);
    setShowWarning(false);
  }, []);

  const logout = useCallback(() => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(LAST_ACTIVITY_KEY);
    lastActivityRef.current = Date.now();
    setSessionExpired(false);
    setShowWarning(false);
  }, []);

  const refreshSession = useCallback(async () => {
    if (refreshingRef.current) return false;
    refreshingRef.current = true;

    const now = Date.now();
    lastActivityRef.current = now;
    localStorage.setItem(LAST_ACTIVITY_KEY, String(now));

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
      const now = Date.now();
      lastActivityRef.current = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      setSessionExpired(false);
      setShowWarning(false);
      window.dispatchEvent(new Event(LOGIN_EVENT));
      return nextUser;
    } finally {
      setLoading(false);
    }
  }, []);

  // Actividad real: reinicia el cronómetro de inactividad y renueva el JWT
  // cuando está por vencer, para que el backend no corte antes del cronómetro.
  useEffect(() => {
    if (!user) return undefined;

    let lastHandled = 0;

    async function handleActivity(event) {
      if (event.type === "visibilitychange" && document.visibilityState !== "visible") {
        return;
      }

      const now = Date.now();
      if (now - lastHandled < ACTIVITY_THROTTLE_MS) return;
      lastHandled = now;

      lastActivityRef.current = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
      setShowWarning(false);

      try {
        const token = getToken();
        if (!token) return;
        const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
        const payload = JSON.parse(atob(base64));
        if (payload.exp * 1000 - now < REFRESH_THRESHOLD_MS) {
          await refreshSession();
        }
      } catch {
        // Token ilegible: sigue rigiendo el cronómetro y el backend validará.
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
  }, [user, refreshSession]);

  // Cronómetro de inactividad: aviso a los 50 s y cierre a los 60 s.
  useEffect(() => {
    if (!user) return undefined;

    // Si venimos de una sesión anterior (pestaña recargada), arrancamos de cero.
    if (Date.now() - lastActivityRef.current >= INACTIVITY_LIMIT_MS) {
      const now = Date.now();
      lastActivityRef.current = now;
      localStorage.setItem(LAST_ACTIVITY_KEY, String(now));
    }

    const timer = setInterval(() => {
      const idleMs = Date.now() - lastActivityRef.current;
      if (idleMs >= INACTIVITY_LIMIT_MS) {
        expireSession();
      } else if (idleMs >= INACTIVITY_WARNING_MS) {
        setShowWarning(true);
      }
    }, 1000);

    return () => clearInterval(timer);
  }, [user, expireSession]);

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
      if (event.key === LAST_ACTIVITY_KEY) {
        const value = Number(event.newValue);
        if (Number.isFinite(value) && value > 0) {
          lastActivityRef.current = value;
        }
        return;
      }

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
