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

### 3. Mostrar Notificaciones del Backend

```tsx
import { translateNotificationKey } from '../utils/notificationTranslator';

function Notification({ notification }) {
  // translateNotificationKey maneja ambos casos:
  // - Si el backend envía texto traducido → lo muestra directamente
  // - Si el backend envía claves (ej: "network.XXX") → las traduce
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

**Nota**: Si el backend siempre traduce los mensajes (gracias al header `x-lang`), las notificaciones ya vienen traducidas y solo necesitas mostrarlas directamente.

## 📁 Estructura de Archivos

```
src/i18n/
├── config.ts              # Configuración principal
├── index.ts             # Exportaciones
└── locales/             # ✅ Traducciones de la UI del frontend (SIEMPRE necesarias)
    ├── es/              
    │   ├── common.json      # Botones, labels, mensajes comunes
    │   ├── navigation.json  # Menús y navegación
    │   ├── forms.json       # Formularios
    │   └── ...
    └── en/              
        ├── common.json
        ├── navigation.json
        ├── forms.json
        └── ...

i18n/                     # ⚠️ Traducciones del backend (SOLO si el backend envía claves)
├── es/
│   └── ...
└── en/
    └── ...
```

**¿Qué archivos necesitas mantener?**
- ✅ **SIEMPRE**: `src/i18n/locales/` - Traducciones de la UI del frontend
- ⚠️ **SOLO SI**: `i18n/` - Traducciones del backend (solo si el backend envía claves en lugar de texto traducido)

## 🔄 Idioma del Usuario desde el Backend

Cuando el usuario hace login, el backend devuelve el campo `lang` con su idioma preferido ('es' o 'en'). El frontend automáticamente establece este idioma en la aplicación.

Esto también ocurre cuando:
- Se refresca el token
- Se obtiene el perfil del usuario

## 🌐 Header `x-lang`

El frontend envía automáticamente el header `x-lang` en todas las peticiones HTTP. El backend lo lee y traduce todos los mensajes (errores, notificaciones, validaciones) antes de enviarlos.

**Resultado**: El frontend recibe mensajes ya traducidos y no necesita mantener traducciones del backend (solo las de la UI).

## 🔑 Namespaces Disponibles

- `common` ✅ - Botones, labels, mensajes comunes (SIEMPRE necesario)
- `navigation` ✅ - Menús y navegación (SIEMPRE necesario)
- `forms` ✅ - Formularios (login, reset password, etc.) (SIEMPRE necesario)
- `notifications` ✅ - Notificaciones del frontend (SIEMPRE necesario)
- `dashboard` ✅ - Dashboard (SIEMPRE necesario)
- `network` ✅ - Red y equipos (SIEMPRE necesario)
- `backendNetwork` ⚠️ - Traducciones del backend (SOLO si el backend envía claves, no recomendado)

## ⚙️ Configuración

- **Idioma por defecto**: Español (`es`)
- **Detección automática**: Detecta idioma del navegador
- **Persistencia**: Guarda preferencia en `localStorage`
- **Header HTTP**: Añade automáticamente `x-lang` en todas las requests (el backend traduce los mensajes)
- **Idioma del Backend**: El backend devuelve el idioma preferido del usuario (`lang`) en las respuestas de autenticación, y el frontend lo establece automáticamente

## 💡 Recomendación

**Si el backend siempre traduce los mensajes** (gracias al header `x-lang`):
- ✅ Solo necesitas mantener las traducciones de la UI del frontend en `src/i18n/locales/`
- ✅ NO necesitas mantener las traducciones del backend en `i18n/`
- ✅ El frontend recibe mensajes ya traducidos y solo los muestra directamente

## 📖 Más Información

Consulta la **[documentación completa](./i18n-frontend-guide.md)** para:
- Ejemplos detallados
- Mejores prácticas
- Troubleshooting
- Casos de uso avanzados

