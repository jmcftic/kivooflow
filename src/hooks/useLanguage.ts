import { useTranslation } from 'react-i18next';
import { changeLanguage as changeI18nLanguage } from 'i18next';
import authService from '../services/auth';
import { useState } from 'react';

/**
 * Hook personalizado para manejar el cambio de idioma
 */
export function useLanguage() {
  const { i18n } = useTranslation();
  const [isUpdating, setIsUpdating] = useState(false);

  /**
   * Cambia el idioma de la aplicación y actualiza el backend
   * @param lang - Idioma a cambiar ('es' | 'en')
   */
  const changeLanguage = async (lang: 'es' | 'en') => {
    try {
      setIsUpdating(true);
      
      // 1. Actualizar i18n localmente (cambia la UI inmediatamente)
      await changeI18nLanguage(lang);
      
      // 2. Actualizar en el backend para persistir la preferencia
      try {
        await authService.updateProfile({ lang });
        // console.log(`[Language] ✅ Idioma actualizado en backend: ${lang}`);
      } catch (error) {
        console.error('[Language] ⚠️ Error al actualizar idioma en backend:', error);
        // No lanzar error, el idioma ya cambió localmente
        // El usuario puede seguir usando la app en el nuevo idioma
      }
      
      // El idioma se guarda automáticamente en localStorage por i18next
      // El header x-lang se actualiza automáticamente en las siguientes requests
    } catch (error) {
      console.error('[Language] Error al cambiar idioma:', error);
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  /**
   * Obtiene el idioma actual
   */
  const currentLanguage = i18n.language as 'es' | 'en';

  /**
   * Alterna entre español e inglés
   */
  const toggleLanguage = () => {
    const newLang = currentLanguage === 'es' ? 'en' : 'es';
    changeLanguage(newLang);
  };

  return {
    currentLanguage,
    changeLanguage,
    toggleLanguage,
    isSpanish: currentLanguage === 'es',
    isEnglish: currentLanguage === 'en',
    isUpdating,
  };
}

