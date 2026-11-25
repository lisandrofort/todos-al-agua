import { Link } from "react-router";

// Muestra un solo mensaje arriba del formulario de login.
export default function LoginMessages({
  sessionExpired,
  needsAdmin,
  user,
  isAdmin,
  registered,
  recovered,
  error,
  logout,
}) {
  // Sesión vencida por inactividad.
  if (sessionExpired) {
    return (
      <div className="login-notice login-notice-info" role="status">
        <p>Tu sesión venció por inactividad. Iniciá sesión nuevamente para continuar.</p>
      </div>
    );
  }

  // Intentó entrar a una sección de admin sin ser admin.
  if (needsAdmin) {
    return (
      <div className="login-notice" role="alert">
        <p>
          Tu cuenta <strong>{user.email}</strong> no tiene permisos de
          administrador para acceder a esa sección.
        </p>
        <button
          className="btn btn-primary btn-block"
          type="button"
          onClick={logout}
        >
          Cerrar sesión y usar otra cuenta
        </button>
      </div>
    );
  }

  // Ya está logueado como admin.
  if (isAdmin) {
    return (
      <p className="login-success" role="status">
        Ya iniciaste sesión como administrador. <Link to="/admin">Ir al panel</Link>
      </p>
    );
  }

  // Vuelve del registro.
  if (registered) {
    return (
      <p className="login-success" role="status">
        ¡Registro exitoso! Iniciá sesión con tu cuenta.
      </p>
    );
  }

  // Vuelve de cambiar la contraseña.
  if (recovered) {
    return (
      <p className="login-success" role="status">
        Contraseña actualizada. Iniciá sesión con tu nueva contraseña.
      </p>
    );
  }

  // Error del servidor (por ejemplo, contraseña incorrecta).
  if (error) {
    return <p className="login-error" role="alert">{error}</p>;
  }

  // No hay nada para mostrar.
  return null;
}
