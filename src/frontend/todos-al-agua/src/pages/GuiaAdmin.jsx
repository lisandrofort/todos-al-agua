import {
  CheckCircleIcon,
  ClockIcon,
  LeafIcon,
  PlateIcon,
  StarIcon,
  WavesIcon,
} from "../ui/icons";
import "./GuiaAdmin.css";

function GuiaHero() {
  return (
    <svg viewBox="0 0 320 220" className="guia-hero-art" aria-hidden="true">
      <defs>
        <linearGradient id="guia-ola" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#00a8e8" />
          <stop offset="1" stopColor="#004b91" />
        </linearGradient>
      </defs>
      <circle cx="160" cy="110" r="98" fill="rgba(255,255,255,.14)" />
      <circle cx="160" cy="110" r="74" fill="rgba(255,255,255,.1)" />
      <path
        d="M18 150c34 0 34-26 68-26s34 26 68 26 34-26 68-26 34 26 80 26v50H18z"
        fill="url(#guia-ola)"
      />
      <path
        d="M18 166c34 0 34-26 68-26s34 26 68 26 34-26 68-26 34 26 80 26"
        stroke="#fff"
        strokeOpacity=".55"
        strokeWidth="3"
        fill="none"
      />
      <circle cx="96" cy="80" r="18" fill="#ffd34d" />
      <circle cx="160" cy="64" r="18" fill="#8ed44b" />
      <circle cx="224" cy="80" r="18" fill="#ff9d2e" />
      <path
        d="M78 104c0-18 8-28 18-28s18 10 18 28M142 88c0-18 8-28 18-28s18 10 18 28M206 104c0-18 8-28 18-28s18 10 18 28"
        fill="#fff"
        fillOpacity=".92"
      />
      <circle cx="160" cy="36" r="10" fill="#fff" fillOpacity=".9" />
    </svg>
  );
}

const ROLES = [
  {
    nombre: "Admin",
    color: "azul",
    texto: "Todo el panel: usuarios, carta, huerta y roles.",
    items: ["Usuarios", "Carta", "Huerta", "Cambiar roles"],
  },
  {
    nombre: "Cantina",
    color: "naranja",
    texto: "Solo la carta de El Muelle.",
    items: ["Carta"],
  },
  {
    nombre: "Huerta",
    color: "verde",
    texto: "Tu sección de la huerta.",
    items: ["Huerta"],
  },
  {
    nombre: "Usuario",
    color: "gris",
    texto: "Sin panel. Solo el sitio público.",
    items: [],
  },
];

const PASOS_USUARIOS = [
  {
    numero: "1",
    titulo: "Encontrá a alguien",
    texto: "Escribí el nombre o el email arriba de la lista. Filtra mientras escribís.",
  },
  {
    numero: "2",
    titulo: "Ordená la lista",
    texto: "Tocá Nombre o Email. La flechita ▲ ▼ muestra el sentido.",
  },
  {
    numero: "3",
    titulo: "Cambiá o borrá",
    texto: "Elegí un rol en el desplegable o tocá la × para eliminar. Siempre preguntamos antes.",
  },
];

const PASOS_CARTA = [
  {
    numero: "1",
    titulo: "Elegí una categoría",
    texto: "A la izquierda. Podés agregar, renombrar o borrar categorías.",
  },
  {
    numero: "2",
    titulo: "Editá los platos",
    texto: "Nombre, descripción, precio o precios chica/grande.",
  },
  {
    numero: "3",
    titulo: "Guardá y mirá",
    texto: "Tocá Guardar cambios y comprobá el resultado en /cantina.",
  },
];

const PREGUNTAS = [
  {
    q: "¿Cuánto dura mi sesión?",
    a: "15 minutos con actividad. Si pasás 8 minutos sin tocar nada, aparece un aviso con cuenta regresiva; a los 10 minutos se cierra y volvés al inicio.",
  },
  {
    q: "¿Puedo deshacer un cambio de rol?",
    a: "No, pero antes de dar el rol de administrador o eliminar un usuario te pedimos confirmación. Si cancelás, no pasa nada.",
  },
  {
    q: "¿Los cambios en la carta son inmediatos?",
    a: "Sí. Se guardan en el servidor y se ven en la carta pública apenas termina de guardar.",
  },
  {
    q: "¿Qué hago si no veo una pestaña?",
    a: "Tu rol no tiene permiso para esa sección. Pedile a un administrador que te cambie el rol.",
  },
];

