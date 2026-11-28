import { useCallback, useEffect, useRef, useState } from "react";
import { BasketIcon, SproutIcon, StoreIcon } from "../ui/icons";
import "./WelcomeGate.css";

export const WELCOME_KEY = "taa_welcome:v1";
export const WELCOME_EVENT = "taa:show-welcome";

const OPCIONES = [
  {
    href: "/cantina",
    titulo: "Cantina El Muelle",
    texto: "Cantina inclusiva en el Necochea Rowing Club.",
    etiqueta: "Cantina",
    Icono: StoreIcon,
    tono: "coral",
  },
  {
    href: "/panificadora",
    titulo: "Flor de Pan",
    texto: "Panificados sin TACC hechos en el proyecto inclusivo.",
    etiqueta: "Sin TACC",
    Icono: BasketIcon,
    tono: "sol",
  },
  {
    href: "/huerta",
    titulo: "Huerta y vivero",
    texto: "Plantines, aromáticas, flores y semillas.",
    etiqueta: "Vivero",
    Icono: SproutIcon,
    tono: "verde",
  },
];

export default function WelcomeGate() {
  const [abierto, setAbierto] = useState(() => !localStorage.getItem(WELCOME_KEY));
  const dialogRef = useRef(null);
  const primeraRef = useRef(null);

  const marcarVista = useCallback(() => {
    localStorage.setItem(WELCOME_KEY, "1");
  }, []);

  const cerrar = useCallback(() => {
    marcarVista();
    setAbierto(false);
  }, [marcarVista]);

  useEffect(() => {
    function mostrar() {
      setAbierto(true);
    }
    window.addEventListener(WELCOME_EVENT, mostrar);
    return () => window.removeEventListener(WELCOME_EVENT, mostrar);
  }, []);

  useEffect(() => {
    if (!abierto) return undefined;

    const overflowAnterior = document.body.style.overflow;
    const focoAnterior = document.activeElement;
    document.body.style.overflow = "hidden";
    primeraRef.current?.focus();

    function alPresionar(event) {
      if (event.key === "Escape") {
        cerrar();
        return;
      }
      if (event.key !== "Tab") return;

      const enlaces = dialogRef.current?.querySelectorAll("a, button");
      if (!enlaces?.length) return;
      const primero = enlaces[0];
      const ultimo = enlaces[enlaces.length - 1];

      if (event.shiftKey && document.activeElement === primero) {
        event.preventDefault();
        ultimo.focus();
      } else if (!event.shiftKey && document.activeElement === ultimo) {
        event.preventDefault();
        primero.focus();
      }
    }

    document.addEventListener("keydown", alPresionar);
    return () => {
      document.body.style.overflow = overflowAnterior;
      document.removeEventListener("keydown", alPresionar);
      focoAnterior?.focus?.();
    };
  }, [abierto, cerrar]);

  if (!abierto) return null;

  return (
    <div className="welcome-overlay">
      <section
        ref={dialogRef}
        className="welcome-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
        aria-describedby="welcome-desc"
      >
        <img
          className="welcome-logo"
          src="/asociacion-civil-todos-al-agua-transparente.png"
          alt=""
          width="432"
          height="260"
        />
        <p className="welcome-eyebrow">Asociación Civil · Necochea</p>
        <h2 id="welcome-title">¿Por dónde querés empezar?</h2>
        <p id="welcome-desc" className="welcome-copy">
          Cantina, panificadora y huerta: elegí un espacio o recorré todo el
          sitio.
        </p>

        <div className="welcome-opciones">
          {OPCIONES.map((opcion, index) => {
            const Icono = opcion.Icono;
            return (
              <a
                key={opcion.href}
                ref={index === 0 ? primeraRef : undefined}
                className={`welcome-opcion welcome-opcion--${opcion.tono}`}
                href={opcion.href}
                style={{ animationDelay: `${index * 80}ms` }}
                onClick={marcarVista}
              >
                <span className="welcome-opcion-icono">
                  <Icono />
                </span>
                <span className="welcome-opcion-etiqueta">{opcion.etiqueta}</span>
                <strong>{opcion.titulo}</strong>
                <small>{opcion.texto}</small>
                <span className="welcome-opcion-flecha" aria-hidden="true">
                  ↗
                </span>
              </a>
            );
          })}
        </div>

        <button className="welcome-ver-todo" type="button" onClick={cerrar}>
          Ver todo el sitio
        </button>
        <p className="welcome-pista">Podés cambiar de sección cuando quieras.</p>
      </section>
    </div>
  );
}
