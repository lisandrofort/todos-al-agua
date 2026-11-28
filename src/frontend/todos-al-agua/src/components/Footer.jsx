import { Link } from "react-router";
import { useAuth } from "../auth/AuthContext";
import { visibleNavLinks } from "../utils/navLinks";
import { WELCOME_EVENT } from "./WelcomeGate";
import "./Footer.css";

export default function Footer({ links }) {
  const { user, hasPermission } = useAuth();
  const visibleLinks = visibleNavLinks(
    links,
    user,
    hasPermission("acceso_admin"),
  );

  return (
    <footer className="home-footer">
      <div className="container footer-inner">
        <p className="footer-brand">
          <img
            className="footer-logo"
            src="/asociacion-civil-todos-al-agua-transparente.png"
            alt="Asociación Civil Todos al Agua Necochea"
            width="432"
            height="260"
          />
          Todos al Agua Necochea
        </p>

        <nav className="footer-nav" aria-label="Enlaces del pie">
          {visibleLinks.map((link) =>
            link.href.startsWith("/") ? (
              <Link key={link.href} to={link.href}>
                {link.label}
              </Link>
            ) : (
              <a key={link.href} href={link.href}>
                {link.label}
              </a>
            ),
          )}
        </nav>

        <div className="footer-final">
          <button
            className="footer-replay"
            type="button"
            onClick={() => window.dispatchEvent(new Event(WELCOME_EVENT))}
          >
            Volver a ver la bienvenida
          </button>
          <p>© {new Date().getFullYear()} Todos al Agua</p>
        </div>
      </div>
    </footer>
  );
}
