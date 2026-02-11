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
  metadata: Record<string, any> = {},
  namespace: string = 'backendNetwork'
): string {
  // Si no hay clave, retornar string vacío
  if (!key || typeof key !== 'string') {
    return '';
  }

  // Si la clave contiene espacios, es texto ya redactado (no es una clave técnica)
  // Ej: "Tu energía se multiplica ✨" o "5.92 USDT..."
  if (key.includes(' ')) {
    return key;
  }

  // Si no tiene espacios pero contiene un punto, probablemente es una clave de traducción técnica
  // Ejemplo: "network.NOTIFICATION_CLAIM_ALL_COMPLETED_TITLE"
  if (key.includes('.')) {
    try {
      // Remover el prefijo del namespace (ej: "network." o "auth.")
      const cleanKey = key.replace(/^(network|auth|cards|claim-orders)\./, '');

      // Intentar primero buscar directamente en ERRORS (donde están las notificaciones)
      const errorsKey = `ERRORS.${cleanKey}`;
      const errorsAttempt = i18n.t(errorsKey, { ns: namespace, ...metadata });
      if (errorsAttempt !== errorsKey && errorsAttempt !== '') {
        return errorsAttempt;
      }

      // Si no está en ERRORS, buscar en SUCCESS
      const successKey = `SUCCESS.${cleanKey}`;
      const successAttempt = i18n.t(successKey, { ns: namespace, ...metadata });
      if (successAttempt !== successKey && successAttempt !== '') {
        return successAttempt;
      }

      // Si no está en ninguna estructura, intentar directamente
      const directAttempt = i18n.t(cleanKey, { ns: namespace, ...metadata });
      if (directAttempt !== cleanKey && directAttempt !== '') {
        return directAttempt;
      }

      // Si no se encuentra o devuelve vacío, devolver la clave original
      return key;
    } catch (error) {
      console.warn(`Error translating notification key: ${key}`, error);
      return key;
    }
  }

  // Si no contiene punto ni espacios, devolver tal cual (o intentar traducir si se prefiere)
  return key;
}

/**
 * Traduce un objeto de notificación completo
 * 
 * @param notification - Objeto de notificación con title y body
 * @returns Objeto de notificación con title y body traducidos
 */
export function translateNotification(
  notification: {
    title?: string | null;
    body?: string | null;
    metadata?: Record<string, any> | null;
  }
): {
  title: string;
  body: string;
} {
  const meta = notification.metadata || {};
  return {
    title: translateNotificationKey(notification.title, meta),
    body: translateNotificationKey(notification.body, meta),
  };
}

