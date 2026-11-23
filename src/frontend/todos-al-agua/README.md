# Todos al Agua — Frontend

SPA del sitio (Home, Cantina, Huerta, login/registro y panel de administración).

La documentación completa del proyecto —estructura de carpetas, instalación, variables de entorno, API, roles, rutas y deploy— está en el [**README raíz**](../../README.md).

## Desarrollo

Requiere Node.js 20.19+ o 22.12+.

```bash
npm install
npm run dev      # http://localhost:5173
npm run build    # genera dist/
npm run preview  # sirve dist/
npm run lint     # ESLint
```

## Configuración

Las variables van en un `.env` local (no versionado):

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL base de la API; por defecto `http://localhost:3000` |
| `VITE_GUIA_ADMIN_URL` | URL de la guía del administrador (opcional) |

## Estructura resumida

```text
src/
├── api/client.js     # fetch a la API y token JWT
├── auth/             # sesión (Context/Provider) y permisos por rol
├── routes/           # router: rutas públicas, protegidas, invitados y 404
├── pages/            # páginas y sus estilos
├── components/       # secciones de las páginas
├── components/admin/ # panel de usuarios, menú, huerta y ayuda
├── data/             # providers de menú/usuarios y contenido inicial
├── ui/               # componentes reutilizables
├── utils/            # helpers
└── main.jsx          # providers + router
```

`vercel.json` contiene el rewrite SPA que hace que las rutas como `/admin` funcionen al recargar o al abrirlas directamente.
