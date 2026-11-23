import { useAuth } from "../auth/AuthContext";
import "./SessionWarning.css";

export default function SessionWarning() {
  const { showSessionWarning, extendSession, logout } = useAuth();

  if (!showSessionWarning) return null;

  return (
    <div className="session-warning-overlay">
      <section
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
          <button className="session-warning-btn session-warning-btn-primary" type="button" onClick={extendSession}>
            Seguir conectado
          </button>
          <button className="session-warning-btn session-warning-btn-secondary" type="button" onClick={logout}>
            Cerrar sesión
          </button>
        </div>
      </section>
    </div>
  );
}
