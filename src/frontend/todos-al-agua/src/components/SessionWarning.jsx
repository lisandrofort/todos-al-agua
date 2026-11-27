import { useEffect, useRef } from "react";
import { useAuth } from "../auth/AuthContext";
import "./SessionWarning.css";

export default function SessionWarning() {
  const { showSessionWarning, extendSession, logout } = useAuth();
  const dialogRef = useRef(null);
  const primaryRef = useRef(null);

  useEffect(() => {
    if (!showSessionWarning) return undefined;

    primaryRef.current?.focus();

    function alPresionar(event) {
      if (event.key === "Escape") {
        logout();
        return;
      }
      if (event.key !== "Tab") return;

      const botones = dialogRef.current?.querySelectorAll("button");
      if (!botones?.length) return;
      const primero = botones[0];
      const ultimo = botones[botones.length - 1];

      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", alPresionar);
    return () => document.removeEventListener("keydown", alPresionar);
  }, [showSessionWarning, logout]);

  if (!showSessionWarning) return null;

  return (
    <div className="session-warning-overlay">
      <section
        ref={dialogRef}
        className="session-warning"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="session-warning-title"
        aria-describedby="session-warning-description"
      >
        <span className="session-warning-icon" aria-hidden="true">⏱</span>
        <h2 id="session-warning-title">¿Seguís ahí?</h2>
        <p id="session-warning-description">
          Tu sesión se cierra por inactividad en unos segundos.
        </p>
        <div className="session-warning-actions">
          <button
            ref={primaryRef}
            className="session-warning-btn session-warning-btn-primary"
            type="button"
            onClick={extendSession}
          >
            Seguir conectado
          </button>
          <button
            className="session-warning-btn session-warning-btn-secondary"
            type="button"
            onClick={logout}
          >
            Cerrar sesión
          </button>
        </div>
      </section>
    </div>
  );
}
