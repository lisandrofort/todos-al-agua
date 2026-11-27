import { useEffect, useRef, useState } from "react";
import { apiMenu } from "../../api/client";
import menuData from "../../data/menu.json";
import { clone, normalizeForSave, validateMenu } from "../../utils/menuUtils";

function idsDe(menu) {
  return new Set((menu ?? []).map((c) => c.id).filter(Boolean));
}

export default function useMenuEditor(menu, setMenu) {
  const [draft, setDraft] = useState(() => clone(menu));
  const [activeCategory, setActiveCategory] = useState(0);
  const [message, setMessage] = useState(null);
  const [saving, setSaving] = useState(false);
  const idsOriginales = useRef(idsDe(menu));
  const categoryScrollRef = useRef(null);
  const activeButtonRef = useRef(null);

  const selectedIndex = draft.length
    ? Math.min(activeCategory, draft.length - 1)
    : -1;
  const selected = selectedIndex >= 0 ? draft[selectedIndex] : null;
  const totalItems = draft.reduce(
    (total, category) => total + (category.items?.length ?? 0),
    0,
  );

  useEffect(() => {
    activeButtonRef.current?.scrollIntoView({
      block: "nearest",
      inline: "center",
    });
  }, [selectedIndex]);

  useEffect(() => {
    if (!message) return undefined;
    const timer = setTimeout(() => setMessage(null), 3000);
    return () => clearTimeout(timer);
  }, [message]);

  function updateCategory(index, patch) {
    setDraft((current) =>
      current.map((category, i) =>
        i === index ? { ...category, ...patch } : category,
      ),
    );
  }

  function updateItem(categoryIndex, itemIndex, patch) {
    setDraft((current) =>
      current.map((category, i) => {
        if (i !== categoryIndex) {
          return category;
        }
        return {
          ...category,
          items: (category.items ?? []).map((item, j) =>
            j === itemIndex ? { ...item, ...patch } : item,
          ),
        };
      }),
    );
  }

  function updateSize(categoryIndex, itemIndex, size, value) {
    setDraft((current) =>
      current.map((category, i) => {
        if (i !== categoryIndex) {
          return category;
        }
        return {
          ...category,
          items: (category.items ?? []).map((item, j) =>
            j === itemIndex
              ? { ...item, precios: { ...item.precios, [size]: value } }
              : item,
          ),
        };
      }),
    );
  }

  function addItem(categoryIndex) {
    setDraft((current) =>
      current.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              items: [
                ...(category.items ?? []),
                {
                  id: globalThis.crypto?.randomUUID?.() ?? `plato-${Date.now()}`,
                  nombre: "",
                  descripcion: "",
                  precio: "",
                },
              ],
            }
          : category,
      ),
    );
  }

  function removeItem(categoryIndex, itemIndex) {
    setDraft((current) =>
      current.map((category, i) =>
        i === categoryIndex
          ? {
              ...category,
              items: (category.items ?? []).filter((_, j) => j !== itemIndex),
            }
          : category,
      ),
    );
  }

  function addCategory() {
    setActiveCategory(draft.length);
    setDraft((current) => [
      ...current,
      { categoria: "", nota_guarnicion: "", items: [] },
    ]);
  }

  function removeCategory(index) {
    if (index <= selectedIndex) {
      setActiveCategory(Math.max(0, selectedIndex - 1));
    }
    setDraft((current) => current.filter((_, i) => i !== index));
  }

  // Guarda primero y recién después muestra el resultado. Las categorías nuevas
  // se crean en la API, las borradas se eliminan y se conservan los IDs reales.
  async function handleSave() {
    if (saving) return;
    const error = validateMenu(draft);
    if (error) {
      setMessage({ type: "error", text: error });
      return;
    }

    setSaving(true);
    setMessage({ type: "info", text: "Guardando cambios..." });
    const next = normalizeForSave(draft);

    try {
      const guardadas = await Promise.all(
        next.map(async (category) => {
          const { id, ...data } = category;
          return id ? apiMenu.update(id, data) : apiMenu.create(data);
        }),
      );
      const idsGuardados = new Set(guardadas.map((c) => c.id));
      const borradas = [...idsOriginales.current].filter(
        (id) => !idsGuardados.has(id),
      );
      await Promise.all(borradas.map((id) => apiMenu.remove(id)));

      idsOriginales.current = idsGuardados;
      setMenu(guardadas);
      setDraft(clone(guardadas));
      setMessage({ type: "success", text: "✓ Cambios guardados correctamente" });
    } catch (e) {
      setMessage({ type: "error", text: `No se pudo guardar: ${e.message}` });
    } finally {
      setSaving(false);
    }
  }

  function handleDiscard() {
    setDraft(clone(menu));
    setMessage(null);
  }

  // Restablece la carta de ejemplo en el servidor, no solo en la pantalla.
  async function handleReset() {
    if (saving) return;
    setSaving(true);
    setMessage({ type: "info", text: "Restableciendo el menú..." });

    try {
      const original = normalizeForSave(menuData.menu);
      const creadas = await Promise.all(original.map((c) => apiMenu.create(c)));
      await Promise.all([...idsOriginales.current].map((id) => apiMenu.remove(id)));

      idsOriginales.current = new Set(creadas.map((c) => c.id));
      setMenu(creadas);
      setDraft(clone(creadas));
      setActiveCategory(0);
      setMessage({ type: "success", text: "Menú original restablecido." });
    } catch (e) {
      setMessage({ type: "error", text: `No se pudo restablecer: ${e.message}` });
    } finally {
      setSaving(false);
    }
  }

  return {
    draft,
    selected,
    selectedIndex,
    totalItems,
    message,
    saving,
    categoryScrollRef,
    activeButtonRef,
    setActiveCategory,
    updateCategory,
    updateItem,
    updateSize,
    addItem,
    removeItem,
    addCategory,
    removeCategory,
    handleSave,
    handleDiscard,
    handleReset,
  };
}
