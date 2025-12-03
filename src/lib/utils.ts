import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Censura el número de tarjeta mostrando solo los últimos 4 dígitos
 * @param cardNumber - Número de tarjeta a censurar
 * @returns Número de tarjeta censurado en formato **** **** **** 1234
 */
export function maskCardNumber(cardNumber: string): string {
  if (!cardNumber) return 'N/A';
  
  // Remover espacios y caracteres no numéricos
  const cleaned = cardNumber.replace(/\s+/g, '').replace(/\D/g, '');
  
  if (cleaned.length < 4) return 'N/A';
  
  // Mostrar solo los últimos 4 dígitos
  const lastFour = cleaned.slice(-4);
  
  // Formatear como: **** **** **** 1234
  if (cleaned.length === 16) {
    return `**** **** **** ${lastFour}`;
  }
  
  // Si no es de 16 dígitos, mostrar solo los últimos 4 con asteriscos
  return `**** ${lastFour}`;
}

/**
 * Censura el nombre completo mostrando solo la primera letra de cada palabra
 * @param fullName - Nombre completo a censurar
 * @returns Nombre censurado (ej: "M**** D**** S****")
 */
export function maskFullName(fullName: string): string {
  if (!fullName) return 'N/A';
  
  // Dividir el nombre en palabras
  const words = fullName.trim().split(/\s+/);
  
  if (words.length === 0) return 'N/A';
  
  // Censurar cada palabra: primera letra + asteriscos
  const maskedWords = words.map(word => {
    if (word.length === 0) return '';
    const firstLetter = word[0].toUpperCase();
    const asterisks = '*'.repeat(Math.max(1, word.length - 1));
    return `${firstLetter}${asterisks}`;
  });
  
  return maskedWords.join(' ');
}

