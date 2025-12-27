# Textos Hardcodeados en Español - Lista Completa para Migración

Este documento lista todos los textos hardcodeados en español encontrados en la aplicación que necesitan ser migrados a usar traducciones con `useTranslation`.

## 📋 Resumen

- **Total de archivos con textos hardcodeados**: ~50+ archivos
- **Componentes más críticos**: LoginForm ✅, SidebarNavigation ✅, otros pendientes

---

## 🎯 Archivos con Textos Hardcodeados

### 📁 Componentes Organisms

#### `src/components/organisms/ClaimAllScreen.tsx`
- ✅ `"Continuar"` → `t('common:buttons.continue')`
- ✅ `"Solicitud en proceso"` → Necesita traducción nueva
- ✅ `"Volver"` → `t('common:buttons.back')`

#### `src/components/organisms/CommissionsListCard.tsx`
- ✅ `"Error al cargar comisiones"` → `t('common:messages.error')`
- ✅ `"No hay comisiones disponibles"` → `t('common:messages.noData')`
- ✅ `"Cargando comisiones..."` → `t('common:buttons.loading')`
- ✅ `"Ver detalle"` → `t('common:buttons.view')`

#### `src/components/organisms/ClaimsListCard.tsx`
- ✅ `"Fecha"` → `t('common:labels.date')`
- ✅ `"Monto"` → `t('common:labels.amount')`
- ✅ `"Estado"` → `t('common:labels.status')`
- ✅ `"Acciones"` → `t('common:labels.actions')`
- ✅ `"Error al cargar órdenes"` → Necesita traducción nueva
- ✅ `"No hay órdenes disponibles"` → `t('common:messages.noData')`
- ✅ `"Cargando órdenes..."` → `t('common:buttons.loading')`
- ✅ `"Cargando más órdenes..."` → Necesita traducción nueva

#### `src/components/organisms/NetworkTable.tsx`
- ✅ `"Ver detalle"` → `t('common:buttons.view')`
- ✅ `"Ver árbol"` → Necesita traducción nueva
- ✅ `"Cargar más"` → Necesita traducción nueva
- ✅ `"Cargando..."` → `t('common:buttons.loading')`

#### `src/components/organisms/ResumenCard.tsx`
- ✅ `"Comisiones"` → `t('navigation:menu.commissions')`
- ✅ `"Semanal"` → Necesita traducción nueva
- ✅ `"Mensual"` → Necesita traducción nueva
- ✅ `"Último año"` → Necesita traducción nueva
- ✅ `"Vista"` → Necesita traducción nueva
- ✅ `"Selecciona un rango"` → Necesita traducción nueva

#### `src/components/organisms/TransaccionesRecientesCard.tsx`
- ✅ `"Error al cargar transacciones"` → Necesita traducción nueva
- ✅ `"Selecciona un modelo para ver las transacciones"` → Necesita traducción nueva
- ✅ `"No hay transacciones recientes"` → `t('common:messages.noData')`
- ✅ `"Cargando transacciones..."` → Necesita traducción nueva
- ✅ `"Cargando más transacciones..."` → Necesita traducción nueva

#### `src/components/organisms/ForgotPasswordForm.tsx`
- ✅ `"Correo electrónico"` → `t('common:labels.email')`

---

### 📁 Componentes Molecules

#### `src/components/molecules/NotificationsList.tsx`
- ✅ `"Cargando notificaciones..."` → Necesita traducción nueva
- ✅ `"Error al cargar notificaciones"` → Necesita traducción nueva
- ✅ `"No hay notificaciones"` → `t('notifications:titles.noNotifications')`
- ✅ `"Todas tus notificaciones aparecerán aquí"` → Necesita traducción nueva
- ✅ `"Notificaciones"` → `t('notifications:titles.notifications')`

#### `src/components/molecules/NotificationDetailModal.tsx`
- ✅ `"Cerrar"` → `t('common:buttons.close')`

#### `src/components/molecules/ClaimDetailModal.tsx`
- ✅ `"Usuario"` → Necesita traducción nueva
- ✅ `"Estado"` → `t('common:labels.status')`
- ✅ `"Tipo de comisión"` → Necesita traducción nueva
- ✅ `"Porcentaje"` → Necesita traducción nueva
- ✅ `"Período inicio"` → Necesita traducción nueva
- ✅ `"Período fin"` → Necesita traducción nueva
- ✅ `"Comisión"` → Necesita traducción nueva
- ✅ `"Seleccionar tarjeta"` → Necesita traducción nueva
- ✅ `"Sin tarjetas activas disponibles"` → Necesita traducción nueva
- ✅ `"Sin tarjetas disponibles"` → Necesita traducción nueva
- ✅ `"Error al cargar las tarjetas"` → Necesita traducción nueva
- ✅ `"Cargando tarjetas..."` → Necesita traducción nueva

