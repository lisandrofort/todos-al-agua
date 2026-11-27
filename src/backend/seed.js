require("dotenv").config();

const bcrypt = require("bcryptjs");
const { admin } = require("./lib/firebase");
const menuLocal = require("./repositories/data.json");

async function seedMenu() {
  const collection = admin.collection("menu");
  const snapshot = await collection.get();
  if (!snapshot.empty) {
    console.log(`menu: ya hay ${snapshot.size} documentos, se omite`);
    return;
  }
  for (const categoria of menuLocal.menu) {
    await collection.add({
      categoria: categoria.categoria,
      items: categoria.items ?? [],
      ...(categoria.nota_guarnicion ? { nota_guarnicion: categoria.nota_guarnicion } : {}),
    });
  }
  console.log(`menu: ${menuLocal.menu.length} categorias cargadas`);
}

async function seedUsers() {
  const collection = admin.collection("users");
  const email = "admin@todosalagua.com";
  const snapshot = await collection.where("email", "==", email).get();
  if (!snapshot.empty) {
    console.log("users: el admin ya existe, se omite");
    return;
  }
  const password = process.env.ADMIN_SEED_PASSWORD;
  if (!password || password.length < 12) {
    throw new Error(
      "ADMIN_SEED_PASSWORD debe definirse con al menos 12 caracteres antes de ejecutar el seed",
    );
  }

  const pass = await bcrypt.hash(password, 10);
  await collection.add({
    name: "Administrador",
    email,
    pass,
    rol: "admin",
  });
  // Nunca imprimir la contraseña: se entrega por canal seguro al administrador.
  console.log(`users: admin cargado (${email})`);
}

async function main() {
  await seedMenu();
  await seedUsers();
  console.log("Seed finalizado.");
  process.exit(0);
}

main().catch((error) => {
  console.error("Error en seed:", error.message);
  process.exit(1);
});
