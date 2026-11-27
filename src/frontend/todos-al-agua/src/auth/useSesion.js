import { useCallback, useEffect, useRef, useState } from "react";
import { apiAuth, setToken, TOKEN_KEY } from "../api/client";
import { decodificarToken } from "./token";

const AVISO_MS = 500 * 1000; // avisar a los ~8 minutos de inactividad
const CIERRE_MS = 600 * 1000; // cerrar a los 10 minutos de inactividad
const RENOVAR_MS = 300 * 1000; // renovar el JWT cuando queden menos de 5 min
const ACTIVIDAD_KEY = "todos-al-agua.last-activity";

// Hook que controla el tiempo de la sesión y lo sincroniza entre pestañas.
export function useSesion({ user, setUser, logout, cerrarSesion, setSessionExpired }) {
  const ultimaActividad = useRef(0);
  const ultimoGuardado = useRef(0);
  const sesionIniciada = useRef(false);
  const [mostrarAviso, setMostrarAviso] = useState(false);
  const [segundosRestantes, setSegundosRestantes] = useState(0);

  const marcarActividad = useCallback(() => {
    const ahora = Date.now();
    ultimaActividad.current = ahora;
    setMostrarAviso(false);
    setSegundosRestantes(0);
    // Escribir en localStorage dispara el evento "storage" en las otras pestañas.
    if (ahora - ultimoGuardado.current > 1000) {
      ultimoGuardado.current = ahora;
      localStorage.setItem(ACTIVIDAD_KEY, String(ahora));
    }
  }, []);

  // Renovar el JWT: NO toca el cronómetro (es automático, no actividad).
  const renovarToken = useCallback(async () => {
    const { token } = await apiAuth.refresh();
    const payload = decodificarToken(token);
    if (!payload) {
      throw new Error("El token renovado no es válido");
    }
    setToken(token);
    setUser(payload);
  }, [setUser]);

  // Cerrar por inactividad y volver al inicio. replace() evita volver atrás
  // a una ruta protegida ya sin sesión.
  const cerrarYVolverAlInicio = useCallback(() => {
    logout();
    setSessionExpired(true);
    window.location.replace("/");
  }, [logout, setSessionExpired]);

  // Extender desde el botón: renueva y SÍ resetea el contador.
  const extendSession = useCallback(async () => {
    try {
      await renovarToken();
      marcarActividad();
    } catch {
      // Si el backend no responde (Render suspendido), no dejamos la sesión
      // a medias: se cierra y se vuelve al inicio igual que por inactividad.
      cerrarYVolverAlInicio();
    }
  }, [renovarToken, marcarActividad, cerrarYVolverAlInicio]);

  // Al arrancar la sesión, marcamos "ahora" como última actividad.
  useEffect(() => {
    if (!user) {
      sesionIniciada.current = false;
      return;
    }
    if (sesionIniciada.current) {
      return;
    }
    ultimaActividad.current = Date.now();
    sesionIniciada.current = true;
  }, [user]);

  // Renovar el token cuando está por vencer.
  useEffect(() => {
    if (!user || typeof user.exp !== "number") {
      return undefined;
    }

    const id = setInterval(async () => {
      const tiempoRestante = user.exp * 1000 - Date.now();
      if (tiempoRestante < RENOVAR_MS) {
        try {
          await renovarToken();
        } catch {
          // si falla, el cronómetro de inactividad sigue rigiendo
        }
      }
    }, 5000);

    return () => clearInterval(id);
  }, [user, renovarToken]);

  // Escuchar actividad del usuario para reiniciar el contador.
  useEffect(() => {
    if (!user) {
      return undefined;
    }

    window.addEventListener("pointerdown", marcarActividad);
    window.addEventListener("keydown", marcarActividad);
    window.addEventListener("scroll", marcarActividad);

    return () => {
      window.removeEventListener("pointerdown", marcarActividad);
      window.removeEventListener("keydown", marcarActividad);
      window.removeEventListener("scroll", marcarActividad);
    };
  }, [user, marcarActividad]);

  // Cronómetro: aviso a los ~8 min, cierre a los 10 min sin actividad.
  useEffect(() => {
    if (!user) {
      return undefined;
    }

    const id = setInterval(() => {
      const tiempoInactivo = Date.now() - ultimaActividad.current;

      if (tiempoInactivo >= CIERRE_MS) {
        // Con el modal sin respuesta, cerramos y volvemos al inicio.
        cerrarYVolverAlInicio();
      } else if (tiempoInactivo >= AVISO_MS) {
        setMostrarAviso(true);
        // El modal dura CIERRE_MS - AVISO_MS (100 s); mostramos ese tramo.
        setSegundosRestantes(
          Math.max(0, Math.ceil((CIERRE_MS - tiempoInactivo) / 1000)),
        );
      }
    }, 1000);

    return () => clearInterval(id);
  }, [user, cerrarYVolverAlInicio]);

  // Sincronizar actividad, login y logout entre pestañas.
  useEffect(() => {
    function alCambiar(evento) {
      if (evento.key === ACTIVIDAD_KEY && evento.newValue) {
        ultimaActividad.current = Number(evento.newValue);
        setMostrarAviso(false);
      }
      if (evento.key === TOKEN_KEY) {
        const payload = decodificarToken(evento.newValue);
        if (payload) {
          ultimaActividad.current = Date.now();
          sesionIniciada.current = true;
          setUser(payload);
          setSessionExpired(false);
        } else {
          cerrarSesion();
        }
      }
    }

    window.addEventListener("storage", alCambiar);
    return () => window.removeEventListener("storage", alCambiar);
  }, [setUser, cerrarSesion, setSessionExpired]);

  return { mostrarAviso, segundosRestantes, extendSession };
}
