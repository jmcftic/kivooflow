import i18n from '../i18n/config';

/**
 * Traduce una clave de notificación del backend
 * 
 * Si la clave contiene un punto (.), se intenta traducirla usando
 * el namespace backendNetwork. Si no, se devuelve la clave tal cual
 * (asumiendo que ya está traducida).
 * 
 * @param key - Clave de traducción o texto ya traducido
 * @param namespace - Namespace a usar (por defecto 'backendNetwork')
 * @returns Texto traducido
 * 
 * @example
 * translateNotificationKey('network.NOTIFICATION_CLAIM_ALL_COMPLETED_TITLE')
 * // Retorna: "Solicitud de comisiones procesada" (en español)
 * 
 * @example
 * translateNotificationKey('Ya está traducido')
 * // Retorna: "Ya está traducido"
 */
export function translateNotificationKey(
  key: string | null | undefined,
  namespace: string = 'backendNetwork'
): string {
  // Si no hay clave, retornar string vacío
  if (!key || typeof key !== 'string') {
    return '';
  }

  // Si la clave contiene un punto, probablemente es una clave de traducción
  // Ejemplo: "network.NOTIFICATION_CLAIM_ALL_COMPLETED_TITLE"
  if (key.includes('.')) {
    try {
      // Remover el prefijo del namespace (ej: "network." o "auth.")
      const cleanKey = key.replace(/^(network|auth|cards|claim-orders)\./, '');
      
      // Intentar primero buscar directamente en ERRORS (donde están las notificaciones)
      const errorsKey = `ERRORS.${cleanKey}`;
      const errorsAttempt = i18n.t(errorsKey, { ns: namespace });
      if (errorsAttempt !== errorsKey) {
        return errorsAttempt;
      }
      
      // Si no está en ERRORS, buscar en SUCCESS
      const successKey = `SUCCESS.${cleanKey}`;
      const successAttempt = i18n.t(successKey, { ns: namespace });
      if (successAttempt !== successKey) {
        return successAttempt;
      }
      
      // Si no está en ninguna estructura, intentar directamente
      const directAttempt = i18n.t(cleanKey, { ns: namespace });
      if (directAttempt !== cleanKey) {
        return directAttempt;
      }
      
      // Si no se encuentra, devolver la clave original
      return key;
    } catch (error) {
      console.warn(`Error translating notification key: ${key}`, error);
      return key;
    }
  }

  // Si no contiene punto, asumir que ya está traducido
  return key;
}

/**
 * Traduce un objeto de notificación completo
 * 
 * @param notification - Objeto de notificación con title y body
 * @returns Objeto de notificación con title y body traducidos
 */
export function translateNotification(notification: {
  title?: string | null;
  body?: string | null;
}): {
  title: string;
  body: string;
} {
  return {
    title: translateNotificationKey(notification.title),
    body: translateNotificationKey(notification.body),
  };
}

