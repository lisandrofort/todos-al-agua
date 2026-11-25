import { createBrowserRouter } from "react-router";
import Home from "../pages/Home";
import Cantina from "../pages/Cantina";
import Huerta from "../pages/Huerta";
import Login from "../pages/Login";
import Register from "../pages/Register";
import RecoverPassword from "../pages/RecoverPassword";
import ResetPassword from "../pages/ResetPassword";
import Admin from "../pages/Admin";
import AdminIndex from "../pages/AdminIndex";
import UsersPanel from "../components/admin/UsersPanel";
import MenuPanel from "../components/admin/MenuPanel";
import HuertaPanel from "../components/admin/HuertaPanel";
import AyudaPanel from "../components/admin/AyudaPanel";
import ProtectedRoute from "./ProtectedRoute";
import GuestRoute from "./GuestRoute";
import NotFound from "../pages/NotFound";
import { PERMISOS } from "../auth/permissions";

const router = createBrowserRouter([
  { path: "/", element: <Home /> },
      { path: "/cantina", element: <Cantina /> },
      { path: "/huerta", element: <Huerta /> },
      {
        element: <GuestRoute />,
        children: [
          { path: "/login", element: <Login /> },
          { path: "/registro", element: <Register /> },
        ],
      },
      { path: "/recuperar", element: <RecoverPassword /> },
      { path: "/restablecer", element: <ResetPassword /> },
      {
        path: "/admin",
        element: <ProtectedRoute requiredPermission={PERMISOS.ACCESO_ADMIN} />,
        children: [
          {
            element: <Admin />,
            children: [
              { index: true, element: <AdminIndex /> },
              {
                element: <ProtectedRoute requiredPermission={PERMISOS.VER_USUARIOS} />,
                children: [{ path: "usuarios", element: <UsersPanel /> }],
              },
              {
                element: <ProtectedRoute requiredPermission={PERMISOS.EDITAR_MENU} />,
                children: [{ path: "menu", element: <MenuPanel /> }],
              },
              {
                element: <ProtectedRoute requiredPermission={PERMISOS.EDITAR_HUERTA} />,
                children: [{ path: "huerta", element: <HuertaPanel /> }],
              },
              { path: "ayuda", element: <AyudaPanel /> },
            ],
          },
        ],
      },
      { path: "/404", element: <NotFound /> },
      { path: "*", element: <NotFound /> },
]);

export default router;
