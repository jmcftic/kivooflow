import React, { useEffect, useState, useRef } from 'react';
import { useLanguage } from '../../hooks/useLanguage';
import authService from '../../services/auth';
import i18n from '../../i18n/config';
import flagIconsService from '../../utils/flagIcons';

interface LanguageSelectorProps {
  className?: string;
}

/**
 * Componente para seleccionar el idioma de la aplicación
 * El idioma por defecto se establece desde el usuario autenticado
 */
const LanguageSelector: React.FC<LanguageSelectorProps> = ({ className = '' }) => {
  const { currentLanguage, changeLanguage, isUpdating } = useLanguage();
  const [flagIconsLoaded, setFlagIconsLoaded] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Inicializar idioma desde el usuario autenticado al montar
  useEffect(() => {
    const initializeLanguage = () => {
      const user = authService.getCurrentUser();
      if (user?.lang && (user.lang === 'es' || user.lang === 'en')) {
        // Si el idioma del usuario es diferente al actual, actualizarlo
        if (i18n.language !== user.lang) {
          i18n.changeLanguage(user.lang);
          console.log(`[LanguageSelector] Idioma inicializado desde usuario: ${user.lang}`);
        }
      } else {
        // Si el usuario no tiene idioma guardado, usar el detectado por i18next
        const detectedLang = i18n.language || 'es';
        console.log(`[LanguageSelector] Usando idioma detectado: ${detectedLang}`);
      }
    };

    initializeLanguage();
  }, []);

  // Cargar iconos de banderas al montar
  useEffect(() => {
    const loadIcons = async () => {
      try {
        await flagIconsService.loadIcons();
        setFlagIconsLoaded(true);
      } catch (error) {
        console.error('[LanguageSelector] Error al cargar iconos:', error);
        // Continuar incluso si hay error
        setFlagIconsLoaded(true);
      }
    };

    loadIcons();
  }, []);

  // Cerrar dropdown al hacer clic fuera
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const languages = [
    { code: 'es' as const, label: 'SPA' },
    { code: 'en' as const, label: 'ENG' },
  ];

  const handleLanguageChange = async (lang: 'es' | 'en') => {
    if (lang === currentLanguage || isUpdating) {
      setIsOpen(false);
      return;
    }

    try {
      await changeLanguage(lang);
      setIsOpen(false);
    } catch (error) {
      console.error('Error al cambiar idioma:', error);
    }
  };

  const currentLanguageData = languages.find(lang => lang.code === currentLanguage);
  const currentFlagUrl = flagIconsService.getFlagUrl(currentLanguage);

  const FlagIcon: React.FC<{ flagUrl: string; alt: string }> = ({ flagUrl, alt }) => (
    <div 
      className="rounded-full overflow-hidden flex-shrink-0"
      style={{ 
        width: '24px', 
        height: '24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'transparent'
      }}
    >
      <img
        src={flagUrl}
        alt={alt}
        style={{ 
          width: '24px', 
          height: '24px',
          objectFit: 'cover',
          display: 'block'
        }}
      />
    </div>
  );

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Botón del selector */}
      <button
        type="button"
        onClick={() => !isUpdating && setIsOpen(!isOpen)}
        disabled={isUpdating}
        className="bg-[#212020] text-white border border-white rounded-md pr-3 py-2 pl-3 focus:outline-none focus:ring-2 focus:ring-[#FFF100] disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 relative"
        style={{ minWidth: '80px', paddingLeft: flagIconsLoaded && currentFlagUrl ? '44px' : '12px' }}
        aria-label="Select language"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
      >
        {flagIconsLoaded && currentFlagUrl && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <FlagIcon 
              flagUrl={currentFlagUrl} 
              alt={`${currentLanguage === 'es' ? 'Spanish' : 'English'} flag`} 
            />
          </div>
        )}
        <span>{currentLanguageData?.label}</span>
        <svg
          className={`w-4 h-4 transition-transform ml-auto ${isOpen ? 'rotate-180' : ''}`}
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {/* Dropdown con opciones */}
      {isOpen && (
        <div className="absolute top-full left-0 mt-1 bg-[#212020] border border-white rounded-md shadow-lg z-50 min-w-full">
          {languages.map((lang) => {
            const flagUrl = flagIconsService.getFlagUrl(lang.code);
            const isSelected = lang.code === currentLanguage;
            
            return (
              <button
                key={lang.code}
                type="button"
                onClick={() => handleLanguageChange(lang.code)}
                className={`w-full px-3 py-2 flex items-center gap-2 text-left hover:bg-gray-700 transition-colors ${
                  isSelected ? 'bg-gray-800' : ''
                }`}
                style={{ minWidth: '80px' }}
              >
                {flagIconsLoaded && flagUrl && (
                  <FlagIcon 
                    flagUrl={flagUrl} 
                    alt={`${lang.code === 'es' ? 'Spanish' : 'English'} flag`} 
                  />
                )}
                <span className="text-white">{lang.label}</span>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LanguageSelector;


