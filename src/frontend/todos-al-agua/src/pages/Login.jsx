import { useState } from "react";
import { Link, useLocation, useNavigate } from "react-router";
import "../theme.css";
import "./Login.css";
import Header from "../components/Header";
import Footer from "../components/Footer";
import LoginIntro from "../components/LoginIntro";
import LoginMessages from "../components/LoginMessages";
import { useAuth } from "../auth/AuthContext";

const navLinks = [
  { href: "/", label: "Home" },
  { href: "/cantina", label: "Cantina" },
  { href: "/huerta", label: "Huerta" },
];

// Revisa que email y contraseña estén bien escritos.
function validate(values) {
  const errors = {};

  if (!values.email.trim()) {
    errors.email = "Ingresá tu email.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
    errors.email = "Ingresá un email válido.";
  }

  if (!values.password) {
    errors.password = "Ingresá tu contraseña.";
  } else if (values.password.length < 6) {
    errors.password = "La contraseña debe tener al menos 6 caracteres.";
  }

  return errors;
}

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, login, logout, sessionExpired } = useAuth();

  const registered = location.state?.registered;
  const recovered = location.state?.recovered;
  const needsAdmin = Boolean(location.state?.from) && user && user.rol !== "admin";

  const [form, setForm] = useState({ email: "", password: "" });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);

  // Guarda lo que el usuario escribe en el formulario.
  function handleChange(event) {
    const { name, value } = event.target;
    setForm((actual) => ({ ...actual, [name]: value }));
    setErrors({});
  }

  // Al apretar "Ingresar": valida, llama al login y navega.
  async function handleSubmit(event) {
    event.preventDefault();

    const nextErrors = validate(form);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length > 0) {
      return;
    }

    setSubmitting(true);
    try {
      await login({ email: form.email.trim(), password: form.password });
      navigate(location.state?.from ?? "/", { replace: true });
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
        cta={{ href: "/registro", label: "Registrarse" }}
      />

      <main className="login-main">
        <div className="container login-layout">
          <LoginIntro />

          <section className="login-card" aria-labelledby="login-card-title">
            <h2 id="login-card-title">Iniciá sesión</h2>
            <p className="login-card-subtitle">
              Ingresá tus datos para continuar.
            </p>

            <LoginMessages
              sessionExpired={sessionExpired}
              needsAdmin={needsAdmin}
              user={user}
              isAdmin={user?.rol === "admin" && !needsAdmin}
              registered={registered}
              recovered={recovered}
              error={errors.general}
              logout={logout}
            />

            <form className="login-form" onSubmit={handleSubmit} noValidate>
              <div className="login-field">
                <label htmlFor="login-email">Email</label>
                <input
                  id="login-email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="nombre@ejemplo.com"
                  value={form.email}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.email)}
                />
                {errors.email && (
                  <p className="login-error" role="alert">{errors.email}</p>
                )}
              </div>

              <div className="login-field">
                <label htmlFor="login-password">Contraseña</label>
                <input
                  id="login-password"
                  name="password"
                  type="password"
                  autoComplete="current-password"
                  placeholder="Tu contraseña"
                  value={form.password}
                  onChange={handleChange}
                  aria-invalid={Boolean(errors.password)}
                />
                {errors.password && (
                  <p className="login-error" role="alert">{errors.password}</p>
                )}
              </div>

              <div className="login-options">
                <Link className="login-forgot" to="/recuperar">
                  ¿Olvidé mi contraseña?
                </Link>
              </div>

              <button className="btn btn-primary btn-block" type="submit" disabled={submitting}>
                {submitting ? "Ingresando..." : "Ingresar"}
              </button>
            </form>

            <p className="login-register">
              ¿No tenés cuenta?{" "}
              <Link to="/registro" state={location.state}>
                Registrate
              </Link>
            </p>
          </section>
        </div>
      </main>

      <Footer links={navLinks} />
    </div>
  );
}
