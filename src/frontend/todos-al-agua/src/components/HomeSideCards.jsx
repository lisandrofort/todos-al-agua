import { useEffect, useRef } from "react";
import "./HomeSideCards.css";

// Fotos reales publicadas por el Municipio de Necochea y medios locales.
// Cada card enlaza a la nota original.
const NOTICIAS = [
  {
    imagen: "/noticias/aniversario-10-anos.jpg",
    etiqueta: "Junio 2026",
    titulo: "10 años de inclusión",
    texto: "La escuela cumple una década brindando clases gratuitas de natación adaptada.",
    fuente: "Actualidad Política",
    enlace:
      "https://actualidadpolitica.com.ar/2026/06/07/una-escuela-de-inclusion-un-estilo-de-vida-todos-al-agua-cumplio-10-anos/",
  },
  {
    imagen: "/noticias/escuela-inclusion-2026.jpeg",
    etiqueta: "Junio 2026",
    titulo: "Una escuela de inclusión",
    texto: "Un estilo de vida que crece dentro y fuera del agua.",
    fuente: "Actualidad Política",
    enlace:
      "https://actualidadpolitica.com.ar/2026/06/07/una-escuela-de-inclusion-un-estilo-de-vida-todos-al-agua-cumplio-10-anos/",
  },
  {
    imagen: "/noticias/nacional-2025.jpeg",
    etiqueta: "Septiembre 2025",
    titulo: "Nacional de natación adaptada",
    texto: "La ciudad recibió una nueva edición del torneo nacional.",
    fuente: "Municipalidad de Necochea",
    enlace:
      "https://necochea.gov.ar/todos-al-agua-es-una-politica-publica-que-debe-trascender-a-cualquier-gobierno-en-particular/",
  },
  {
    imagen: "/noticias/bonaerenses-2025.jpg",
    etiqueta: "Agosto 2025",
    titulo: "Brilló en el regional",
    texto: "Necochea ya tiene finalistas para los Juegos Bonaerenses.",
    fuente: "Necochea Digital",
    enlace:
      "https://necocheadigital.com/nota/115967/todos-al-agua-brillo-en-el-regional-y-necochea-ya-tiene-finalistas-para-los-bonaerenses/",
  },
  {
    imagen: "/noticias/juegos-bonaerenses-2025.jpeg",
    etiqueta: "Julio 2025",
    titulo: "Etapa local de los Juegos",
    texto: "La delegación participó de la instancia bonaerense.",
    fuente: "Municipalidad de Necochea",
    enlace:
      "https://necochea.gov.ar/todos-al-agua-participo-de-la-etapa-local-de-los-juegos-bonaerenses/",
  },
  {
    imagen: "/noticias/temporada-2025.jpeg",
    etiqueta: "Marzo 2025",
    titulo: "Arrancó la temporada 2025",
    texto: "Reunión informativa para empezar el año en el agua.",
    fuente: "Municipalidad de Necochea",
    enlace:
      "https://necochea.gov.ar/se-puso-en-marcha-todos-al-agua-2025-es-fundamental-sostener-este-programa-como-una-politica-de-estado/",
  },
];

const VELOCIDAD = 14; // px por segundo

function Grupo({ duplicado = false }) {
  return (
    <div className="side-cards-grupo" aria-hidden={duplicado ? "true" : undefined}>
      {NOTICIAS.map((noticia, index) => (
        <article className="side-card" key={`${noticia.titulo}-${index}`}>
          <div className="side-card-imagen">
            <img
              src={noticia.imagen}
              alt={noticia.titulo}
              loading={duplicado ? "lazy" : "eager"}
            />
          </div>
          <div className="side-card-cuerpo">
            <span className="side-card-etiqueta">{noticia.etiqueta}</span>
            <h3>{noticia.titulo}</h3>
            <p>{noticia.texto}</p>
            <a
              className="side-card-fuente"
              href={noticia.enlace}
              target="_blank"
              rel="noopener noreferrer"
              tabIndex={duplicado ? -1 : 0}
            >
              {noticia.fuente} ↗
            </a>
          </div>
        </article>
      ))}
    </div>
  );
}

export default function HomeSideCards() {
  const viewportRef = useRef(null);
  const positionRef = useRef(0);
  const pausedRef = useRef(false);

  useEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport) return undefined;

    // ?animar=1 permite ver el movimiento aunque el sistema pida menos animación.
    const sinMovimiento =
      window.matchMedia("(prefers-reduced-motion: reduce)").matches &&
      !window.location.search.includes("animar=1");

    let frame;
    let anterior = performance.now();

    function ajustar(valor) {
      const mitad = viewport.scrollWidth / 2;
      let siguiente = valor % mitad;
      if (siguiente < 0) siguiente += mitad;
      positionRef.current = siguiente;
      viewport.scrollLeft = siguiente;
    }

    function avanzar(ahora) {
      const delta = ahora - anterior;
      anterior = ahora;
      if (!pausedRef.current && !sinMovimiento) {
        ajustar(positionRef.current + (delta / 1000) * VELOCIDAD);
      }
      frame = requestAnimationFrame(avanzar);
    }
    frame = requestAnimationFrame(avanzar);

    function alRueda(event) {
      const delta = Math.abs(event.deltaY) > Math.abs(event.deltaX)
        ? event.deltaY
        : event.deltaX;
      if (!delta) return;
      event.preventDefault();
      pausedRef.current = true;
      ajustar(positionRef.current + delta);
    }

    function reanudar() {
      pausedRef.current = false;
    }
    function pausar() {
      pausedRef.current = true;
    }
    function alSalir() {
      pausedRef.current = false;
    }

    viewport.addEventListener("wheel", alRueda, { passive: false });
    viewport.addEventListener("pointerenter", pausar);
    viewport.addEventListener("pointerleave", alSalir);
    viewport.addEventListener("focusin", pausar);
    viewport.addEventListener("focusout", reanudar);

    return () => {
      cancelAnimationFrame(frame);
      viewport.removeEventListener("wheel", alRueda);
      viewport.removeEventListener("pointerenter", pausar);
      viewport.removeEventListener("pointerleave", alSalir);
      viewport.removeEventListener("focusin", pausar);
      viewport.removeEventListener("focusout", reanudar);
    };
  }, []);

  return (
    <section className="side-cards" aria-label="Novedades de Todos al Agua">
      <div className="side-cards-viewport" ref={viewportRef}>
        <div className="side-cards-via">
          <Grupo />
          <Grupo duplicado />
        </div>
      </div>
    </section>
  );
}
