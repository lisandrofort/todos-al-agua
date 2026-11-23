# Todos al Agua — Trabajo Final Integrador

Aplicación web para la asociación **Todos al Agua Necochea**: sitio público con la carta de la cantina y la huerta, acceso con cuentas reales y un panel de administración con permisos por rol.

## Stack

- **Frontend:** React 19, Vite 8, React Router 8, ESLint.
- **Backend:** Node.js + Express 5, Firebase (Firestore, API *compat*), `bcryptjs`, `jsonwebtoken`, `dotenv`.
- **Deploy:** Vercel (frontend) y Render (backend).

## Estructura de carpetas

```text
todos-al-agua/
├── documentos/                       # entregas, PDFs e imágenes del proyecto
└── src/
    ├── backend/
    │   ├── controllers/              # lógica de negocio de usuarios y menú
    │   ├── lib/firebase.js           # init de Firestore con API compat
    │   ├── middlewares/              # verificación de JWT y rol de administrador
    │   ├── repositories/             # acceso a Firestore + data.json inicial
    │   ├── routes/                   # endpoints /users y /menu
    │   ├── index.js                  # servidor Express, CORS y montaje de rutas
    │   ├── seed.js                   # carga inicial de menú y usuario admin
    │   └── .env                      # credenciales (no versionado)
    └── frontend/todos-al-agua/
        ├── public/                   # favicon e iconos SVG
        ├── src/
        │   ├── api/client.js         # fetch a la API + token JWT
        │   ├── auth/                 # AuthContext/AuthProvider y permisos por rol
        │   ├── routes/               # rutas públicas, protegidas y de invitados
        │   ├── pages/                # Home, Cantina, Huerta, Login, Register, Admin, 404
        │   ├── components/           # secciones reutilizables de las páginas
        │   ├── components/admin/     # panel de usuarios, menú, huerta y ayuda
        │   ├── data/                 # providers de menú/usuarios y contenido inicial
        │   ├── ui/                   # botones, tarjetas, logo, iconos, etc.
        │   ├── utils/                # precios, normalización del menú y navegación
        │   ├── main.jsx              # providers + router
        │   └── theme.css             # tokens de color y tipografía
        ├── vercel.json               # rewrite SPA: todas las rutas → index.html
        └── .env                      # VITE_API_URL (no versionado)
```

## Requisitos

- Node.js 20.19+ o 22.12+ (requerido por Vite 8).
- Proyecto de Firebase con **Cloud Firestore** habilitado.

## Instalación y ejecución local

```bash
# Backend
cd src/backend
npm install
# creá src/backend/.env con las variables listadas abajo
node seed.js          # carga el menú y el usuario admin (una sola vez)
npm run dev           # http://localhost:3000

# Frontend (en otra terminal)
cd src/frontend/todos-al-agua
npm install
# creá .env con VITE_API_URL=http://localhost:3000
npm run dev           # http://localhost:5173
```

Usuario de prueba: `admin@todosalagua.com` / `123456`.

## Variables de entorno

Los archivos `.env` están en `.gitignore`: **nunca subir credenciales**.

Backend (`src/backend/.env`):

| Variable | Uso |
|---|---|
| `API_KEY`, `AUTH_DOMAIN`, `PROJECT_ID`, `STORAGE_BUCKET`, `MESSAGING_SENDER_ID`, `APP_ID` | Configuración de la app web de Firebase |
| `CANTINA_TOKEN` | Secreto para firmar y verificar los JWT |
| `ROL_ADMIN` | Rol exigido por los endpoints de administración |
| `PORT` | Puerto del servidor (por defecto, `3000`) |
| `FRONTEND_URL` | Origen permitido por CORS y base del link de recuperación |
| `RESEND_API_KEY` | API key de Resend para enviar emails de recuperación |
| `EMAIL_FROM` | Remitente verificado en Resend |
| `RESEND_API_URL` | URL de la API de Resend (opcional; por defecto `https://api.resend.com`) |
| `CONTACT_TO_EMAIL` | Destinatario de los mensajes del formulario de contacto (por defecto `hola@todosalagua.com.ar`) |

Frontend (`src/frontend/todos-al-agua/.env`):

| Variable | Uso |
|---|---|
| `VITE_API_URL` | URL base de la API (`http://localhost:3000` en local) |
| `VITE_GUIA_ADMIN_URL` | URL de la guía del administrador (opcional) |

## Scripts

| Proyecto | Comando | Acción |
|---|---|---|
| Backend | `npm run dev` | Arranca la API en `PORT` (3000 por defecto) |
| Backend | `node seed.js` | Carga el menú y el usuario admin en Firestore |
| Frontend | `npm run dev` | Servidor de desarrollo Vite en `:5173` |
| Frontend | `npm run build` | Genera `dist/` |
| Frontend | `npm run preview` | Sirve `dist/` localmente |
| Frontend | `npm run lint` | ESLint |

## API REST

