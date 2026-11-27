const crypto = require("crypto");
const { admin } = require("../lib/firebase");

const COLLECTION = "password_resets";
const EXPIRATION_MS = 30 * 60 * 1000; // 30 minutos

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function create(userId, token) {
  const now = Date.now();
  const docRef = admin.collection(COLLECTION).doc(hashToken(token));
  await docRef.set({
    userId,
    tokenHash: hashToken(token),
    createdAt: now,
    expiresAt: now + EXPIRATION_MS,
    used: false,
  });
  return docRef.id;
}

async function findValid(token) {
  const hash = hashToken(token);
  // Los tokens nuevos usan el hash como ID (lectura directa); la query cubre
  // los documentos creados antes de ese cambio.
  let doc = await admin.collection(COLLECTION).doc(hash).get();
  if (!doc.exists) {
    const snapshot = await admin
      .collection(COLLECTION)
      .where("tokenHash", "==", hash)
      .limit(1)
      .get();
    if (snapshot.empty) return null;
    doc = snapshot.docs[0];
  }

  const data = doc.data();
  if (data.used || !data.expiresAt || Date.now() > data.expiresAt) return null;

  return { id: doc.id, ...data };
}

// Consumir el token y cambiar la contraseña en una sola transacción: dos
// peticiones concurrentes con el mismo link no pueden aplicar el cambio dos veces.
async function consumeAndChangePassword(resetId, userId, hashedPass) {
  const resetRef = admin.collection(COLLECTION).doc(resetId);
  const userRef = admin.collection("users").doc(userId);

  return admin.runTransaction(async (transaction) => {
    const [resetDoc, userDoc] = await Promise.all([
      transaction.get(resetRef),
      transaction.get(userRef),
    ]);
    if (!resetDoc.exists || !userDoc.exists) {
      return false;
    }

    const data = resetDoc.data();
    if (data.used || !data.expiresAt || Date.now() > data.expiresAt) {
      return false;
    }

    transaction.update(resetRef, { used: true, usedAt: Date.now() });
    transaction.update(userRef, { pass: hashedPass });
    return true;
  });
}

async function invalidateForUser(userId) {
  const snapshot = await admin
    .collection(COLLECTION)
    .where("userId", "==", userId)
    .where("used", "==", false)
    .get();

  await Promise.all(
    snapshot.docs.map((doc) => doc.ref.update({ used: true, usedAt: Date.now() })),
  );
}

module.exports = {
  create,
  findValid,
  consumeAndChangePassword,
  invalidateForUser,
};
