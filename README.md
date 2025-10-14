# 🚀 Kivoo Flow - Frontend

> **Plataforma de gestión de tarjetas recargables con diseño único y animaciones características**

[![React](https://img.shields.io/badge/React-18.2.0-blue.svg)](https://reactjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.8.3-blue.svg)](https://www.typescriptlang.org/)
[![Vite](https://img.shields.io/badge/Vite-6.3.2-purple.svg)](https://vitejs.dev/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind-4.1.3-teal.svg)](https://tailwindcss.com/)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

## 📋 Tabla de Contenidos

- [🎯 Descripción del Proyecto](#-descripción-del-proyecto)
- [✨ Características](#-características)
- [🏗️ Arquitectura](#️-arquitectura)
- [🚀 Instalación](#-instalación)
- [🎨 Componentes](#-componentes)
- [🔧 Scripts Disponibles](#-scripts-disponibles)
- [📁 Estructura del Proyecto](#-estructura-del-proyecto)
- [🎭 Animaciones Kivoo](#-animaciones-kivoo)
- [🤝 Contribución](#-contribución)
- [📄 Licencia](#-licencia)

## 🎯 Descripción del Proyecto

**Kivoo Flow** es el frontend de una aplicación intermediaria para gestionar tarjetas recargables usando la API de Payco. La aplicación permite a los usuarios registrarse, visualizar y gestionar sus tarjetas a través de una plataforma web moderna con un diseño único caracterizado por animaciones diagonales distintivas.

### 🌟 Tecnologías Principales

- **React 18** - Biblioteca de interfaz de usuario
- **TypeScript** - Tipado estático para JavaScript
- **Vite** - Herramienta de construcción rápida
- **Tailwind CSS** - Framework de CSS utility-first
- **React Router DOM** - Enrutamiento para aplicaciones React

## ✨ Características

- 🎨 **Diseño único** con animaciones diagonales características
- 🏗️ **Atomic Design** - Arquitectura de componentes escalable
- 📱 **Responsive** - Diseño adaptativo para todos los dispositivos
- 🔐 **Autenticación** - Sistema de login con WebAuthn (biometría)
- 💳 **Gestión de tarjetas** - Visualización y administración de tarjetas Payco
- 💰 **Transacciones crypto** - Integración USDT TRC20 para depósitos
- 🎯 **Sistema de referidos** - Códigos únicos con recompensas
- 🌐 **API Integration** - Conexión con backend NestJS

## 🏗️ Arquitectura

### Frontend Stack
```
React 18 + TypeScript + Vite
├── Tailwind CSS (Styling)
├── React Router DOM (Routing)
├── Axios (HTTP Client)
└── WebAuthn (Biometric Auth)
```

### Atomic Design Structure
```
src/
├── components/
│   ├── atoms/          # Componentes básicos
│   ├── molecules/      # Combinaciones simples
│   ├── organisms/      # Componentes complejos
│   └── templates/      # Layouts de página
├── pages/              # Páginas de la aplicación
├── services/           # Servicios de API
├── types/              # Definiciones TypeScript
├── hooks/              # Custom hooks
├── styles/             # Estilos centralizados
└── constants/          # Constantes de la aplicación
```

## 🚀 Instalación

### Prerrequisitos

- **Node.js** >= 20.0.0
- **npm** >= 10.0.0
- **Git** para clonar el repositorio

### Pasos de Instalación

1. **Clonar el repositorio**
   ```bash
   git clone https://github.com/jmcftic/kivooflow.git
   cd kivooflow
   ```

2. **Instalar dependencias**
   ```bash
   npm install
   ```

3. **Ejecutar en modo desarrollo**
   ```bash
   npm start
   ```

4. **Abrir en el navegador**
   ```
   http://localhost:5173
   ```

## 🎨 Componentes

### Atoms (Componentes Básicos)
- `Button` - Botón con variantes y animaciones diagonales
- `Input` - Campo de entrada con efectos glass
- `Select` - Selector con animaciones características
- `Logo` - Logo SVG de Kivoo
- `Loading` - Spinner de carga

### Molecules (Combinaciones)
- `EmailInput` - Input de email con icono
- `BiometricOption` - Opción de autenticación biométrica

### Organisms (Componentes Complejos)
- `LoginForm` - Formulario de inicio de sesión

### Pages
- `Home` - Página principal
- `Login` - Página de autenticación

## 🔧 Scripts Disponibles

```bash
# Desarrollo
npm start          # Ejecuta el servidor de desarrollo
npm run build      # Construye la aplicación para producción
npm run preview    # Previsualiza la build de producción
npm run lint       # Ejecuta el linter ESLint

# Git (Flujo de trabajo)
git checkout development    # Cambiar a rama de desarrollo
git checkout main          # Cambiar a rama principal
```

## 📁 Estructura del Proyecto

```
kivooflow/
├── public/                 # Archivos estáticos
│   ├── Bg-full@2x.png     # Imagen de fondo
│   └── vite.svg           # Favicon
├── src/
│   ├── components/        # Componentes React
│   │   ├── atoms/        # Componentes básicos
│   │   ├── molecules/    # Combinaciones
│   │   └── organisms/    # Componentes complejos
│   ├── pages/            # Páginas de la aplicación
│   ├── services/         # Servicios de API
│   ├── types/            # Tipos TypeScript
│   ├── hooks/            # Custom hooks
│   ├── styles/           # Estilos centralizados
│   ├── constants/        # Constantes
│   └── docs/             # Documentación
├── .gitignore            # Archivos ignorados por Git
├── package.json          # Dependencias y scripts
├── tailwind.config.js    # Configuración de Tailwind
├── tsconfig.json         # Configuración de TypeScript
└── vite.config.mts       # Configuración de Vite
```

## 🎭 Animaciones Kivoo

El proyecto incluye animaciones diagonales únicas basadas en medidas exactas:

### Características de la Animación
- **Clip-path personalizado** con geometría específica
- **Transiciones suaves** de 300ms
- **Efectos hover** que completan la esquina
- **Medidas exactas** basadas en diseño en Paint

### Uso de Variantes
```tsx
// Botones con animación diagonal
<Button variant="kivoo-primary">Continuar</Button>
<Button variant="yellow">Amarillo Kivoo</Button>

// Inputs con efecto glass y animación
<Input variant="kivoo-glass" placeholder="Email" />
```

Para más detalles, consulta la [Guía de Animaciones](src/docs/KIVOO_ANIMATIONS_GUIDE.md).

## 🤝 Contribución

### Flujo de Trabajo

1. **Crear rama de feature**
   ```bash
   git checkout development
   git checkout -b feature/nueva-funcionalidad
   ```

2. **Hacer cambios y commit**
   ```bash
   git add .
   git commit -m "feat: agregar nueva funcionalidad"
   ```

3. **Push y crear Pull Request**
   ```bash
   git push origin feature/nueva-funcionalidad
   ```

### Convenciones

- **Commits**: Usar [Conventional Commits](https://www.conventionalcommits.org/)
- **Branches**: `feature/`, `fix/`, `docs/`, `refactor/`
- **Código**: Seguir principios SOLID y Atomic Design

## 📄 Licencia

Este proyecto está bajo la Licencia MIT. Ver el archivo [LICENSE](LICENSE) para más detalles.

## 👥 Equipo

- **Frontend Developer** - [@jmcftic](https://github.com/jmcftic)

## 🔗 Enlaces Útiles

- [Documentación de React](https://reactjs.org/docs)
- [Guía de TypeScript](https://www.typescriptlang.org/docs)
- [Documentación de Vite](https://vitejs.dev/guide)
- [Tailwind CSS Docs](https://tailwindcss.com/docs)
- [Atomic Design Methodology](https://atomicdesign.bradfrost.com/)

---

<div align="center">
  <strong>Desarrollado con ❤️ para Kivoo</strong>
</div>