#### `src/components/molecules/OrderClaimDetailModal.tsx`
- ✅ `"Estado"` → `t('common:labels.status')`
- ✅ `"Monto base"` → Necesita traducción nueva
- ✅ `"Porcentaje"` → Necesita traducción nueva
- ✅ `"Comisión"` → Necesita traducción nueva

#### `src/components/molecules/OrderClaimsModal.tsx`
- ✅ `"No hay claims en esta orden"` → Necesita traducción nueva
- ✅ `"Cargando claims..."` → Necesita traducción nueva
- ✅ `"Moneda"` → `t('common:labels.currency')`
- ✅ `"Porcentaje"` → Necesita traducción nueva
- ✅ `"Tarjeta"` → Necesita traducción nueva
- ✅ `"Usuario"` → Necesita traducción nueva
- ✅ `"Generado por"` → Necesita traducción nueva
- ✅ `"Criptomoneda"` → Necesita traducción nueva
- ✅ `"Equipo"` → Necesita traducción nueva
- ✅ `"Período"` → Necesita traducción nueva

#### `src/components/molecules/NoClaimsModal.tsx`
- ✅ `"Continuar"` → `t('common:buttons.continue')`

#### `src/components/molecules/NoCardsModal.tsx`
- ✅ `"NO PUEDES COBRAR TUS COMISIONES"` → `t('notifications:noCards.title')`
- ✅ `"Para recibir tus pagos necesitas adquirir tu tarjeta KIVOO"` → `t('notifications:noCards.message')`
- ✅ `"Contactar a soporte"` → `t('notifications:noCards.contactSupport')`
- ✅ `"Solicitar tarjeta"` → `t('notifications:noCards.requestCard')`

#### `src/components/molecules/SuccessModal.tsx`
- ✅ `"¡Éxito!"` → `t('common:messages.success')`
- ✅ `"Continuar"` → `t('common:buttons.continue')`

#### `src/components/molecules/ModelSelector.tsx`
- ✅ `"Cargando..."` → `t('common:buttons.loading')`
- ✅ `"Selecciona un modelo"` → Necesita traducción nueva

#### `src/components/molecules/NetworkFilter.tsx`
- ✅ `"Buscar usuario"` → Necesita traducción nueva

#### `src/components/molecules/B2BCommissionDetailModal.tsx`
- ✅ `"Equipo"` → Necesita traducción nueva
- ✅ `"Estado"` → `t('common:labels.status')`
- ✅ `"Comisión"` → Necesita traducción nueva
- ✅ `"Volumen total"` → Necesita traducción nueva
- ✅ `"Porcentaje de comisión"` → Necesita traducción nueva
- ✅ `"Transacciones"` → Necesita traducción nueva
- ✅ `"Cerrar"` → `t('common:buttons.close')`

---

### 📁 Componentes Atoms

#### `src/components/atoms/ClaimItem.tsx`
- ✅ `"Concepto"` → Necesita traducción nueva
- ✅ `"Tipo de comisión"` → Necesita traducción nueva
- ✅ `"Estado"` → `t('common:labels.status')`
- ✅ `"Acción"` → Necesita traducción nueva
- ✅ `"Ver detalle"` → `t('common:buttons.view')`

#### `src/components/atoms/NetworkTableHeader.tsx`
- ✅ `"Fecha de unión"` → Necesita traducción nueva
- ✅ `"Nivel"` → Necesita traducción nueva
- ✅ `"Volumen"` → Necesita traducción nueva
- ✅ `"Acciones"` → `t('common:labels.actions')`

---

### 📁 Páginas

#### `src/pages/Maintenance.tsx`
- ✅ `"Estamos realizando tareas de mantenimiento"` → `t('notifications:maintenance.title')`
- ✅ `"Nuestra app está temporalmente fuera de servicio..."` → `t('notifications:maintenance.description')`

#### `src/pages/ManualLoads.tsx`
- ✅ `"Selecciona un concepto"` → Necesita traducción nueva
- ✅ `"Ingrese el ID del equipo"` → Necesita traducción nueva
- ✅ `"Ingrese notas adicionales (opcional)"` → Necesita traducción nueva

#### `src/pages/ResetPassword.tsx`
- ✅ `"Nueva Contraseña"` → `t('forms:resetPassword.newPassword')`
- ✅ `"Confirmar Contraseña"` → `t('forms:resetPassword.confirmPassword')`

#### `src/pages/Dashboard.tsx`
- Varios textos hardcodeados (revisar componente completo)

---

## 🔧 Traducciones que Faltan Añadir

Las siguientes traducciones necesitan ser añadidas a los archivos JSON:

