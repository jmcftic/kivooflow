# Guía de Internacionalización (i18n) para Frontend React

## Índice
1. [Introducción](#introducción)
2. [Instalación](#instalación)
3. [Configuración](#configuración)
4. [Estructura de Archivos](#estructura-de-archivos)
5. [Uso Básico](#uso-básico)
6. [Namespaces](#namespaces)
7. [Integración con Backend](#integración-con-backend)
8. [Manejo de Notificaciones](#manejo-de-notificaciones)
9. [Cambio de Idioma](#cambio-de-idioma)
10. [Mejores Prácticas](#mejores-prácticas)
11. [Ejemplos de Código](#ejemplos-de-código)

---

## Introducción

Esta guía documenta la implementación de internacionalización (i18n) en el frontend React usando `react-i18next`. El sistema está diseñado para:

- Traducir todos los labels y mensajes del frontend
- Integrarse con el sistema i18n del backend NestJS
- Manejar correctamente las notificaciones que vienen del backend
- Permitir cambiar el idioma dinámicamente

### Arquitectura

```
Frontend (React)                    Backend (NestJS)
┌─────────────────┐                ┌─────────────────┐
│ react-i18next   │                │ nestjs-i18n     │
│                 │                │                 │
│ Traducciones    │                │ Traducciones    │
│ INDEPENDIENTES  │                │ del Backend     │
│                 │                │                 │
│ Header: x-lang  │───────────────>│ Lee x-lang      │
│                 │                │                 │
│<──────────────  │                │ Respuesta auth  │
│  lang: "es"     │                │ incluye lang    │
└─────────────────┘                └─────────────────┘
```

**IMPORTANTE**: Las traducciones del frontend son completamente independientes de las del backend. Cada uno mantiene sus propios archivos de traducción.

**Flujo de Idioma**:
1. El backend devuelve el idioma preferido del usuario (`lang`) en las respuestas de autenticación
2. El frontend establece automáticamente este idioma al recibirlo
3. El frontend envía el idioma actual en el header `x-lang` para que el backend responda en el idioma correcto

**¿Necesitas mantener traducciones del backend en el frontend?**
- **NO**, si el backend siempre traduce los mensajes antes de enviarlos (gracias al header `x-lang`). En este caso, solo necesitas las traducciones de la UI del frontend.
- **SÍ**, solo si el backend envía claves de traducción (ej: `"network.NOTIFICATION_XXX"`) en lugar de texto traducido. En este caso, necesitas mantener las traducciones del backend en la carpeta `i18n/` como fallback.

---

## Instalación

Las dependencias ya están instaladas. Si necesitas instalarlas manualmente:

```bash
npm install i18next react-i18next i18next-browser-languagedetector
```

### Dependencias Instaladas

- **i18next**: Biblioteca core de internacionalización
- **react-i18next**: Integración de i18next con React
- **i18next-browser-languagedetector**: Detecta automáticamente el idioma del navegador

---

## Configuración

La configuración principal se encuentra en `src/i18n/config.ts`.

### Características de la Configuración

1. **Detección Automática de Idioma**:
   - Primero busca en `localStorage` (si el usuario ya seleccionó un idioma)
   - Si el usuario está autenticado, el backend devuelve su idioma preferido (`lang`) en la respuesta de login
   - Luego detecta el idioma del navegador
   - Idioma por defecto: `es` (español)
   
   **IMPORTANTE**: Cuando el usuario hace login, el backend devuelve el campo `lang` con su idioma preferido ('es' o 'en'), y el frontend automáticamente establece ese idioma en la aplicación.

2. **Múltiples Namespaces**:
   - `common`: Traducciones comunes (botones, labels, mensajes) ✅ **Siempre necesario**
   - `navigation`: Menús y navegación ✅ **Siempre necesario**
   - `forms`: Labels de formularios ✅ **Siempre necesario**
   - `notifications`: Traducciones de notificaciones del frontend ✅ **Siempre necesario**
   - `dashboard`: Traducciones del dashboard ✅ **Siempre necesario**
   - `network`: Traducciones relacionadas con la red ✅ **Siempre necesario**
   - `backendNetwork`: Traducciones del backend ⚠️ **Solo si el backend envía claves** (no recomendado)

3. **Interpolación**:
   - Soporte para variables dinámicas: `{variable}`
   - Escapado automático (desactivado porque React ya lo hace)

---

## Estructura de Archivos

```
src/
├── i18n/
│   ├── config.ts                    # Configuración principal de i18next
│   ├── index.ts                     # Exportaciones principales
│   └── locales/
│       ├── es/                      # Traducciones de la UI del frontend (SIEMPRE necesarias)
│       │   ├── common.json          # Botones, labels, mensajes comunes
│       │   ├── navigation.json      # Menús y navegación
│       │   ├── forms.json           # Formularios
│       │   ├── notifications.json   # Notificaciones del frontend
│       │   ├── dashboard.json       # Dashboard
│       │   └── network.json         # Red y equipos
│       └── en/                      # Traducciones en inglés
│           ├── common.json
│           ├── navigation.json
│           ├── forms.json
│           ├── notifications.json
│           ├── dashboard.json
│           └── network.json
│
i18n/                                 # Traducciones del backend (SOLO si el backend envía claves)
├── es/                               # ⚠️ Solo necesarias si el backend envía claves de traducción
│   ├── network.json
│   ├── auth.json
│   └── ...
└── en/
    ├── network.json
    ├── auth.json
    └── ...
```

**¿Qué archivos necesitas mantener?**
- ✅ **SIEMPRE**: `src/i18n/locales/` - Traducciones de la UI del frontend (botones, labels, placeholders, etc.)
- ⚠️ **SOLO SI**: `i18n/` - Traducciones del backend (solo si el backend envía claves en lugar de texto traducido)

---

## Uso Básico

### 1. Hook `useTranslation`

El hook principal para usar traducciones en componentes React:

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation();

  return (
    <div>
      <h1>{t('common:buttons.save')}</h1>
      <p>{t('common:messages.loading')}</p>
    </div>
  );
}
```

### 2. Sintaxis de Claves

Formato: `namespace:ruta.al.clave`

```tsx
// Namespace "common", objeto "buttons", clave "save"
t('common:buttons.save')

// Namespace "forms", objeto "login", clave "title"
t('forms:login.title')

// Namespace por defecto (common) - se puede omitir
t('buttons.save') // Equivalente a t('common:buttons.save')
```

### 3. Interpolación de Variables

```tsx
// En el archivo JSON:
{
  "messages": {
    "welcome": "Bienvenido, {{name}}!"
  }
}

// En el componente:
const { t } = useTranslation();
const userName = "Juan";

<h1>{t('messages.welcome', { name: userName })}</h1>
// Resultado: "Bienvenido, Juan!"
```

### 4. Pluralización

```tsx
// En el archivo JSON:
{
  "items": {
    "one": "{{count}} elemento",
    "other": "{{count}} elementos"
  }
}

// En el componente:
const { t } = useTranslation();
const count = 5;

<p>{t('items', { count })}</p>
// Resultado: "5 elementos"
```

---

## Namespaces

### ¿Qué es un Namespace?

Un namespace es una agrupación lógica de traducciones. Permite organizar las traducciones por dominio (formularios, navegación, etc.).

### Namespaces Disponibles

1. **common**: Botones, labels generales, mensajes comunes, validaciones
2. **navigation**: Menús, breadcrumbs, títulos de página
3. **forms**: Labels y mensajes de formularios (login, reset password, etc.)
4. **notifications**: Traducciones de notificaciones del frontend
5. **dashboard**: Traducciones específicas del dashboard
6. **network**: Traducciones relacionadas con la red
7. **backendNetwork**: Traducciones del backend (para notificaciones que vienen con claves)

### Usar un Namespace Específico

```tsx
import { useTranslation } from 'react-i18next';

function LoginForm() {
  // Cargar namespace "forms" por defecto
  const { t } = useTranslation('forms');

  return (
    <form>
      <h1>{t('login.title')}</h1>
      <input placeholder={t('login.emailPlaceholder')} />
      <button>{t('login.continue')}</button>
    </form>
  );
}
```

### Cargar Múltiples Namespaces

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { t } = useTranslation(['common', 'forms']);

  return (
    <div>
      <button>{t('common:buttons.save')}</button>
      <p>{t('forms:login.title')}</p>
    </div>
  );
}
```

---

## Integración con Backend

### Header `x-lang`

El servicio API (`src/services/api.ts`) automáticamente añade el header `x-lang` en todas las requests HTTP, usando el idioma actual del frontend.

```typescript
// El backend usa este header para responder en el idioma correcto
headers['x-lang'] = currentLanguage; // 'es' o 'en'
```

**Propósito del header `x-lang`**:
- Indica al backend en qué idioma debe responder todos sus mensajes (errores, validaciones, notificaciones, etc.)
- Gracias a este header, el backend traduce automáticamente todos los mensajes antes de enviarlos
- **Resultado**: El frontend recibe mensajes ya traducidos y solo necesita mostrar el texto directamente, sin necesidad de mantener traducciones del backend

### Idioma del Usuario desde el Backend

**IMPORTANTE**: El backend devuelve el idioma preferido del usuario en las respuestas de autenticación:

- **Login**: La respuesta incluye el campo `lang: "es" | "en"`
- **Refresh Token**: También puede incluir el campo `lang`
- **Perfil de Usuario**: El perfil del usuario puede incluir el campo `lang`

El frontend automáticamente establece este idioma cuando:
1. El usuario hace login
2. Se refresca el token
3. Se obtiene el perfil del usuario

### Flujo de Comunicación

1. **Usuario hace login** → Backend devuelve `lang: "es" | "en"` → Frontend establece idioma
2. **Frontend** detecta/establece idioma → guarda en `localStorage`
3. **Frontend** hace request → incluye header `x-lang: "es"` (o `"en"`)
4. **Backend** lee `x-lang` → traduce todos los mensajes (errores, notificaciones, validaciones) → responde con texto ya traducido
5. **Frontend** muestra la respuesta directamente (sin necesidad de traducir nada)

**Ejemplo práctico**:
```typescript
// Frontend envía:
GET /api/users/123
Headers: { 'x-lang': 'es' }

// Backend responde (ya traducido):
{
  "error": "Usuario no encontrado"  // ← Ya en español, gracias a x-lang
}

// Frontend solo muestra el texto:
<div>{error}</div>  // "Usuario no encontrado"
```

### Sincronización Bidireccional

- **Backend → Frontend**: El backend envía el idioma preferido del usuario en las respuestas de auth
- **Frontend → Backend**: El frontend envía el idioma actual en el header `x-lang` para que el backend responda en el idioma correcto

---

## Manejo de Notificaciones

Las notificaciones del backend pueden venir de dos formas:

### Opción A: Backend traduce las notificaciones (Recomendada) ✅

**Si el backend siempre traduce los mensajes** (gracias al header `x-lang`), entonces:

- ✅ El backend traduce las notificaciones antes de guardarlas/enviarlas
- ✅ El frontend recibe texto ya traducido
- ✅ El frontend solo muestra el texto directamente
- ✅ **NO necesitas mantener traducciones del backend en el frontend**

```typescript
// Backend recibe x-lang: 'es' y traduce:
// Backend guarda/envía: "Se solicitaron 5 comisiones exitosamente"
// Frontend muestra: "Se solicitaron 5 comisiones exitosamente"
// ✅ No necesitas traducciones del backend en el frontend
```

**En este caso, solo necesitas las traducciones de la UI del frontend** (`src/i18n/locales/`).

### Opción B: Backend envía claves de traducción (No recomendada)

**Solo si el backend envía claves** (ej: `"network.NOTIFICATION_CLAIM_ALL_COMPLETED_TITLE"`), entonces:

- ⚠️ El frontend necesita traducir las claves usando el namespace `backendNetwork`
- ⚠️ **SÍ necesitas mantener las traducciones del backend en `i18n/`**
- ⚠️ Debes sincronizar manualmente las traducciones cuando el backend agregue nuevas claves

**Nota**: Esta opción no es recomendada porque requiere mantener traducciones duplicadas y sincronización manual.

```tsx
import { useTranslation } from 'react-i18next';

function NotificationComponent({ notification }) {
  const { t } = useTranslation('backendNetwork');

  // Si title es una clave de traducción
  const title = notification.title.includes('.') 
    ? t(notification.title.replace('network.', ''))
    : notification.title;

  return (
    <div>
      <h3>{title}</h3>
      <p>{notification.body}</p>
    </div>
  );
}
```

### Helper para Traducir Notificaciones

```tsx
// utils/notificationTranslator.ts
import { useTranslation } from 'react-i18next';

export function translateNotificationKey(key: string): string {
  // Si la clave contiene un punto, intentar traducirla
  if (key.includes('.')) {
    const { t } = useTranslation('backendNetwork');
    const cleanKey = key.replace(/^network\./, ''); // Remover prefijo "network."
    return t(cleanKey);
  }
  return key; // Ya es un texto traducido
}
```

---

## Cambio de Idioma

### Cambiar Idioma Programáticamente

```tsx
import { useTranslation } from 'react-i18next';
import { changeLanguage } from 'i18next';

function LanguageSwitcher() {
  const { i18n } = useTranslation();

  const handleChangeLanguage = (lang: 'es' | 'en') => {
    changeLanguage(lang);
    // El idioma se guarda automáticamente en localStorage
    // El header x-lang se actualiza automáticamente en las siguientes requests
  };

  return (
    <select 
      value={i18n.language} 
      onChange={(e) => handleChangeLanguage(e.target.value as 'es' | 'en')}
    >
      <option value="es">Español</option>
      <option value="en">English</option>
    </select>
  );
}
```

### Obtener Idioma Actual

```tsx
import { useTranslation } from 'react-i18next';

function MyComponent() {
  const { i18n } = useTranslation();
  
  console.log(i18n.language); // 'es' o 'en'
  console.log(i18n.languages); // ['es', 'en']
  
  return <div>Current language: {i18n.language}</div>;
}
```

---

## Mejores Prácticas

### 1. Organización de Traducciones

- ✅ Agrupa traducciones relacionadas en el mismo namespace
- ✅ Usa nombres descriptivos para las claves
- ✅ Mantén la misma estructura en todos los idiomas
- ❌ Evita claves duplicadas entre namespaces

### 2. Nomenclatura de Claves

```json
// ✅ Bien estructurado
{
  "forms": {
    "login": {
      "title": "Login",
      "emailPlaceholder": "Email",
      "passwordPlaceholder": "Password"
    }
  }
}

// ❌ Evitar
{
  "title": "Login",
  "email": "Email",
  "pass": "Password"
}
```

### 3. Interpolación vs. Concatenación

```tsx
// ✅ Usar interpolación
t('messages.welcome', { name: userName })

// ❌ Evitar concatenación
t('messages.welcome') + ' ' + userName
```

### 4. Manejo de Traducciones Faltantes

i18next automáticamente muestra la clave si no encuentra la traducción. Para debugging:

```typescript
// En config.ts (solo en desarrollo)
i18n.init({
  // ... otras opciones
  debug: process.env.NODE_ENV === 'development',
  missingKeyHandler: (lng, ns, key) => {
    console.warn(`Missing translation: ${lng}.${ns}.${key}`);
  },
});
```

### 5. Performance

- ✅ Cargar solo los namespaces necesarios
- ✅ Usar lazy loading para namespaces grandes (si es necesario)
- ✅ Evitar cambiar de idioma frecuentemente

---

## Ejemplos de Código

### Ejemplo 1: Componente de Login

```tsx
import { useTranslation } from 'react-i18next';

function LoginForm() {
  const { t } = useTranslation('forms');
  const [email, setEmail] = useState('');

  return (
    <form>
      <h1>{t('login.title')}</h1>
      <input
        type="email"
        placeholder={t('login.emailPlaceholder')}
        value={email}
        onChange={(e) => setEmail(e.target.value)}
      />
      <button type="submit">
        {t('login.continue')}
      </button>
      <a href="/forgot-password">
        {t('login.forgotPassword')}
      </a>
    </form>
  );
}
```

### Ejemplo 2: Componente con Múltiples Namespaces

```tsx
import { useTranslation } from 'react-i18next';

function Dashboard() {
  const { t } = useTranslation(['dashboard', 'common', 'navigation']);

  return (
    <div>
      <h1>{t('navigation:titles.dashboard')}</h1>
      <div>
        <h2>{t('dashboard:metrics.totalCommissions')}</h2>
        <button>{t('common:buttons.refresh')}</button>
      </div>
    </div>
  );
}
```

### Ejemplo 3: Componente con Variables Dinámicas

```tsx
import { useTranslation } from 'react-i18next';

function WelcomeMessage({ userName, itemCount }) {
  const { t } = useTranslation('common');

  return (
    <div>
      <h1>{t('messages.welcome', { name: userName })}</h1>
      <p>{t('messages.itemCount', { count: itemCount })}</p>
    </div>
  );
}
```

### Ejemplo 4: Selector de Idioma

```tsx
import { useTranslation } from 'react-i18next';
import { changeLanguage } from 'i18next';

function LanguageSelector() {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'es', name: 'Español' },
    { code: 'en', name: 'English' },
  ];

  return (
    <select
      value={i18n.language}
      onChange={(e) => changeLanguage(e.target.value)}
    >
      {languages.map((lang) => (
        <option key={lang.code} value={lang.code}>
          {lang.name}
        </option>
      ))}
    </select>
  );
}
```

### Ejemplo 5: Traducir Notificaciones del Backend

```tsx
import { useTranslation } from 'react-i18next';

function NotificationItem({ notification }) {
  const { t } = useTranslation('backendNetwork');

  // Función helper para traducir claves del backend
  const translateKey = (key: string): string => {
    if (!key || typeof key !== 'string') return key;
    
    // Si es una clave de traducción (contiene punto)
    if (key.includes('.')) {
      const cleanKey = key.replace(/^(network|auth|cards)\./, '');
      try {
        return t(cleanKey);
      } catch {
        return key; // Si falla, devolver la clave original
      }
    }
    
    return key; // Ya es texto traducido
  };

  return (
    <div className="notification">
      <h3>{translateKey(notification.title)}</h3>
      <p>{translateKey(notification.body)}</p>
    </div>
  );
}
```

### Ejemplo 6: Validación de Formularios con Traducciones

```tsx
import { useTranslation } from 'react-i18next';

function MyForm() {
  const { t } = useTranslation(['forms', 'common']);
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  const validateEmail = (email: string) => {
    if (!email) {
      setError(t('common:validation.required'));
      return false;
    }
    if (!email.includes('@')) {
      setError(t('common:validation.email'));
      return false;
    }
    setError('');
    return true;
  };

  return (
    <form>
      <input
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        onBlur={() => validateEmail(email)}
        placeholder={t('forms:login.emailPlaceholder')}
      />
      {error && <span className="error">{error}</span>}
    </form>
  );
}
```

---

## Resumen de Archivos Importantes

| Archivo | Descripción |
|---------|-------------|
| `src/i18n/config.ts` | Configuración principal de i18next |
| `src/i18n/index.ts` | Exportaciones (useTranslation, etc.) |
| `src/i18n/locales/{lang}/*.json` | Archivos de traducción del frontend |
| `i18n/{lang}/*.json` | Traducciones del backend (copias para referencia) |
| `src/services/api.ts` | Añade header `x-lang` automáticamente |
| `src/services/auth.ts` | Establece idioma del usuario cuando viene del backend |
| `src/types/auth.ts` | Tipos incluyen campo `lang` en LoginResponse y User |
| `src/index.tsx` | Inicializa i18n al cargar la app |

---

## Troubleshooting

### Problema: Las traducciones no se cargan

**Solución**: Verifica que `src/i18n/config.ts` esté importado en `src/index.tsx`:

```tsx
import "./i18n/config";
```

### Problema: El backend no responde en el idioma correcto

**Solución**: Verifica que el header `x-lang` se esté enviando. Revisa `src/services/api.ts`:

```typescript
headers['x-lang'] = currentLanguage;
```

### Problema: Claves de traducción no encontradas

**Solución**: Verifica que:
1. El namespace esté cargado: `useTranslation('namespace')`
2. La estructura del JSON coincida con la clave usada
3. El archivo JSON tenga la sintaxis correcta

### Problema: El idioma no se persiste

**Solución**: Verifica que `localStorage` esté habilitado y que la configuración tenga:

```typescript
detection: {
  caches: ['localStorage'],
}
```

---

## Recursos Adicionales

- [Documentación oficial de react-i18next](https://react.i18next.com/)
- [Documentación oficial de i18next](https://www.i18next.com/)
- [Guía de interpolación](https://www.i18next.com/translation-function/interpolation)
- [Guía de pluralización](https://www.i18next.com/translation-function/plurals)

---

## Notas Finales

1. **Traducciones del Frontend (UI)**: **SIEMPRE necesarias**
   - Ubicación: `src/i18n/locales/`
   - Contenido: Botones, labels, placeholders, mensajes de la interfaz
   - Debes actualizarlas cada vez que agregues/modifiques elementos de la UI

2. **Traducciones del Backend**: **SOLO si el backend envía claves**
   - Ubicación: `i18n/`
   - **NO necesarias** si el backend siempre traduce los mensajes (gracias al header `x-lang`)
   - **SÍ necesarias** solo si el backend envía claves de traducción (ej: `"network.XXX"`)

3. **Header `x-lang`**: 
   - El frontend envía este header en todas las peticiones
   - El backend lo lee y traduce automáticamente todos los mensajes antes de enviarlos
   - **Resultado**: El frontend recibe texto ya traducido y no necesita mantener traducciones del backend

4. **Idioma del Usuario**: 
   - El backend devuelve el idioma preferido del usuario (`lang`) en las respuestas de autenticación
   - El frontend automáticamente establece este idioma al hacer login, refrescar token, o obtener el perfil del usuario

5. **Recomendación**:
   - ✅ Configura el backend para que siempre traduzca los mensajes usando el header `x-lang`
   - ✅ Mantén solo las traducciones de la UI del frontend en `src/i18n/locales/`
   - ✅ Elimina o ignora la carpeta `i18n/` si el backend siempre traduce

6. **Extensibilidad**: Para añadir nuevos idiomas:
   - Crea la carpeta `src/i18n/locales/{nuevo-idioma}/`
   - Copia los archivos JSON de `es/` y tradúcelos
   - Añade el nuevo idioma en la configuración de i18next
   - Actualiza el backend para incluir el nuevo idioma en las respuestas de `lang` y en el manejo del header `x-lang`

---

**Última actualización**: Enero 2025

