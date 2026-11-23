import { useState } from "react";
import { Link, useNavigate, useSearchParams } from "react-router";
import "../theme.css";
import "./Login.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import Logo from "../ui/Logo";
import { apiAuth } from "../api/client";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cantina", label: "Cantina" },
  { href: "/huerta", label: "Huerta" },
];

export default function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");
  const [form, setForm] = useState({ password: "", confirmPassword: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setErrors((current) => ({ ...current, [name]: "" }));
  }

  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = {};
    if (!form.password) {
      nextErrors.password = "Ingresá la nueva contraseña.";
    } else if (form.password.length < 6) {
      nextErrors.password = "La contraseña debe tener al menos 6 caracteres.";
    }
    if (form.confirmPassword !== form.password) {
      nextErrors.confirmPassword = "Las contraseñas no coinciden.";
    }
    if (Object.keys(nextErrors).length > 0) {
      setErrors(nextErrors);
      return;
    }

    setSubmitting(true);
    setErrors({});
    try {
      await apiAuth.resetPassword(token, form.password);
      navigate("/login", { replace: true, state: { recovered: true } });
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
          <section className="login-intro" aria-labelledby="reset-intro-title">
            <Logo />

            <p className="login-eyebrow">Todos al Agua Necochea</p>
            <h1 id="reset-intro-title" className="text-title">
              Nueva contraseña
            </h1>
            <p className="login-intro-copy">
              Elegí una contraseña nueva para tu cuenta. Después podés iniciar
              sesión normalmente.
            </p>
          </section>

          <section className="login-card" aria-labelledby="reset-card-title">
            <h2 id="reset-card-title">Restablecer contraseña</h2>
            <p className="login-card-subtitle">
              Usá al menos 6 caracteres.
            </p>

            {!token ? (
              <p className="login-notice" role="alert">
                El link no tiene un token válido. Pedí uno nuevo desde{" "}
                <Link to="/recuperar">recuperar contraseña</Link>.
              </p>
            ) : (
              <form className="login-form" onSubmit={handleSubmit}>
                <div className="login-field">
                  <label htmlFor="reset-password">Nueva contraseña</label>
                  <input
                    id="reset-password"
                    name="password"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Nueva contraseña"
                    value={form.password}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.password)}
                  />
                  {errors.password && (
                    <p className="login-error" role="alert">
                      {errors.password}
                    </p>
                  )}
                </div>

                <div className="login-field">
                  <label htmlFor="reset-confirm-password">Confirmar contraseña</label>
                  <input
                    id="reset-confirm-password"
                    name="confirmPassword"
                    type="password"
                    autoComplete="new-password"
                    placeholder="Repetí la contraseña"
                    value={form.confirmPassword}
                    onChange={handleChange}
                    aria-invalid={Boolean(errors.confirmPassword)}
                  />
                  {errors.confirmPassword && (
                    <p className="login-error" role="alert">
                      {errors.confirmPassword}
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
                  {submitting ? "Guardando..." : "Guardar contraseña"}
                </button>
              </form>
            )}
          </section>
        </div>
      </main>

      <Footer links={navLinks} />
    </div>
  );
}
