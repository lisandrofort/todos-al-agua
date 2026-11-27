import { useCallback, useEffect, useState } from "react";
import { apiUsers, LOGIN_EVENT } from "../../api/client";
import { useAuth } from "../../auth/AuthContext";
import {
  ETIQUETAS_PERMISO,
  PERMISOS,
  ROLES,
  permisosDeRol,
} from "../../auth/permissions";
import ConfirmDialog from "./ConfirmDialog";
const ROLES_DISPONIBLES = [
  ROLES.ADMIN,
  ROLES.CANTINA,
  ROLES.HUERTA,
  ROLES.USUARIO,
];
const POR_PAGINA = 5;

export default function UsersPanel() {
  // La lista de usuarios se trae sola al abrir el panel.
  const [users, setUsers] = useState([]);
  useEffect(() => {
    function cargar() {
      apiUsers.getAll().then((data) => {
        if (Array.isArray(data)) {
          setUsers(
            data.map((u) => ({
              id: u.id,
              nombre: u.name ?? u.nombre ?? u.email,
              email: u.email,
              rol: u.rol ?? "usuario",
            })),
          );
        }
      }).catch(() => {});
    }

    cargar();
    window.addEventListener(LOGIN_EVENT, cargar);
    return () => window.removeEventListener(LOGIN_EVENT, cargar);
  }, []);

  const { user, hasPermission, logout } = useAuth();
  const puedeEditarRoles = hasPermission(PERMISOS.EDITAR_ROLES);
  const [error, setError] = useState("");
  const [confirmacion, setConfirmacion] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [pagina, setPagina] = useState(1);
  const [orden, setOrden] = useState({ campo: null, direccion: "asc" });

  const cancelarConfirmacion = useCallback(() => setConfirmacion(null), []);

  async function aplicarCambioRol(id, nextRol) {
    setError("");
    const target = users.find((current) => current.id === id);

    try {
      await apiUsers.update(id, { rol: nextRol });
      setUsers((all) =>
        all.map((u) => (u.id === id ? { ...u, rol: nextRol } : u)),
      );
    } catch (cause) {
      setError(cause.message);
      return;
    }

    const isCurrentUser =
      target?.email.toLowerCase() === user?.email?.toLowerCase();

    if (isCurrentUser && !permisosDeRol(nextRol).includes(PERMISOS.ACCESO_ADMIN)) {
      logout();
    }
  }

  function handleRoleChange(id, nextRol) {
    const target = users.find((current) => current.id === id);

    // Entregar el rol más alto siempre requiere confirmación explícita.
    if (
      nextRol === ROLES.ADMIN &&
      target &&
      target.rol !== ROLES.ADMIN
    ) {
      setConfirmacion({
        tipo: "admin",
        id,
        nextRol,
        nombre: target.nombre,
        email: target.email,
      });
      return;
    }

    aplicarCambioRol(id, nextRol);
  }

  function handleDelete(id) {
    const target = users.find((current) => current.id === id);
    if (!target || target.rol === ROLES.ADMIN) return;

    setConfirmacion({
      tipo: "eliminar",
      id,
      nombre: target.nombre,
      email: target.email,
    });
  }

  async function eliminarUsuario(id) {
    setError("");
    try {
      await apiUsers.remove(id);
      setUsers((all) => all.filter((u) => u.id !== id));
    } catch (cause) {
      setError(cause.message);
    }
  }

  function confirmarAccion() {
    if (!confirmacion) return;

    if (confirmacion.tipo === "admin") {
      aplicarCambioRol(confirmacion.id, confirmacion.nextRol);
    } else {
      eliminarUsuario(confirmacion.id);
    }
    setConfirmacion(null);
  }

  const tituloConfirmacion =
    confirmacion?.tipo === "admin"
      ? "¿Dar rol de administrador?"
      : "¿Eliminar este usuario?";
  const mensajeConfirmacion =
    confirmacion?.tipo === "admin"
      ? `Estás por dar el rol más alto a ${confirmacion.nombre} (${confirmacion.email}). Podrá ver y modificar usuarios, menú y huerta.`
      : confirmacion?.tipo === "eliminar"
        ? `Se va a eliminar la cuenta de ${confirmacion.nombre} (${confirmacion.email}). Esta acción no se puede deshacer.`
        : "";
  const textoConfirmacion =
    confirmacion?.tipo === "admin"
      ? "Sí, dar rol de administrador"
      : "Sí, eliminar usuario";

  const filtro = busqueda.trim().toLowerCase();
  const usuariosFiltrados = filtro
    ? users.filter((u) =>
        `${u.nombre ?? ""} ${u.email ?? ""}`.toLowerCase().includes(filtro),
      )
    : users;
  const usuariosOrdenados = orden.campo
    ? [...usuariosFiltrados].sort((a, b) => {
        const va = String(a[orden.campo] ?? "").toLowerCase();
        const vb = String(b[orden.campo] ?? "").toLowerCase();
        const comparison = va.localeCompare(vb, "es", { sensitivity: "base" });
        return orden.direccion === "asc" ? comparison : -comparison;
      })
    : usuariosFiltrados;
  const totalPaginas = Math.max(
    1,
    Math.ceil(usuariosOrdenados.length / POR_PAGINA),
  );
  const paginaActual = Math.min(pagina, totalPaginas);
  const usuariosVisibles = usuariosOrdenados.slice(
    (paginaActual - 1) * POR_PAGINA,
    paginaActual * POR_PAGINA,
  );

  function cambiarBusqueda(event) {
    setBusqueda(event.target.value);
    setPagina(1);
  }

  function cambiarOrden(campo) {
    setOrden((current) => ({
      campo,
      direccion:
        current.campo === campo && current.direccion === "asc" ? "desc" : "asc",
    }));
    setPagina(1);
  }

  function flechaOrden(campo) {
    if (orden.campo !== campo) return "↕";
    return orden.direccion === "asc" ? "▲" : "▼";
  }

  function ariaOrden(campo) {
    if (orden.campo !== campo) return "none";
    return orden.direccion === "asc" ? "ascending" : "descending";
  }

  return (
    <section>
      <h2 className="admin-panel-title">Usuarios y permisos</h2>
      <p className="admin-panel-copy">
        Cada rol define a qué secciones puede acceder dentro del panel.
      </p>

      {error && (
        <p
          className="admin-panel-copy"
          role="alert"
          style={{ color: "var(--color-danger)", fontWeight: 600 }}
        >
          {error}
        </p>
      )}

      <div className="admin-users-toolbar">
        <input
          className="admin-input admin-user-search"
          type="search"
          placeholder="Buscar por nombre o email"
          aria-label="Buscar usuarios por nombre o email"
          value={busqueda}
          onChange={cambiarBusqueda}
        />
        <span className="admin-users-count" role="status">
          {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? "usuario" : "usuarios"}
        </span>
      </div>

      <div className="admin-table-wrap admin-table-desktop">
        <table className="admin-table">
          <thead>
            <tr>
              <th aria-sort={ariaOrden("nombre")}>
                <button
                  className="admin-sort-btn"
                  type="button"
                  onClick={() => cambiarOrden("nombre")}
                >
                  Nombre
                  <span
                    className={
                      orden.campo === "nombre"
                        ? "admin-sort-arrow is-active"
                        : "admin-sort-arrow"
                    }
                    aria-hidden="true"
                  >
                    {flechaOrden("nombre")}
                  </span>
                </button>
              </th>
              <th aria-sort={ariaOrden("email")}>
                <button
                  className="admin-sort-btn"
                  type="button"
                  onClick={() => cambiarOrden("email")}
                >
                  Email
                  <span
                    className={
                      orden.campo === "email"
                        ? "admin-sort-arrow is-active"
                        : "admin-sort-arrow"
                    }
                    aria-hidden="true"
                  >
                    {flechaOrden("email")}
                  </span>
                </button>
              </th>
              <th>Rol</th>
              <th>Permisos</th>
              <th>Cambiar rol</th>
            </tr>
          </thead>
          <tbody>
            {usuariosVisibles.map((current) => {
              const isCurrentUser =
                current.email.toLowerCase() === user?.email?.toLowerCase();
              const permisos = permisosDeRol(current.rol);

              return (
                <tr key={current.id}>
                  <td>
                    {current.nombre}
                    {isCurrentUser && (
                      <span className="admin-badge" style={{ marginLeft: 8 }}>
                        Vos
                      </span>
                    )}
                  </td>
                  <td>{current.email}</td>
                  <td>
                    <span
                      className={
                        current.rol === ROLES.ADMIN
                          ? "admin-badge admin-badge--admin"
                          : "admin-badge"
                      }
                    >
                      {current.rol}
                    </span>
                  </td>
                  <td>
                    <ul className="admin-permissions">
                      {permisos.length ? (
                        permisos.map((permission) => (
                          <li key={permission}>
                            {ETIQUETAS_PERMISO[permission] ?? permission}
                          </li>
                        ))
                      ) : (
                        <li>Sin permisos de panel</li>
                      )}
                    </ul>
                  </td>
                  <td>
                    {current.rol === ROLES.ADMIN ? (
                      <span className="admin-badge">Rol protegido</span>
                    ) : puedeEditarRoles ? (
                      <div className="admin-row-actions">
                        <select
                          className="admin-select"
                          aria-label={`Rol de ${current.nombre}`}
                          value={current.rol}
                          onChange={(event) =>
                            handleRoleChange(current.id, event.target.value)
                          }
                        >
                          {ROLES_DISPONIBLES.map((rol) => (
                            <option key={rol} value={rol}>
                              {rol}
                            </option>
                          ))}
                        </select>
                        <button
                          className="admin-icon-btn"
                          type="button"
                          title={`Eliminar ${current.nombre}`}
                          aria-label={`Eliminar ${current.nombre}`}
                          onClick={() => handleDelete(current.id)}
                        >
                          ×
                        </button>
                      </div>
                    ) : (
                      <span className="admin-badge">Sin permiso</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="admin-user-cards">
        {usuariosVisibles.map((current) => {
          const isCurrentUser =
            current.email.toLowerCase() === user?.email?.toLowerCase();
          const permisos = permisosDeRol(current.rol);

          return (
            <article className="admin-user-card" key={current.id}>
              <div className="admin-user-card-head">
                <div>
                  <strong>{current.nombre}</strong>
                  {isCurrentUser && (
                    <span className="admin-badge admin-user-card-vos">Vos</span>
                  )}
                </div>
                <span
                  className={
                    current.rol === ROLES.ADMIN
                      ? "admin-badge admin-badge--admin"
                      : "admin-badge"
                  }
                >
                  {current.rol}
                </span>
              </div>

              <p className="admin-user-card-email">{current.email}</p>

              <ul className="admin-permissions">
                {permisos.length ? (
                  permisos.map((permission) => (
                    <li key={permission}>
                      {ETIQUETAS_PERMISO[permission] ?? permission}
                    </li>
                  ))
                ) : (
                  <li>Sin permisos de panel</li>
                )}
              </ul>

              <div className="admin-row-actions">
                <label className="admin-user-card-role">
                  <span className="admin-field-label">Cambiar rol</span>
                  {current.rol === ROLES.ADMIN ? (
                    <span className="admin-badge">Rol protegido</span>
                  ) : puedeEditarRoles ? (
                    <select
                      className="admin-select"
                      aria-label={`Rol de ${current.nombre}`}
                      value={current.rol}
                      onChange={(event) =>
                        handleRoleChange(current.id, event.target.value)
                      }
                    >
                      {ROLES_DISPONIBLES.map((rol) => (
                        <option key={rol} value={rol}>
                          {rol}
                        </option>
                      ))}
                    </select>
                  ) : (
                    <span className="admin-badge">Sin permiso</span>
                  )}
                </label>
                {current.rol !== ROLES.ADMIN && puedeEditarRoles && (
                  <button
                    className="admin-icon-btn"
                    type="button"
                    title={`Eliminar ${current.nombre}`}
                    aria-label={`Eliminar ${current.nombre}`}
                    onClick={() => handleDelete(current.id)}
                  >
                    ×
                  </button>
                )}
              </div>
            </article>
          );
        })}
      </div>

      {usuariosFiltrados.length === 0 && (
        <p className="admin-note">
          No se encontraron usuarios con “{busqueda}”.
        </p>
      )}

      {totalPaginas > 1 && (
        <div className="admin-pagination">
          <button
            className="btn"
            type="button"
            onClick={() => setPagina(paginaActual - 1)}
            disabled={paginaActual === 1}
          >
            Anterior
          </button>
          <span role="status">
            Página {paginaActual} de {totalPaginas}
          </span>
          <button
            className="btn"
            type="button"
            onClick={() => setPagina(paginaActual + 1)}
            disabled={paginaActual === totalPaginas}
          >
            Siguiente
          </button>
        </div>
      )}

      <p className="admin-note">
        Los roles de administrador están protegidos: no se pueden modificar
        desde el panel.
      </p>

      <ConfirmDialog
        abierto={Boolean(confirmacion)}
        titulo={tituloConfirmacion}
        mensaje={mensajeConfirmacion}
        confirmarTexto={textoConfirmacion}
        onConfirmar={confirmarAccion}
        onCancelar={cancelarConfirmacion}
      />
    </section>
  );
}
