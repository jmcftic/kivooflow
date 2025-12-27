import React from 'react';
import { useTranslation } from 'react-i18next';
import i18n from '../../i18n/config';

/**
 * Componente de debug para verificar el estado del idioma
 * Puedes agregarlo temporalmente en cualquier página para verificar el idioma
 */
const LanguageDebug: React.FC = () => {
  const { t, i18n: i18nHook } = useTranslation();
  const storedUser = localStorage.getItem('user');
  let userLang = null;
  
  try {
    if (storedUser) {
      const user = JSON.parse(storedUser);
      userLang = user?.lang;
    }
  } catch (e) {
    // Ignore
  }

  return (
    <div style={{
      position: 'fixed',
      bottom: 10,
      right: 10,
      background: 'rgba(0,0,0,0.8)',
      color: 'white',
      padding: '10px',
      borderRadius: '5px',
      fontSize: '12px',
      zIndex: 9999,
      fontFamily: 'monospace'
    }}>
      <div><strong>🌐 Idioma Debug</strong></div>
      <div>i18n.language: <strong>{i18n.language}</strong></div>
      <div>i18nHook.language: <strong>{i18nHook.language}</strong></div>
      <div>localStorage i18nextLng: <strong>{localStorage.getItem('i18nextLng')}</strong></div>
      <div>user.lang: <strong>{userLang || 'null'}</strong></div>
      <div>Traducción test: <strong>{t('common:buttons.save')}</strong></div>
    </div>
  );
};

export default LanguageDebug;

