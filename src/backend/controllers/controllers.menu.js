const crypto = require("crypto");
const Menu = require("../repositories/repository.menu.js");
const {
  falla,
  textoRequerido,
  textoOpcional,
  validarItem,
} = require("../lib/validacion.js");

const CATEGORY_FIELDS = ["categoria", "items", "nota_guarnicion"];

function normalize(value) {
  return String(value ?? "").trim().toLowerCase();
}

function validarItems(items) {
  if (!Array.isArray(items)) {
    throw falla("Los items deben ser un array");
  }
  return items.map((item) => ({
    ...validarItem(item),
    id: item.id ?? crypto.randomUUID(),
  }));
}

function indiceItem(items, identificador) {
  const buscado = normalize(identificador);
  return items.findIndex(
    (item) => item.id === identificador || normalize(item.nombre) === buscado,
  );
}

async function getFullMenu() {
  const allMenu = new Menu();
  return await allMenu.getAll();
}

async function getDishByCategory(category) {
  const allMenu = await getFullMenu();
  const search = normalize(category);
  return allMenu.filter((item) => normalize(item.categoria) === search);
}

async function getDishById(id) {
  const allMenu = new Menu();
  return await allMenu.getById(id);
}

async function createCategory(data = {}) {
  const categoryData = {
    categoria: textoRequerido(data.categoria, "La categoría es obligatoria", 100),
    items: data.items === undefined ? [] : validarItems(data.items),
  };
  if (data.nota_guarnicion !== undefined) {
    categoryData.nota_guarnicion = textoOpcional(data.nota_guarnicion, 300);
  }

  const allMenu = new Menu();
  return await allMenu.create(categoryData);
}

async function updateCategory(id, data = {}) {
  const allMenu = new Menu();
  const categoryFound = await allMenu.getById(id);
  if (!categoryFound) {
    return null;
  }

  const updateData = {};
  CATEGORY_FIELDS.forEach((field) => {
    if (data[field] !== undefined) {
      updateData[field] = data[field];
    }
  });

  if (updateData.categoria !== undefined) {
    updateData.categoria = textoRequerido(
      updateData.categoria,
      "La categoría no puede estar vacía",
      100,
    );
  }
  if (updateData.items !== undefined) {
    updateData.items = validarItems(updateData.items);
  }
  if (updateData.nota_guarnicion !== undefined) {
    updateData.nota_guarnicion = textoOpcional(
      updateData.nota_guarnicion,
      300,
    );
  }
  if (Object.keys(updateData).length === 0) {
    throw falla("No hay campos válidos para actualizar");
  }

  return await allMenu.update(id, updateData);
}

async function deleteCategory(id) {
  const allMenu = new Menu();
  const categoryFound = await allMenu.getById(id);
  if (!categoryFound) {
    return null;
  }
  return await allMenu.delete(id);
}

async function addItem(id, data = {}) {
  const allMenu = new Menu();
  const categoryFound = await allMenu.getById(id);
  if (!categoryFound) {
    return null;
  }

  const item = { ...validarItem(data), id: data.id ?? crypto.randomUUID() };
  if (!item.nombre) {
    throw falla("El nombre del plato es obligatorio");
  }

  const items = categoryFound.items ?? [];
  const duplicated = items.some(
    (current) => normalize(current.nombre) === normalize(item.nombre),
  );
  if (duplicated) {
    throw falla("Ya existe un plato con ese nombre en la categoría", 409);
  }

  return await allMenu.update(id, { items: [...items, item] });
}

async function updateItem(id, itemName, data = {}) {
  const allMenu = new Menu();
  const categoryFound = await allMenu.getById(id);
  if (!categoryFound) {
    return null;
  }

  const updateData = validarItem(data);
  if (Object.keys(updateData).length === 0) {
    throw falla("No hay campos válidos para actualizar");
  }

  const items = categoryFound.items ?? [];
  const itemIndex = indiceItem(items, itemName);
  if (itemIndex === -1) {
    return null;
  }

  if (updateData.nombre) {
    const duplicated = items.some(
      (current, index) =>
        index !== itemIndex && normalize(current.nombre) === normalize(updateData.nombre),
    );
    if (duplicated) {
      throw falla("Ya existe un plato con ese nombre en la categoría", 409);
    }
  }

  const updatedItem = { ...items[itemIndex], ...updateData };
  const updatedItems = items.map((current, index) =>
    index === itemIndex ? updatedItem : current,
  );

  const category = await allMenu.update(id, { items: updatedItems });
  return { ...updatedItem, categoria: category.categoria, categoriaId: category.id };
}

async function deleteItem(id, itemName) {
  const allMenu = new Menu();
  const categoryFound = await allMenu.getById(id);
  if (!categoryFound) {
    return null;
  }

  const items = categoryFound.items ?? [];
  const itemIndex = indiceItem(items, itemName);
  if (itemIndex === -1) {
    return null;
  }

  const deletedItem = items[itemIndex];
  const updatedItems = items.filter((current, index) => index !== itemIndex);
  await allMenu.update(id, { items: updatedItems });

  return {
    ...deletedItem,
    categoria: categoryFound.categoria,
    categoriaId: categoryFound.id,
    deleted: true,
  };
}

module.exports = {
  getFullMenu,
  getDishByCategory,
  getDishById,
  createCategory,
  updateCategory,
  deleteCategory,
  addItem,
  updateItem,
  deleteItem,
};