export default function GuiaAdmin() {
  return (
    <section className="guia">
      <header className="guia-hero">
        <div className="guia-hero-copy">
          <p className="guia-eyebrow">Guía rápida · Todos al Agua</p>
          <h2 className="guia-hero-title">Hacé tu trabajo en el panel sin vueltas</h2>
          <p className="guia-hero-text">
            Cuatro cosas nomás: entrar, saber qué podés hacer, manejar usuarios y
            mantener la carta al día.
          </p>
          <nav className="guia-chips" aria-label="Secciones de la guía">
            <a href="#guia-roles"><CheckCircleIcon /> Tu rol</a>
            <a href="#guia-usuarios"><StarIcon /> Usuarios</a>
            <a href="#guia-carta"><PlateIcon /> La carta</a>
            <a href="#guia-sesion"><ClockIcon /> Tu sesión</a>
          </nav>
        </div>
        <GuiaHero />
      </header>

      <section className="guia-bloque" id="guia-roles">
        <div className="guia-titulo">
          <span className="guia-num">01</span>
          <div>
            <h3>Tu rol, en 10 segundos</h3>
            <p>Entrá a /admin y te llevamos a tu sección.</p>
          </div>
        </div>
        <div className="guia-roles">
          {ROLES.map((rol) => (
            <article className={`guia-rol guia-rol--${rol.color}`} key={rol.nombre}>
              <span className="guia-rol-badge">{rol.nombre}</span>
              <p>{rol.texto}</p>
              <ul>
                {rol.items.length ? (
                  rol.items.map((item) => (
                    <li key={item}>
                      <CheckCircleIcon /> {item}
                    </li>
                  ))
                ) : (
                  <li className="guia-rol-vacio">Sin acceso al panel</li>
                )}
              </ul>
            </article>
          ))}
        </div>
      </section>

      <section className="guia-bloque" id="guia-usuarios">
        <div className="guia-titulo">
          <span className="guia-num">02</span>
          <div>
            <h3>Usuarios</h3>
            <p>Buscá, ordená y gestioná permisos. Solo para admin.</p>
          </div>
        </div>
        <div className="guia-pasos">
          {PASOS_USUARIOS.map((paso) => (
            <article className="guia-paso" key={paso.numero}>
              <span className="guia-paso-num">{paso.numero}</span>
              <h4>{paso.titulo}</h4>
              <p>{paso.texto}</p>
            </article>
          ))}
        </div>
        <p className="guia-aviso">
          <CheckCircleIcon />
          Dar rol de administrador o eliminar una cuenta siempre pide confirmación.
        </p>
      </section>

      <section className="guia-bloque" id="guia-carta">
        <div className="guia-titulo">
          <span className="guia-num">03</span>
          <div>
            <h3>La carta de El Muelle</h3>
            <p>Disponible para admin y cantina.</p>
          </div>
        </div>
        <div className="guia-pasos">
          {PASOS_CARTA.map((paso) => (
            <article className="guia-paso" key={paso.numero}>
              <span className="guia-paso-num">{paso.numero}</span>
              <h4>{paso.titulo}</h4>
              <p>{paso.texto}</p>
            </article>
          ))}
        </div>
        <div className="guia-flujo">
          <span><WavesIcon /> Panel de menú</span>
          <b>→</b>
          <span><CheckCircleIcon /> Guardar cambios</span>
          <b>→</b>
          <span><PlateIcon /> Carta pública</span>
        </div>
      </section>

      <section className="guia-bloque" id="guia-sesion">
        <div className="guia-titulo">
          <span className="guia-num">04</span>
          <div>
            <h3>Tu sesión</h3>
            <p>No te va a agarrar desprevenido.</p>
          </div>
        </div>
        <div className="guia-linea">
          <div className="guia-linea-punto">
            <span className="guia-linea-icono"><CheckCircleIcon /></span>
            <strong>Ingresás</strong>
            <small>15 min de sesión</small>
          </div>
          <div className="guia-linea-punto">
            <span className="guia-linea-icono"><ClockIcon /></span>
            <strong>8 min sin actividad</strong>
            <small>Aparece el aviso con cuenta regresiva</small>
          </div>
          <div className="guia-linea-punto">
            <span className="guia-linea-icono"><LeafIcon /></span>
            <strong>10 min sin actividad</strong>
            <small>Se cierra y volvés al inicio</small>
          </div>
        </div>
      </section>

      <section className="guia-bloque guia-faq">
        <div className="guia-titulo">
          <span className="guia-num">05</span>
          <div>
            <h3>Dudas rápidas</h3>
            <p>Lo que más se pregunta.</p>
          </div>
        </div>
        <div className="guia-preguntas">
          {PREGUNTAS.map((item) => (
            <details key={item.q}>
              <summary>{item.q}</summary>
              <p>{item.a}</p>
            </details>
          ))}
        </div>
      </section>

    </section>
  );
}