### `common.json` - Añadir:
```json
{
  "labels": {
    "user": "Usuario",
    "commissionType": "Tipo de comisión",
    "percentage": "Porcentaje",
    "periodStart": "Período inicio",
    "periodEnd": "Período fin",
    "commission": "Comisión",
    "selectCard": "Seleccionar tarjeta",
    "baseAmount": "Monto base",
    "card": "Tarjeta",
    "generatedBy": "Generado por",
    "cryptocurrency": "Criptomoneda",
    "team": "Equipo",
    "period": "Período",
    "concept": "Concepto",
    "joinDate": "Fecha de unión",
    "level": "Nivel",
    "volume": "Volumen",
    "totalVolume": "Volumen total",
    "commissionPercentage": "Porcentaje de comisión",
    "transactions": "Transacciones",
    "view": "Vista",
    "range": "Rango"
  },
  "messages": {
    "loadingNotifications": "Cargando notificaciones...",
    "errorLoadingNotifications": "Error al cargar notificaciones",
    "allNotificationsHere": "Todas tus notificaciones aparecerán aquí",
    "loadingCommissions": "Cargando comisiones...",
    "errorLoadingCommissions": "Error al cargar comisiones",
    "loadingOrders": "Cargando órdenes...",
    "errorLoadingOrders": "Error al cargar órdenes",
    "loadingMoreOrders": "Cargando más órdenes...",
    "loadingTransactions": "Cargando transacciones...",
    "errorLoadingTransactions": "Error al cargar transacciones",
    "selectModelForTransactions": "Selecciona un modelo para ver las transacciones",
    "loadingMoreTransactions": "Cargando más transacciones...",
    "noRecentTransactions": "No hay transacciones recientes",
    "noActiveCards": "Sin tarjetas activas disponibles",
    "noCardsAvailable": "Sin tarjetas disponibles",
    "errorLoadingCards": "Error al cargar las tarjetas",
    "loadingCards": "Cargando tarjetas...",
    "noClaimsInOrder": "No hay claims en esta orden",
    "loadingClaims": "Cargando claims...",
    "requestInProcess": "Solicitud en proceso"
  },
  "buttons": {
    "viewTree": "Ver árbol",
    "loadMore": "Cargar más",
    "viewDetail": "Ver detalle"
  }
}
```

### Nuevos namespaces necesarios:

#### `claims.json`:
```json
{
  "labels": {
    "commissionType": "Tipo de comisión",
    "percentage": "Porcentaje",
    "periodStart": "Período inicio",
    "periodEnd": "Período fin",
    "commission": "Comisión",
    "baseAmount": "Monto base"
  },
  "messages": {
    "loadingClaims": "Cargando claims...",
    "noClaimsInOrder": "No hay claims en esta orden"
  }
}
```

#### `network.json` - Añadir:
```json
{
  "labels": {
    "joinDate": "Fecha de unión",
    "level": "Nivel",
    "volume": "Volumen",
    "viewTree": "Ver árbol",
    "viewDetail": "Ver detalle"
  },
  "buttons": {
    "viewTree": "Ver árbol",
    "loadMore": "Cargar más"
  }
}
```

#### `dashboard.json` - Añadir:
```json
{
  "periods": {
    "weekly": "Semanal",
    "monthly": "Mensual",
    "lastYear": "Último año"
  },
  "labels": {
    "view": "Vista",
    "selectRange": "Selecciona un rango"
  }
}
```

---

## 📝 Plan de Migración Recomendado

1. **Fase 1 - Componentes Críticos** (Ya hecho ✅)
   - ✅ LoginForm
   - ✅ SidebarNavigation

2. **Fase 2 - Componentes de UI Principales**
   - NoCardsModal
   - SuccessModal
   - NotificationDetailModal
   - Maintenance

3. **Fase 3 - Componentes de Listas**
   - ClaimsListCard
   - CommissionsListCard
   - NotificationsList
   - TransaccionesRecientesCard

4. **Fase 4 - Componentes de Detalle**
   - ClaimDetailModal
   - OrderClaimDetailModal
   - B2BCommissionDetailModal

5. **Fase 5 - Componentes de Red**
   - NetworkTable
   - NetworkTableHeader
   - NetworkFilter

6. **Fase 6 - Páginas**
   - Dashboard
   - ManualLoads
   - ResetPassword
   - Otras páginas

---

## 🎯 Patrón de Migración

Para cada componente:

```tsx
// 1. Importar
import { useTranslation } from 'react-i18next';

// 2. Usar hook
const { t } = useTranslation(['common', 'otro-namespace']);

// 3. Reemplazar textos
// Antes:
<span>Texto en español</span>

// Después:
<span>{t('common:labels.status')}</span>
```

---

**Última actualización**: Enero 2025
**Total de textos a migrar**: ~150+ textos hardcodeados

