import { useEffect, useRef } from "react";
import "../SessionWarning.css";

// Diálogo genérico para acciones delicadas del panel (dar rol admin, borrar usuario).
export default function ConfirmDialog({
  abierto,
  titulo,
  mensaje,
  confirmarTexto,
  onConfirmar,
  onCancelar,
}) {
  const dialogRef = useRef(null);
  const cancelarRef = useRef(null);

  useEffect(() => {
    if (!abierto) return undefined;

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
  }, [abierto, onCancelar]);

  if (!abierto) return null;

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
        aria-labelledby="confirm-dialog-title"
        aria-describedby="confirm-dialog-desc"
      >
        <span className="session-warning-icon" aria-hidden="true">!</span>
        <h2 id="confirm-dialog-title">{titulo}</h2>
        <p id="confirm-dialog-desc">{mensaje}</p>
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
            {confirmarTexto}
          </button>
        </div>
      </section>
    </div>
  );
}
