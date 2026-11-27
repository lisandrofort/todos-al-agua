const { admin } = require("../lib/firebase");
const bcrypt = require("bcryptjs");
const { falla } = require("../lib/validacion.js");

function normalizeEmail(email) {
  return String(email ?? "")
    .trim()
    .toLowerCase();
}

function emailCandidates(email) {
  const clean = String(email ?? "").trim();
  const normalized = clean.toLowerCase();
  return normalized === clean ? [normalized] : [normalized, clean];
}

class User {
  constructor() {
    this.db = admin;
    this.collection = this.db.collection("users");
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
      throw falla("Ya hay un registro con este email", 409);
    }

    return admin.runTransaction(async (transaction) => {
      const emailRef = admin.collection("user_emails").doc(normalized);
      const lock = await transaction.get(emailRef);
      if (lock.exists) {
        throw falla("Ya hay un registro con este email", 409);
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
        .collection("users")
        .where("email", "==", candidate)
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
    const updateData = data.email
      ? { ...data, email: normalizeEmail(data.email) }
      : data;

    if (updateData.email) {
      // La reserva del email nuevo se verifica dentro de la transacción:
      // nunca se sobrescribe la reserva de otro usuario.
      const emailNormalizado = updateData.email;
      const userRef = this.collection.doc(id);
      const nuevaReserva = admin.collection("user_emails").doc(emailNormalizado);

      return admin.runTransaction(async (transaction) => {
        const userDoc = await transaction.get(userRef);
        if (!userDoc.exists) {
          return null;
        }

        const reserva = await transaction.get(nuevaReserva);
        if (reserva.exists && reserva.data()?.userId !== id) {
          throw falla("Ya hay un registro con este email", 409);
        }

        const emailAnterior = normalizeEmail(userDoc.data().email);
        if (emailAnterior && emailAnterior !== emailNormalizado) {
          transaction.delete(
            admin.collection("user_emails").doc(emailAnterior),
          );
        }

        transaction.set(userRef, updateData, { merge: true });
        transaction.set(
          nuevaReserva,
          { userId: id, createdAt: Date.now() },
          { merge: true },
        );
        return { id, ...userDoc.data(), ...updateData };
      });
    }

    const userRef = this.collection.doc(id);
    const userDoc = await userRef.get();
    if (!userDoc.exists) {
      return null;
    }
    await userRef.update(updateData);

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
      batch.delete(
        admin.collection("user_emails").doc(normalizeEmail(user.email)),
      );
    }
    await batch.commit();
    return { id, deleted: true };
  }
}

module.exports = User;
