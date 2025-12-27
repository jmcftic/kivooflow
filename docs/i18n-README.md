# Internacionalización (i18n) - Resumen Rápido

## 📚 Documentación Completa

Para la documentación completa y detallada, consulta: **[i18n-frontend-guide.md](./i18n-frontend-guide.md)**

## 🚀 Inicio Rápido

### 1. Usar Traducciones en un Componente

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();
  
  return (
    <div>
      <button>{t('common:buttons.save')}</button>
      <p>{t('common:messages.loading')}</p>
    </div>
  );
}
```

### 2. Cambiar Idioma

```tsx
import { useLanguage } from '../hooks/useLanguage';

function LanguageSelector() {
  const { currentLanguage, changeLanguage } = useLanguage();
  
  return (
    <select 
      value={currentLanguage} 
      onChange={(e) => changeLanguage(e.target.value as 'es' | 'en')}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
  );
}
```

### 3. Traducir Notificaciones del Backend

```tsx
import { translateNotificationKey } from '../utils/notificationTranslator';

function Notification({ notification }) {
  const title = translateNotificationKey(notification.title);
  const body = translateNotificationKey(notification.body);
  
  return (
    <div>
      <h3>{title}</h3>
      <p>{body}</p>
    </div>
  );
}
```

## 📁 Estructura de Archivos

```
src/i18n/
├── config.ts              # Configuración principal
├── index.ts               # Exportaciones
└── locales/
    ├── es/               # Traducciones en español
    │   ├── common.json
    │   ├── navigation.json
    │   ├── forms.json
    │   └── ...
    └── en/               # Traducciones en inglés
        ├── common.json
        ├── navigation.json
        ├── forms.json
        └── ...
```

## 🔄 Idioma del Usuario desde el Backend

Cuando el usuario hace login, el backend devuelve el campo `lang` con su idioma preferido ('es' o 'en'). El frontend automáticamente establece este idioma en la aplicación.

Esto también ocurre cuando:
- Se refresca el token
- Se obtiene el perfil del usuario

## 🔑 Namespaces Disponibles

- `common` - Botones, labels, mensajes comunes
- `navigation` - Menús y navegación
- `forms` - Formularios (login, reset password, etc.)
- `notifications` - Notificaciones del frontend
- `dashboard` - Dashboard
- `network` - Red y equipos
- `backendNetwork` - Traducciones del backend (para notificaciones)

## ⚙️ Configuración

- **Idioma por defecto**: Español (`es`)
- **Detección automática**: Detecta idioma del navegador
- **Persistencia**: Guarda preferencia en `localStorage`
- **Header HTTP**: Añade automáticamente `x-lang` en todas las requests
- **Idioma del Backend**: El backend devuelve el idioma preferido del usuario (`lang`) en las respuestas de autenticación, y el frontend lo establece automáticamente

## 📖 Más Información

Consulta la **[documentación completa](./i18n-frontend-guide.md)** para:
- Ejemplos detallados
- Mejores prácticas
- Troubleshooting
- Casos de uso avanzados

