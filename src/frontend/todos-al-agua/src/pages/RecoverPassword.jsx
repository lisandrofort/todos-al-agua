import { useState } from "react";
import { Link } from "react-router";
import "../theme.css";
import "./Login.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Logo from "../ui/Logo";
import { apiAuth } from "../api/client";
import { linksPara } from "../utils/navLinks";

const navLinks = linksPara("recuperar");

export default function RecoverPassword() {
  const [email, setEmail] = useState("");
  const [errors, setErrors] = useState({});
  const [sent, setSent] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    if (!email.trim()) {
      setErrors({ email: "Ingresá tu email." });
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      setErrors({ email: "Ingresá un email válido." });
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await apiAuth.forgotPassword(email.trim());
      setSent(true);
    } catch (error) {
      setErrors({ general: error.message });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="login">
      <Header
        links={navLinks}
        logoHref="/"
        cta={{ href: "/login", label: "Iniciar sesión" }}
      />

      <main className="login-main">
        <div className="container login-layout">
          <section className="login-intro" aria-labelledby="recover-intro-title">
            <Logo />

            <p className="login-eyebrow">Todos al Agua Necochea</p>
            <h1 id="recover-intro-title" className="text-title">
              Recuperá tu contraseña
            </h1>
            <p className="login-intro-copy">
              Te vamos a enviar un email con un link para elegir una contraseña
              nueva. El link vence en 30 minutos.
            </p>
          </section>

          <section className="login-card" aria-labelledby="recover-card-title">
            <h2 id="recover-card-title">¿Olvidaste tu contraseña?</h2>
            <p className="login-card-subtitle">
              Ingresá el email con el que te registraste.
            </p>

            {sent ? (
              <p className="login-success" role="status">
                Si el email existe, enviamos instrucciones para restablecer tu
                contraseña. Revisá tu casilla.
              </p>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="recover-email">Email</label>
                  <input
                    id="recover-email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    placeholder="tu@email.com"
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      setErrors({});
                    }}
                    aria-invalid={Boolean(errors.email)}
                  />
                  {errors.email && (
                    <p className="login-error" role="alert">
                      {errors.email}
                    </p>
                  )}
                </div>

                {errors.general && (
                  <p className="login-error" role="alert">
                    {errors.general}
                  </p>
                )}

                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  disabled={submitting}
                >
                  {submitting ? "Enviando..." : "Enviar instrucciones"}
                </button>
              </form>
            )}

            <p className="login-register">
              <Link to="/login">Volver al inicio de sesión</Link>
            </p>
          </section>
        </div>
      </main>

      <Footer links={navLinks} />
    </div>
  );
}
