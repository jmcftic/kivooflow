import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  useNavigationType,
  useLocation,
} from "react-router-dom";
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { preloadLottieAnimation } from '@/utils/lottie-cache';
import { ClaimAllPollingProvider } from '@/contexts/ClaimAllPollingContext';
import { initializeLanguageFromStoredUser } from './i18n/config';
import Home from "./pages/Home";
import Home2 from "./pages/Home2";
import Home3 from "./pages/Home3";
import Example from "./pages/Example";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Claims from "./pages/Claims";
import ClaimDetail from "./pages/ClaimDetail";
import Network from "./pages/Network";
import NetworkTree from "./pages/NetworkTree";
import EnterpriseDetail from "./pages/EnterpriseDetail";
import CardAcquisition from "./pages/CardAcquisition";
import Commissions from "./pages/Commissions";
import Activity from "./pages/Activity";
import Help from "./pages/Help";
import ReporteClaims from "./pages/ReporteClaims";
import ManualLoads from "./pages/ManualLoads";
import ForgotPassword from "./pages/ForgotPassword";
import VerificationCode from "./pages/VerificationCode";
import VerificationSent from "./pages/VerificationSent";
import ResetPassword from "./pages/ResetPassword";
import ResetPasswordSuccess from "./pages/ResetPasswordSuccess";
import TestBg from "./pages/TestBg";
import Maintenance from "./pages/Maintenance";
import ProtectedRoute from "./components/atoms/ProtectedRoute";
import ErrorModal from "./components/atoms/ErrorModal";
import authService from "./services/auth";
import { apiService } from "./services/api";

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
  const [sessionExpired, setSessionExpired] = useState(false);
  
  // Verificar si el modo mantenimiento está activo
  // Se activa con la variable de entorno VITE_MAINTENANCE_MODE=true
  const isMaintenanceMode = import.meta.env.VITE_MAINTENANCE_MODE === 'true';

  // Precargar la animación Lottie al inicio de la app
  useEffect(() => {
    preloadLottieAnimation();
  }, []);

  // Inicializar idioma del usuario al cargar la app
  useEffect(() => {
    // Verificar si hay un usuario autenticado y establecer su idioma
    if (authService.isAuthenticated()) {
      initializeLanguageFromStoredUser();
    }
  }, []);

  useEffect(() => {
    if (action !== "POP") {
      window.scrollTo(0, 0);
    }
  }, [action, pathname]);

  useEffect(() => {
    const handleSessionExpired = () => {
      setSessionExpired(true);
    };

    window.addEventListener("session-expired", handleSessionExpired);
    return () => window.removeEventListener("session-expired", handleSessionExpired);
  }, []);

  const handleSessionModalClose = () => {
    setSessionExpired(false);
    window.location.href = "/login";
  };

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
      case "/claim/detail":
        title = "Kivoo Web - Detalle de Orden";
        metaDescription = "Detalle de orden de claims en Kivoo";
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
      case "/manual-loads":
        title = "Kivoo Web - Cargas Manuales";
        metaDescription = "Crear comisiones manuales MLM";
        break;
      case "/maintenance":
        title = "Kivoo Web - Mantenimiento";
        metaDescription = "Aplicación en mantenimiento";
        break;
    }
    
    // Verificar si es ruta de detalle de empresa
    if (pathname.match(/^\/enterprise-detail\/.+$/)) {
      title = "Kivoo Web - Detalle de Empresa";
      metaDescription = "Detalle de empresa en Kivoo";
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

  // Si el modo mantenimiento está activo y no estamos en la ruta de mantenimiento, cerrar sesión y redirigir
  useEffect(() => {
    if (isMaintenanceMode && pathname !== '/maintenance') {
      // Cerrar sesión si hay usuario logueado
      const isAuthenticated = authService.isAuthenticated();
      if (isAuthenticated) {
        // Limpiar sesión completamente
        authService.logout();
        // Limpiar también access_token por si acaso
        localStorage.removeItem('access_token');
        // Limpiar cualquier otro dato de sesión
        apiService.setToken(null);
      }
      // Redirigir a página de mantenimiento
      window.location.href = '/maintenance';
    }
  }, [isMaintenanceMode, pathname]);

  // Si el modo mantenimiento está activo, mostrar solo la página de mantenimiento
  if (isMaintenanceMode) {
    return (
      <QueryClientProvider client={queryClient}>
        <ClaimAllPollingProvider>
          <Routes>
            <Route path="/maintenance" element={<Maintenance />} />
            <Route path="*" element={<Maintenance />} />
          </Routes>
        </ClaimAllPollingProvider>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <ClaimAllPollingProvider>
        <ErrorModal
          isOpen={sessionExpired}
          onClose={handleSessionModalClose}
          title="Sesión expirada"
          message="Tu sesión caducó por inactividad. Inicia sesión nuevamente para continuar."
        />
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
            <ProtectedRoute>
              <Claims />
            </ProtectedRoute>
          }
        />
        <Route
          path="/claim/detail"
          element={
            <ProtectedRoute>
              <ClaimDetail />
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
          path="/network/tree"
          element={
            <ProtectedRoute>
              <NetworkTree />
            </ProtectedRoute>
          }
        />
        <Route
          path="/enterprise-detail/:enterpriseId/:model?"
          element={
            <ProtectedRoute>
              <EnterpriseDetail />
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
            <ProtectedRoute>
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
        <Route
          path="/reports/claims"
          element={
            <ProtectedRoute
              userCheck={(user) => {
                const allowedIds = ['49', '335', '57', '291', '53'];
                return user !== null && allowedIds.includes(String(user.id));
              }}
            >
              <ReporteClaims />
            </ProtectedRoute>
          }
        />
        <Route
          path="/manual-loads"
          element={
            <ProtectedRoute
              userCheck={(user) => {
                const allowedIds = ['49', '335', '57', '291', '53'];
                return user !== null && allowedIds.includes(String(user.id));
              }}
            >
              <ManualLoads />
            </ProtectedRoute>
          }
        />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/verification-code" element={<VerificationCode />} />
        <Route path="/verification-sent" element={<VerificationSent />} />
        <Route path="/reset-password" element={<ResetPassword />} />
        <Route path="/reset-password/success" element={<ResetPasswordSuccess />} />
        <Route path="/test-bg" element={<TestBg />} />
        <Route path="/maintenance" element={<Maintenance />} />
        </Routes>
      </ClaimAllPollingProvider>
    </QueryClientProvider>
  );
}
export default App;
