import { useEffect } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Home from "./pages/Home";
import Home2 from "./pages/Home2";
import Home3 from "./pages/Home3";
import Example from "./pages/Example";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Claims from "./pages/Claims";
import Network from "./pages/Network";
import CardAcquisition from "./pages/CardAcquisition";
import Commissions from "./pages/Commissions";
import Activity from "./pages/Activity";
import Help from "./pages/Help";
import ForgotPassword from "./pages/ForgotPassword";
import VerificationCode from "./pages/VerificationCode";
import VerificationSent from "./pages/VerificationSent";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordSuccess from "./pages/ResetPasswordSuccess";
import TestBg from "./pages/TestBg";
import ProtectedRoute from "./components/atoms/ProtectedRoute";

// Create a client
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  const action = useNavigationType();
  const location = useLocation();
  const pathname = location.pathname;

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    let title = "";
    let metaDescription = "";

    switch (pathname) {
      case "/":
        title = "Kivoo Web - Home";
        metaDescription = "Plataforma de gestión de tarjetas recargables";
        break;
      case "/example":
        title = "Kivoo Web - Example";
        metaDescription = "Página de ejemplo con fondo PNG";
        break;
      case "/home2":
        title = "Kivoo Web - Home2";
        metaDescription = "Página de recreación con vectores";
        break;
      case "/home3":
        title = "Kivoo Web - Home3";
        metaDescription = "Página de recreación con SVG";
        break;
      case "/login":
        title = "Kivoo Web - Login";
        metaDescription = "Inicia sesión en tu cuenta de Kivoo";
        break;
      case "/dashboard":
        title = "Kivoo Web - Dashboard";
        metaDescription = "Panel de control de tu cuenta Kivoo";
        break;
      case "/claims":
        title = "Kivoo Web - Claims";
        metaDescription = "Gestiona tus claims en Kivoo";
        break;
      case "/network":
        title = "Kivoo Web - Red";
        metaDescription = "Gestiona tu red en Kivoo";
        break;
      case "/forgot-password":
        title = "Kivoo Web - Restablecer contraseña";
        metaDescription = "Recupera el acceso a tu cuenta";
        break;
      case "/verification-code":
        title = "Kivoo Web - Código de verificación";
        metaDescription = "Verifica tu identidad con el código enviado";
        break;
      case "/verification-sent":
        title = "Kivoo Web - Código enviado";
        metaDescription = "Te enviamos un código de verificación";
        break;
      case "/reset-password":
        title = "Kivoo Web - Crear nueva contraseña";
        metaDescription = "Define una nueva contraseña segura";
        break;
      case "/reset-password/success":
        title = "Kivoo Web - Contraseña actualizada";
        metaDescription = "Tu contraseña fue actualizada exitosamente";
        break;
      case "/test-bg":
        title = "Kivoo Web - Test Background";
        metaDescription = "Página de prueba del nuevo fondo KivoMainBg";
        break;
    }

    if (title) {
      document.title = title;
    }

    if (metaDescription) {
      const metaDescriptionTag: HTMLMetaElement | null = document.querySelector(
        'head > meta[name="description"]',
      );
      if (metaDescriptionTag) {
        metaDescriptionTag.content = metaDescription;
      }
    }
  }, [pathname]);

  return (
    <QueryClientProvider client={queryClient}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/example" element={<Example />} />
        <Route path="/home2" element={<Home2 />} />
        <Route path="/home3" element={<Home3 />} />
        <Route path="/login" element={<Login />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claims"
          element={
            <ProtectedRoute allowed={false}>
              <Claims />
            </ProtectedRoute>
          }
        />
        <Route
          path="/network"
          element={
            <ProtectedRoute>
              <Network />
            </ProtectedRoute>
          }
        />
        <Route
          path="/card-acquisition"
          element={
            <ProtectedRoute allowed={false}>
              <CardAcquisition />
            </ProtectedRoute>
          }
        />
        <Route
          path="/commissions"
          element={
            <ProtectedRoute allowed={false}>
              <Commissions />
            </ProtectedRoute>
          }
        />
        <Route
          path="/activity"
          element={
            <ProtectedRoute allowed={false}>
              <Activity />
            </ProtectedRoute>
          }
        />
        <Route
          path="/help"
          element={
            <ProtectedRoute allowed={false}>
              <Help />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verification-code" element={<VerificationCode />} />
        <Route path="/verification-sent" element={<VerificationSent />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/success" element={<ResetPasswordSuccess />} />
        <Route path="/test-bg" element={<TestBg />} />
      </Routes>
    </QueryClientProvider>
  );
}
export default App;
