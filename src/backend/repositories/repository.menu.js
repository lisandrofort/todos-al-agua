const { admin } = require("../lib/firebase");

// Los documentos creados antes de existir el ID de plato no lo tienen: se les
// asigna uno estable en memoria. Al guardar la categoría, el ID se persiste.
function conIds(categoria) {
  const items = (categoria.items ?? []).map((item, index) => ({
    ...item,
    id: item.id ?? `${categoria.id}-item-${index}`,
  }));
  return { ...categoria, items };
}

class Menu {
  constructor() {
    this.db = admin;
    this.collection = this.db.collection("menu");
  }

  async getAll() {
    const snapshot = await this.collection.get();
    const menuItems = [];
    snapshot.forEach((doc) => {
      menuItems.push(conIds({ id: doc.id, ...doc.data() }));
    });
    return menuItems;
  }

  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return conIds({ id: doc.id, ...doc.data() });
  }

  async create(data) {
    const docRef = await this.collection.add(data);
    const doc = await docRef.get();
    return conIds({ id: doc.id, ...doc.data() });
  }

  async update(id, data) {
    await this.collection.doc(id).update(data);
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return conIds({ id: doc.id, ...doc.data() });
  }

  async delete(id) {
    await this.collection.doc(id).delete();
    return { id, deleted: true };
  }
}

module.exports = Menu;
