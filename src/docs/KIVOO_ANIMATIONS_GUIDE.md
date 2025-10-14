# 🎨 Guía de Animaciones Kivoo

## 📋 Resumen
Esta guía explica cómo usar las animaciones diagonales características de Kivoo en los componentes, manteniendo el principio de Atomic Design sin sobrecargar las props.

## 🎯 Estrategia Implementada

### **Variantes Predefinidas**
En lugar de agregar props adicionales, creamos variantes específicas que incluyen la animación:

#### **Button Component**
```tsx
// ✅ Con animación diagonal
<Button variant="kivoo-primary">Continuar</Button>
<Button variant="kivoo-secondary">Cancelar</Button>
<Button variant="yellow">Amarillo Kivoo</Button>

// ❌ Sin animación (botones estándar)
<Button variant="primary">Estándar</Button>
<Button variant="outline">Outline</Button>
```

#### **Input Component**
```tsx
// ✅ Con animación diagonal
<Input variant="kivoo-glass" placeholder="Email" />

// ❌ Sin animación
<Input variant="default" placeholder="Estándar" />
```

#### **Select Component**
```tsx
// ✅ Con animación diagonal
<Select variant="kivoo-glass" options={options} />

// ❌ Sin animación
<Select variant="default" options={options} />
```

## 🏗️ Arquitectura

### **1. Estilos Centralizados**
```typescript
// src/styles/kivoo-animations.ts
export const KIVOO_DIAGONAL_CLASSES = {
  complete: "w-full rounded-tl-xl rounded-tr-xl rounded-bl-xl [clip-path:polygon(0_0,100%_0,100%_62%,calc(100%_-_5.4%)_100%,0_100%)] hover:[clip-path:polygon(0_0,100%_0,100%_100%,100%_100%,0_100%)] hover:rounded-br-xl transition-all duration-300 ease-in-out"
};
```

### **2. Hook Personalizado**
```typescript
// src/hooks/useKivooAnimation.ts
export const useKivooAnimation = (enabled: boolean = true) => {
  // Retorna clases de animación condicionalmente
};
```

### **3. Colores de Marca**
```typescript
export const KIVOO_COLORS = {
  yellow: { primary: "#FFF100", hover: "#E6D900" },
  blue: { primary: "#3B82F6", hover: "#2563EB" },
  glass: { background: "bg-white/10", border: "border-white/20" }
};
```

## 📐 Medidas de la Animación

**Basadas en medidas exactas del botón en Paint:**
- **Ancho total:** 1017px
- **Alto total:** 137px
- **Diagonal vertical:** 85px (62% de la altura)
- **Diagonal horizontal:** 55px (5.4% del ancho)
- **Relación:** 85:55 = 17:11

## 🎨 Variantes Disponibles

### **Buttons**
- `kivoo-primary` - Azul con animación diagonal
- `kivoo-secondary` - Gris con animación diagonal  
- `yellow` - Amarillo Kivoo con animación diagonal

### **Inputs**
- `kivoo-glass` - Vidrio con animación diagonal

### **Selects**
- `kivoo-glass` - Vidrio con animación diagonal

## 🔧 Extensión para Nuevos Componentes

### **Paso 1: Agregar Variante**
```typescript
export interface NewComponentProps {
  variant?: "default" | "kivoo-style";
}
```

### **Paso 2: Implementar Lógica**
```typescript
const getClasses = () => {
  if (variant === "kivoo-style") {
    return `${baseClasses} ${KIVOO_DIAGONAL_CLASSES.complete}`;
  }
  return baseClasses;
};
```

### **Paso 3: Usar Hook (Opcional)**
```typescript
const { hasAnimation, animationClasses } = useKivooVariantClasses(variant);
```

## ✅ Ventajas de esta Implementación

1. **Atomic Design Puro** - Máximo 4 props por componente
2. **Escalable** - Fácil agregar nuevas variantes
3. **Consistente** - Animación idéntica en todos los componentes
4. **Mantenible** - Estilos centralizados en un solo archivo
5. **Performante** - Clases predefinidas, sin cálculos en runtime

## 🚀 Próximos Pasos

1. **Crear más variantes** según necesidades del diseño
2. **Implementar en más componentes** (Textarea, Checkbox, etc.)
3. **Agregar variantes de color** (kivoo-success, kivoo-error, etc.)
4. **Documentar en Storybook** para el equipo de diseño

## 📝 Ejemplo de Uso Completo

```tsx
import { Button, Input, Select } from '../components/atoms';

const LoginForm = () => {
  return (
    <form className="space-y-4">
      {/* Input con animación diagonal */}
      <Input 
        variant="kivoo-glass"
        placeholder="Email"
        leftIcon={<MailIcon />}
      />
      
      {/* Select con animación diagonal */}
      <Select 
        variant="kivoo-glass"
        options={countryOptions}
        placeholder="País"
      />
      
      {/* Button con animación diagonal */}
      <Button variant="kivoo-primary" size="lg">
        Continuar
      </Button>
    </form>
  );
};
```

Esta implementación mantiene la simplicidad del Atomic Design mientras proporciona la flexibilidad necesaria para el diseño único de Kivoo.
