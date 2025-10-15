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
        <Route path="/dashboard" element={<Dashboard />} />
      </Routes>
    </QueryClientProvider>
  );
}
export default App;
