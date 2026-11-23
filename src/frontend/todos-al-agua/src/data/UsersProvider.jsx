import { useCallback, useEffect, useMemo, useState } from "react";
import { UsersContext } from "./usersContext";
import { apiUsers, getToken } from "../api/client";

const LOGIN_EVENT = "todos-al-agua:login";

export default function UsersProvider({ children }) {
  const [users, setUsers] = useState([]);

  function loadUsers() {
    // El endpoint /users es solo para admin: evitar un 403 innecesario en consola.
    const token = getToken();
    if (!token) return;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      if (payload.rol !== "admin") return;
    } catch {
      return;
    }

    apiUsers
      .getAll()
      .then((data) => {
        if (!Array.isArray(data)) return;
        setUsers(
          data.map((u) => ({
            id: u.id,
            nombre: u.name ?? u.nombre ?? u.email,
            email: u.email,
            rol: u.rol ?? "usuario",
          })),
        );
      })
      .catch(() => {});
  }

  useEffect(() => {
    if (getToken()) loadUsers();
    window.addEventListener(LOGIN_EVENT, loadUsers);
    return () => window.removeEventListener(LOGIN_EVENT, loadUsers);
  }, []);

  const updateRole = useCallback((id, rol) => {
    setUsers((current) =>
      current.map((user) => (user.id === id ? { ...user, rol } : user)),
    );
    apiUsers.update(id, { rol }).catch(() => {});
  }, []);

  const value = useMemo(() => ({ users, updateRole }), [users, updateRole]);
  return <UsersContext.Provider value={value}>{children}</UsersContext.Provider>;
}
