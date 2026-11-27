// Errores de validación: se marcan como públicos para que el manejador global
// pueda devolver el mensaje al cliente sin filtrar errores internos.
function falla(mensaje, status = 400) {
  const error = new Error(mensaje);
  error.status = status;
  error.publico = true;
  return error;
}

function textoRequerido(valor, mensaje, max = 200) {
  if (typeof valor !== "string" || !valor.trim()) {
    throw falla(mensaje);
  }
  if (valor.length > max) {
    throw falla(`El texto es demasiado largo (máximo ${max} caracteres)`);
  }
  return valor.trim();
}

function textoOpcional(valor, max = 200) {
  const texto = valor === undefined || valor === null ? "" : String(valor).trim();
  if (texto.length > max) {
    throw falla(`El texto es demasiado largo (máximo ${max} caracteres)`);
  }
  return texto;
}

function email(valor) {
  const limpio = textoRequerido(valor, "Ingresá un email", 200);
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(limpio)) {
    throw falla("Ingresá un email válido");
  }
  return limpio.toLowerCase();
}

function clave(valor) {
  if (typeof valor !== "string" || valor.length < 6) {
    throw falla("La contraseña debe tener al menos 6 caracteres");
  }
  if (valor.length > 200) {
    throw falla("La contraseña es demasiado larga");
  }
  return valor;
}

function precio(valor, mensaje) {
  if (valor === undefined || valor === null || valor === "") {
    return undefined;
  }
  const numero = Number(valor);
  if (!Number.isFinite(numero) || numero < 0) {
    throw falla(mensaje ?? "El precio debe ser un número mayor o igual a cero");
  }
  return numero;
}

function validarItem(data = {}) {
  const item = {};
  if (data.nombre !== undefined) {
    item.nombre = textoRequerido(data.nombre, "El nombre del plato es obligatorio", 120);
  }
  if (data.descripcion !== undefined) {
    item.descripcion = textoOpcional(data.descripcion, 500);
  }
  const precioItem = precio(data.precio, "El precio del plato no es válido");
  if (precioItem !== undefined) {
    item.precio = precioItem;
  }

  if (data.precios !== undefined) {
    if (!data.precios || typeof data.precios !== "object" || Array.isArray(data.precios)) {
      throw falla("Los precios deben ser un objeto de tamaño → precio");
    }
    item.precios = {};
    for (const [tamano, valor] of Object.entries(data.precios)) {
      const numero = precio(valor, `El precio de "${tamano}" no es válido`);
      item.precios[tamano] = numero;
    }
  }
  if (data.promocion !== undefined) {
    item.promocion = textoOpcional(data.promocion, 200);
  }
  return item;
}

module.exports = {
  falla,
  textoRequerido,
  textoOpcional,
  email,
  clave,
  precio,
  validarItem,
};
