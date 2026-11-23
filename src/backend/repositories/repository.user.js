const { admin } = require('../lib/firebase');
const bcrypt = require('bcryptjs');

function normalizeEmail(email) {
  return String(email ?? '').trim().toLowerCase();
}

// Incluye la versión original sin normalizar para encontrar cuentas viejas
// registradas antes de que se normalizara el email.
function emailCandidates(email) {
  const clean = String(email ?? '').trim();
  const normalized = clean.toLowerCase();
  return normalized === clean ? [normalized] : [normalized, clean];
}

class User {
  constructor() {
    this.db = admin;
    this.collection = this.db.collection('users');
  }

  async getAll() {
    const snapshot = await this.collection.get();
    const users = [];
    snapshot.forEach((doc) => {
      users.push({
        id: doc.id,
        ...doc.data(),
      });
    });
    return users;
  }

  async create({ email, pass, name, nombre, rol }) {
    const userData = {
      email: normalizeEmail(email),
      pass,
      name: name ?? nombre,
      rol,
    };
    const docRef = await this.collection.add(userData);
    return { id: docRef.id, ...userData };
  }

  // Unicidad atómica: el documento de "user_emails" con id = email normalizado
  // actúa como reserva. Dentro de la transacción solo se pueden leer
  // DocumentReferences (no Queries), por eso se usa esta colección.
  async createUnique({ email, pass, name, nombre, rol }) {
    const normalized = normalizeEmail(email);
    const userData = {
      email: normalized,
      pass,
      name: name ?? nombre,
      rol,
    };

    // Cubre cuentas viejas creadas antes de existiera la reserva.
    if (await User.exists(email)) {
      const error = new Error('Ya hay un registro con este email');
      error.status = 409;
      throw error;
    }

    return admin.runTransaction(async (transaction) => {
      const emailRef = admin.collection('user_emails').doc(normalized);
      const lock = await transaction.get(emailRef);
      if (lock.exists) {
        const error = new Error('Ya hay un registro con este email');
        error.status = 409;
        throw error;
      }

      const docRef = this.collection.doc();
      transaction.set(docRef, userData);
      transaction.set(emailRef, { userId: docRef.id, createdAt: Date.now() });
      return { id: docRef.id, ...userData };
    });
  }

  static async getByEmail(email) {
    for (const candidate of emailCandidates(email)) {
      const snapshot = await admin
        .collection('users')
        .where('email', '==', candidate)
        .limit(1)
        .get();
      if (!snapshot.empty) {
        const doc = snapshot.docs[0];
        return { id: doc.id, ...doc.data() };
      }
    }
    return null;
  }

  static async exists(email) {
    return (await User.getByEmail(email)) !== null;
  }

  async login(email, pass) {
    const user = await User.getByEmail(email);
    if (!user || !user.pass) {
      return null;
    }
    const isValid = await bcrypt.compare(pass, user.pass);
    if (!isValid) {
      return null;
    }
    return user;
  }

  async getById(id) {
    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async update(id, data) {
    const current = await this.getById(id);
    const updateData = data.email ? { ...data, email: normalizeEmail(data.email) } : data;

    if (current && updateData.email && updateData.email !== normalizeEmail(current.email)) {
      const batch = admin.batch();
      batch.update(this.collection.doc(id), updateData);
      batch.delete(admin.collection('user_emails').doc(normalizeEmail(current.email)));
      batch.set(admin.collection('user_emails').doc(updateData.email), {
        userId: id,
        createdAt: Date.now(),
      });
      await batch.commit();
    } else {
      await this.collection.doc(id).update(updateData);
    }

    const doc = await this.collection.doc(id).get();
    if (!doc.exists) {
      return null;
    }
    return {
      id: doc.id,
      ...doc.data(),
    };
  }

  async delete(id) {
    const user = await this.getById(id);
    const batch = admin.batch();
    batch.delete(this.collection.doc(id));
    if (user?.email) {
      batch.delete(admin.collection('user_emails').doc(normalizeEmail(user.email)));
    }
    await batch.commit();
    return { id, deleted: true };
  }
}

module.exports = User;
