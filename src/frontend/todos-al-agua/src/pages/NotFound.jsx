import { Link, useLocation } from "react-router";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { useAuth } from "../auth/AuthContext";
import "../theme.css";
import "../pages/Home.css";
import "../pages/Admin.css";
import { linksPara } from "../utils/navLinks";

const navLinks = linksPara("404");

export default function NotFound() {
  const location = useLocation();
  const { isAuthenticated, logout } = useAuth();
  const from = location.state?.from;

  return (
    <div className="home admin-page">
      <Header
        links={navLinks}
        logoHref="/"
        cta={{ href: "/", label: "Volver al inicio" }}
      />

      <main className="admin-main">
        <div className="container">
          <div className="sin-acceso">
            <span className="admin-eyebrow">Error 404</span>
            <h1 className="text-title">Página no encontrada</h1>
            <p className="admin-panel-copy">
              {from ? (
                <>
                  No pudimos encontrar <code>{from}</code>, o tu cuenta no tiene
                  permisos para verla.
                </>
              ) : (
                <>La página que buscás no existe o no tenés permisos para verla.</>
              )}
            </p>

            <div className="admin-actions">
              <Link className="btn btn-primary" to="/">
                Volver al inicio
              </Link>
              {isAuthenticated ? (
                <button className="btn btn-danger" type="button" onClick={logout}>
                  Cerrar sesión
                </button>
              ) : (
                <Link className="btn btn-primary" to="/login">
                  Iniciar sesión
                </Link>
              )}
            </div>
          </div>
        </div>
      </main>

      <Footer links={navLinks} />
    </div>
  );
}
