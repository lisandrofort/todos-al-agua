import { useEffect, useRef } from "react";
import "../SessionWarning.css";

// Diálogo de confirmación para entregar el rol más alto a otro usuario.
export default function ConfirmAdminDialog({ usuario, onConfirmar, onCancelar }) {
  const dialogRef = useRef(null);
  const cancelarRef = useRef(null);

  useEffect(() => {
    if (!usuario) return undefined;

    cancelarRef.current?.focus();

    function alPresionar(event) {
      if (event.key === "Escape") {
        onCancelar();
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
  }, [usuario, onCancelar]);

  if (!usuario) return null;

  return (
    <div
      className="session-warning-overlay"
      onMouseDown={(event) => {
        if (event.target === event.currentTarget) onCancelar();
      }}
    >
      <section
        ref={dialogRef}
        className="session-warning"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="confirm-admin-title"
        aria-describedby="confirm-admin-desc"
      >
        <span className="session-warning-icon" aria-hidden="true">★</span>
        <h2 id="confirm-admin-title">¿Dar rol de administrador?</h2>
        <p id="confirm-admin-desc">
          Estás por dar el rol más alto a{" "}
          <strong>{usuario.nombre}</strong> ({usuario.email}). Podrá ver y
          modificar usuarios, menú y huerta.
        </p>
        <div className="session-warning-actions">
          <button
            ref={cancelarRef}
            className="session-warning-btn session-warning-btn-secondary"
            type="button"
            onClick={onCancelar}
          >
            Cancelar
          </button>
          <button
            className="session-warning-btn session-warning-btn-danger"
            type="button"
            onClick={onConfirmar}
          >
            Sí, dar rol de administrador
          </button>
        </div>
      </section>
    </div>
  );
}
