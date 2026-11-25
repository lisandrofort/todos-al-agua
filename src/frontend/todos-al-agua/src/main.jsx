import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AuthProvider from "./auth/AuthProvider";
import SessionWarning from "./components/SessionWarning";
import router from "./routes/index.jsx";
import "./index.css";

// Un solo proveedor: el de la sesión.
// Los datos (menú y usuarios) los carga el Layout de las rutas.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <SessionWarning />
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
