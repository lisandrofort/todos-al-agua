const AUTH_LINKS = ["/login", "/registro"];

const HOME = { href: "/", label: "Home" };
const CANTINA = { href: "/cantina", label: "Cantina" };
const HUERTA = { href: "/huerta", label: "Huerta" };
const LOGIN = { href: "/login", label: "Iniciar sesión" };
const REGISTRO = { href: "/registro", label: "Registrarse" };

// Un único lugar para definir la navegación de cada página.
export function linksPara(pagina) {
  if (pagina === "home") return [CANTINA, HUERTA, LOGIN, REGISTRO];
  if (pagina === "cantina") return [HOME, HUERTA, LOGIN, REGISTRO];
  if (pagina === "huerta") return [HOME, CANTINA, LOGIN, REGISTRO];
  return [HOME, CANTINA, HUERTA];
}

export function visibleNavLinks(links, user, canAccessAdmin) {
  const filtered = user
    ? links.filter((link) => !AUTH_LINKS.includes(link.href))
    : links;

  if (!canAccessAdmin) {
    return filtered;
  }

  if (filtered.some((link) => link.href === "/admin")) {
    return filtered;
  }

  return [...filtered, { href: "/admin", label: "Admin" }];
}

export function visibleCta(cta, user) {
  if (user && AUTH_LINKS.includes(cta.href)) {
    return { href: "/", label: "Volver al inicio" };
  }

  return cta;
}
