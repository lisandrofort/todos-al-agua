const crypto = require("crypto");
const { admin } = require("../lib/firebase");

const COLLECTION = "password_resets";
const EXPIRATION_MS = 30 * 60 * 1000; // 30 minutos

function hashToken(token) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

async function create(userId, token) {
  const now = Date.now();
  const docRef = await admin.collection(COLLECTION).add({
    userId,
    tokenHash: hashToken(token),
    createdAt: now,
    expiresAt: now + EXPIRATION_MS,
    used: false,
  });
  return docRef.id;
}

async function findValid(token) {
  const snapshot = await admin
    .collection(COLLECTION)
    .where("tokenHash", "==", hashToken(token))
    .where("used", "==", false)
    .limit(1)
    .get();

  if (snapshot.empty) return null;

  const doc = snapshot.docs[0];
  const data = doc.data();
  if (!data.expiresAt || Date.now() > data.expiresAt) return null;

  return { id: doc.id, ...data };
}

async function markUsed(id) {
  await admin.collection(COLLECTION).doc(id).update({ used: true, usedAt: Date.now() });
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

module.exports = { create, findValid, markUsed, invalidateForUser };
