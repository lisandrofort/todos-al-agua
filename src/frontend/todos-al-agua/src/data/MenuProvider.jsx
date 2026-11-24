import { useCallback, useEffect, useMemo, useState } from "react";
import { MenuContext } from "./menuContext";
import menuData from "./menu.json";
import { apiMenu } from "../api/client";

const ORIGINAL_MENU = menuData.menu;

export default function MenuProvider({ children }) {
  const [menu, setMenu] = useState(ORIGINAL_MENU);

  useEffect(() => {
    let active = true;
    apiMenu
      .getAll()
      .then((data) => {
        if (active && Array.isArray(data) && data.length) setMenu(data);
      })
      .catch(() => {});
    return () => {
      active = false;
    };
  }, []);

  const saveMenu = useCallback(async (nextMenu) => {
    setMenu(nextMenu);
    try {
      if (nextMenu[0]?.id) {
        await Promise.all(nextMenu.map((c) => apiMenu.update(c.id, c)));
      }
    } catch (error) {
      console.error("No se pudo guardar el menú:", error.message);
    }
  }, []);

  const resetMenu = useCallback(() => setMenu(ORIGINAL_MENU), []);

  const value = useMemo(
    () => ({ menu, saveMenu, resetMenu }),
    [menu, saveMenu, resetMenu],
  );
  return <MenuContext.Provider value={value}>{children}</MenuContext.Provider>;
}
