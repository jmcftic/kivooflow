// Exportar configuración de i18n
export { default as i18n } from './config';
export { default } from './config';

// Exportar hook useTranslation de react-i18next
export { useTranslation, Trans, Translation } from 'react-i18next';

// Exportar utilidades
export { changeLanguage } from 'i18next';

// Tipo para los namespaces disponibles
export type TranslationNamespace = 
  | 'common'
  | 'navigation'
  | 'forms'
  | 'notifications'
  | 'dashboard'
  | 'network'
  | 'claims'
  | 'commissions'
  | 'backendNetwork';

