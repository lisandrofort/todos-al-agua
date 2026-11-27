// Decodifica el payload de un JWT sin verificar la firma (eso lo hace la API).
// Maneja base64url y valida que el token tenga una fecha de expiración válida.
function decodificarToken(token) {
  if (!token || typeof token !== "string") {
    return null;
  }

  const parte = token.split(".")[1];
  if (!parte) {
    return null;
  }

  try {
    const base64 = parte.replace(/-/g, "+").replace(/_/g, "/");
    const relleno = base64.length % 4 ? "=".repeat(4 - (base64.length % 4)) : "";
    const payload = JSON.parse(atob(base64 + relleno));

    if (
      typeof payload.exp !== "number" ||
      !Number.isFinite(payload.exp) ||
      payload.exp * 1000 <= Date.now()
    ) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export { decodificarToken };
