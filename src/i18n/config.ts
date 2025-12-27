import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Importar traducciones
import esCommon from './locales/es/common.json';
import enCommon from './locales/en/common.json';
import esNavigation from './locales/es/navigation.json';
import enNavigation from './locales/en/navigation.json';
import esForms from './locales/es/forms.json';
import enForms from './locales/en/forms.json';
import esNotifications from './locales/es/notifications.json';
import enNotifications from './locales/en/notifications.json';
import esDashboard from './locales/es/dashboard.json';
import enDashboard from './locales/en/dashboard.json';
import esNetwork from './locales/es/network.json';
import enNetwork from './locales/en/network.json';
import esClaims from './locales/es/claims.json';
import enClaims from './locales/en/claims.json';
import esCommissions from './locales/es/commissions.json';
import enCommissions from './locales/en/commissions.json';

// Importar traducciones del backend (para notificaciones)
// Estas son las traducciones del backend que el frontend puede usar
import esBackendNetwork from '../../i18n/es/network.json';
import enBackendNetwork from '../../i18n/en/network.json';

const resources = {
  es: {
    common: esCommon,
    navigation: esNavigation,
    forms: esForms,
    notifications: esNotifications,
    dashboard: esDashboard,
    network: esNetwork,
    claims: esClaims,
    commissions: esCommissions,
    // Namespace para traducciones del backend
    backendNetwork: esBackendNetwork,
  },
  en: {
    common: enCommon,
    navigation: enNavigation,
    forms: enForms,
    notifications: enNotifications,
    dashboard: enDashboard,
    network: enNetwork,
    claims: enClaims,
    commissions: enCommissions,
    // Namespace para traducciones del backend
    backendNetwork: enBackendNetwork,
  },
};

i18n
  .use(LanguageDetector) // Detecta el idioma del navegador
  .use(initReactI18next) // Pasa la instancia de i18n a react-i18next
  .init({
    resources,
    fallbackLng: 'es', // Idioma por defecto
    defaultNS: 'common', // Namespace por defecto
    
    // Detección de idioma
    detection: {
      // Orden de detección de idioma:
      // 1. localStorage (si el usuario ya seleccionó un idioma)
      // 2. Idioma del navegador
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'i18nextLng',
      caches: ['localStorage'],
    },

    interpolation: {
      escapeValue: false, // React ya escapa por defecto
    },

    // Configuración de React
    react: {
      useSuspense: false, // No usar Suspense para evitar problemas de hidratación
    },
  });

// Función para inicializar el idioma desde el usuario guardado
export function initializeLanguageFromStoredUser() {
  try {
    // Verificar si hay un usuario guardado en localStorage
    const userStr = localStorage.getItem('user');
    if (userStr) {
      const user = JSON.parse(userStr);
      // Si el usuario tiene un idioma preferido, establecerlo
      // Priorizar el idioma del usuario sobre el guardado en i18nextLng
      if (user?.lang && (user.lang === 'es' || user.lang === 'en')) {
        const currentLang = i18n.language;
        if (currentLang !== user.lang) {
          i18n.changeLanguage(user.lang);
          console.log(`[i18n] Idioma inicializado desde usuario guardado: ${user.lang} (antes era: ${currentLang})`);
        }
      }
    }
  } catch (error) {
    console.warn('[i18n] Error al inicializar idioma desde usuario guardado:', error);
  }
}

// Inicializar idioma desde usuario guardado al cargar el módulo
if (typeof window !== 'undefined') {
  // Ejecutar después de que i18n esté inicializado
  // Usar un pequeño delay para asegurar que i18n esté completamente inicializado
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(initializeLanguageFromStoredUser, 100);
    });
  } else {
    setTimeout(initializeLanguageFromStoredUser, 100);
  }
}

export default i18n;

