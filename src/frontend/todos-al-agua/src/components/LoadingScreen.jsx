import { useEffect, useState } from "react";
import "./LoadingScreen.css";

const SESSION_KEY = "taa_loading:v1";
const ANIMACION_MS = 1200;
const FADE_MS = 400;

export default function LoadingScreen() {
  const [visible, setVisible] = useState(() => {
    if (window.location.search.includes("animar=1")) {
      document.documentElement.classList.add("forzar-animacion");
    }
    // Con movimiento reducido se muestra apenas un instante y se marca como vista.
    if (
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.location.search.includes("animar=1")
    ) {
      sessionStorage.setItem(SESSION_KEY, "1");
      return false;
    }
    return !sessionStorage.getItem(SESSION_KEY);
  });
  const [saliendo, setSaliendo] = useState(false);

  useEffect(() => {
    if (!visible) return undefined;

    const yaVisto = () => sessionStorage.setItem(SESSION_KEY, "1");

    const finAnimacion = setTimeout(() => {
      setSaliendo(true);
    }, ANIMACION_MS);

    const finFade = setTimeout(() => {
      yaVisto();
      setVisible(false);
    }, ANIMACION_MS + FADE_MS);

    function saltar() {
      clearTimeout(finAnimacion);
      clearTimeout(finFade);
      yaVisto();
      setVisible(false);
    }

    document.addEventListener("keydown", saltar);

    return () => {
      clearTimeout(finAnimacion);
      clearTimeout(finFade);
      document.removeEventListener("keydown", saltar);
    };
  }, [visible]);

  if (!visible) return null;

  return (
    <div
      className={`loading-screen${saliendo ? " is-saliendo" : ""}`}
      role="status"
      aria-live="polite"
      onClick={() => {
        sessionStorage.setItem(SESSION_KEY, "1");
        setVisible(false);
      }}
    >
      <div className="loading-contenido">
        <img
          className="loading-logo"
          src="/asociacion-civil-todos-al-agua-transparente.png"
          alt=""
          width="432"
          height="260"
        />
        <p className="loading-marca">Todos al Agua · Necochea</p>
        <div className="loading-linea" aria-hidden="true">
          <span />
        </div>
        <span className="loading-sr">Cargando…</span>
      </div>
    </div>
  );
}
