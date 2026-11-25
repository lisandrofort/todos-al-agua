import { useCallback, useEffect, useRef, useState } from "react";
import { apiAuth, setToken } from "../api/client";

const AVISO_MS = 50 * 1000;  // avisar a los 50 segundos
const CIERRE_MS = 60 * 1000; // cerrar a los 60 segundos
const RENOVAR_MS = 30 * 1000;

// Hook que controla el tiempo de la sesión.
// Se lo llama desde AuthProvider con el usuario y las funciones de sesión.
export function useSesion({ user, setUser, logout, setSessionExpired }) {
  const ultimaActividad = useRef(0);
  const [mostrarAviso, setMostrarAviso] = useState(false);

  // Extender la sesión: pide un token nuevo y resetea el contador.
  const extendSession = useCallback(async () => {
    const { token } = await apiAuth.refresh();
    setToken(token);
    const payload = JSON.parse(atob(token.split(".")[1]));
    setUser(payload);
    ultimaActividad.current = Date.now();
    setMostrarAviso(false);
  }, [setUser]);

  // Al arrancar, marcamos "ahora" como última actividad.
  useEffect(() => {
    ultimaActividad.current = Date.now();
  }, [user]);

  // Renovar el token cuando está por vencer.
  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const id = setInterval(async () => {
      const tiempoRestante = user.exp * 1000 - Date.now();
      if (tiempoRestante < RENOVAR_MS) {
        try {
          await extendSession();
        } catch {
          // si falla, el cronómetro sigue rigiendo
        }
      }
    }, 5000);

    return () => clearInterval(id);
  }, [user, extendSession]);

  // Escuchar actividad del usuario para reiniciar el contador.
  useEffect(() => {
    if (!user) {
      return undefined;
    }

    function reiniciar() {
      ultimaActividad.current = Date.now();
      setMostrarAviso(false);
    }

    window.addEventListener("pointerdown", reiniciar);
    window.addEventListener("keydown", reiniciar);
    window.addEventListener("scroll", reiniciar);

    return () => {
      window.removeEventListener("pointerdown", reiniciar);
      window.removeEventListener("keydown", reiniciar);
      window.removeEventListener("scroll", reiniciar);
    };
  }, [user]);

  // Cronómetro: aviso a los 50 s, cierre a los 60 s sin actividad.
  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const id = setInterval(() => {
      const tiempoInactivo = Date.now() - ultimaActividad.current;

      if (tiempoInactivo >= CIERRE_MS) {
        setSessionExpired(true);
        logout();
      } else if (tiempoInactivo >= AVISO_MS) {
        setMostrarAviso(true);
      }
    }, 1000);

    return () => clearInterval(id);
  }, [user, logout, setSessionExpired]);

  // Sincronizar la actividad entre pestañas.
  useEffect(() => {
    function alCambiar(evento) {
      if (evento.key === "todos-al-agua.last-activity") {
        ultimaActividad.current = Number(evento.newValue);
      }
    }

    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, []);

  return { mostrarAviso, extendSession };
}
