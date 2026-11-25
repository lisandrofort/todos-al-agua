import { useEffect, useState } from "react";
import { useAuth } from "../../auth/AuthContext";
import { PERMISOS } from "../../auth/permissions";
import { apiMenu } from "../../api/client";
import EditorMenu from "./EditorMenu";

// Este archivo solo espera a que llegue el menú de Firestore.
// Después se lo pasa al editor, que ya arranca con los datos correctos.
export default function MenuPanel() {
  const { hasPermission } = useAuth();
  const puedeEditar = hasPermission(PERMISOS.EDITAR_MENU);

  const [menu, setMenu] = useState(null); // null = todavía no llegó

  useEffect(() => {
    apiMenu.getAll().then((data) => {
      if (Array.isArray(data) && data.length) setMenu(data);
    }).catch(() => {});
  }, []);

  if (!menu) {
    return <p className="admin-note">Cargando el menú desde el servidor...</p>;
  }

  return <EditorMenu menu={menu} setMenu={setMenu} puedeEditar={puedeEditar} />;
}
