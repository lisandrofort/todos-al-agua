import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { RouterProvider } from "react-router";
import AuthProvider from "./auth/AuthProvider";
import SessionWarning from "./components/SessionWarning";
import WelcomeGate from "./components/WelcomeGate";
import router from "./routes/index.jsx";
import "./index.css";

// Un solo proveedor: el de la sesión.
// Cada pantalla carga los datos que necesita directamente desde la API.
createRoot(document.getElementById("root")).render(
  <StrictMode>
    <AuthProvider>
      <WelcomeGate />
      <SessionWarning />
      <RouterProvider router={router} />
    </AuthProvider>
  </StrictMode>,
);