Base local: `http://localhost:3000`. Los endpoints marcados con 🔒 requieren cabecera `Authorization: Bearer <token>` y rol `admin`.

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/users/register` | público | Crea usuario (siempre con rol `usuario`); rechaza emails duplicados con 409 |
| `GET` | `/users/exists?email=...` | público | Indica si el email ya está registrado (para el chequeo en vivo) |
| `POST` | `/users/login` | público | Verifica contraseña y devuelve `{ token }` |
| `POST` | `/users/refresh` | privado | Renueva el JWT por otros 1 minuto de inactividad |
| `POST` | `/users/forgot-password` | público | Envía por email un link de recuperación (válido 30 min) |
| `POST` | `/users/reset-password` | público | Cambia la contraseña usando el token del link |
| `POST` | `/contact` | público | Envía la consulta del formulario por email |
| `GET` | `/users` | privado | Lista usuarios (sin contraseñas) |
| `GET` | `/users/:id` | privado | Detalle de un usuario |
| `PUT` | `/users/:id` | privado | Actualiza datos y rol |
| `DELETE` | `/users/:id` | privado | Elimina usuario |
| `GET` | `/menu` | público | Categorías y platos |
| `GET` | `/menu/category/:category` | público | Filtra por categoría |
| `GET` | `/menu/:id` | público | Categoría por ID |
| `POST` | `/menu` | privado | Crea categoría |
| `PUT` | `/menu/:id` | privado | Actualiza categoría |
| `DELETE` | `/menu/:id` | privado | Elimina categoría |
| `POST` | `/menu/:id/items` | privado | Agrega plato |
| `PUT` | `/menu/:id/items/:itemName` | privado | Actualiza plato |
| `DELETE` | `/menu/:id/items/:itemName` | privado | Elimina plato |

## Autenticación y roles

- Las contraseñas se guardan con hash de `bcryptjs`. El login devuelve un **JWT** con `id`, `email`, `name` y `rol` (nunca la contraseña), con vencimiento de **1 minuto de inactividad**. La actividad del usuario (clicks, teclas, scroll, cambio de pestaña) renueva el token cuando quedan menos de 20 segundos; si no hay actividad, la sesión se cierra y `/login` muestra un aviso. A los 10 segundos del vencimiento aparece un diálogo para “Seguir conectado” o “Cerrar sesión”. La sesión también se sincroniza entre pestañas.
- El registro **siempre** crea usuarios con rol `usuario`, sin importar lo que envíe el cliente. Los roles los cambia un administrador desde `/admin/usuarios`.
- Roles: `admin` (todo), `cantina` (panel + editar menú), `huerta` (panel + editar huerta), `usuario` (sin acceso al panel).
- El frontend guarda el token en `localStorage` bajo `todos-al-agua.token`, lo decodifica para obtener el rol y calcula los permisos desde `src/auth/permissions.js`.

## Rutas

| Ruta | Acceso |
|---|---|
| `/`, `/cantina`, `/huerta` | públicas |
| `/login`, `/registro` | solo invitados |
| `/recuperar`, `/restablecer?token=...` | pública: pedir y completar el cambio de contraseña |
| `/admin` | requiere acceso al panel → redirige al panel correspondiente |
| `/admin/usuarios` | permiso `ver_usuarios` |
| `/admin/menu` | permiso `editar_menu` |
| `/admin/huerta` | permiso `editar_huerta` |
| `/admin/ayuda` | acceso al panel |
| `/404` y cualquier ruta inexistente | página 404 propia |

Sin sesión, una ruta protegida redirige a `/login`. Con sesión pero sin permisos, redirige a `/404` (nunca al 404 genérico de Vercel, gracias al rewrite de `vercel.json`).

## Deploy

- **Frontend (Vercel):** proyecto conectado a este repo, rama `master`, *Root Directory* `src/frontend/todos-al-agua`, build de Vite con salida `dist/`, variable `VITE_API_URL=https://todos-al-agua-backend.onrender.com`. El archivo `vercel.json` reescribe todas las rutas a `index.html` para que los refrescos de `/admin` funcionen.
- **Backend (Render):** servicio Node desde `src/backend`, mismo set de variables de entorno que en local, URL pública `https://todos-al-agua-backend.onrender.com`.
- Cada push a `master` dispara un redeploy automático del frontend.

## Flujo de Git

```bash
# 1. Ir a tu rama base y traer lo último de master
git switch < nombre-rama >
git pull origin master

# 2. Crear y moverte a la rama de la nueva tarea
git switch -c < feature-nombre-tarea >

# --- (Aquí escribes y guardas tu código) ---

# 3. Guardar tus cambios en la rama de la tarea
git add .
git commit -am "feature: descripción de los cambios"

# 4. Volver a < nombre-rama >, traer los cambios de la tarea y subir a GitHub
git switch < nombre-rama >
git merge < feature-nombre-tarea >
git push origin < nombre-rama >

# 5. (Opcional) Borrar la rama temporal ya fusionada
git branch -d < feature-nombre-tarea >
```

## Solución de problemas

- **401 al querer entrar:** el JWT venció por inactividad (1 minuto) o es inválido. El frontend cierra la sesión automáticamente y te devuelve a `/login`; iniciá sesión de nuevo. Si el backend está suspendido (Render gratuito), el refresh no puede renovar y la sesión vence al llegar a 1 minuto.
- **"No se pudo conectar con el servidor":** revisar `VITE_API_URL` y que el backend esté activo (en Render el plan gratuito puede suspender el servicio).
- **404 al recargar `/admin`:** confirmar que `vercel.json` esté en el *Root Directory* configurado en Vercel.
- **Error de Firebase al arrancar:** revisar las variables `API_KEY`…`APP_ID` y que Firestore esté habilitado.
- **Error de CORS:** configurar `FRONTEND_URL` en el backend con el origen del frontend.

## Enlaces

- Repositorio: <https://github.com/lisandrofort/todos-al-agua>
- Frontend: <https://todos-al-agua.vercel.app>
- Backend: <https://todos-al-agua-backend.onrender.com>
- Guía de administrador: <https://guia-de-usuario-administrador.netlify.app>
- Diseño en Figma: <https://www.figma.com/design/Ek7siuUc9UwbRUtxNRkil8/Untitled?node-id=0-1&t=ccek5bI3gLaGQ1ht-1>
- Identidad visual en Figma: <https://www.figma.com/design/YeRr4yBr5cPasZIhnWof9Y/Sin-título?node-id=0-1&t=F2A6ESDAazV2Ma9V-1>
