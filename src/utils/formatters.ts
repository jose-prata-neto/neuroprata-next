
import type { Session } from '../types';

/**
 * Formats an ISO date string to a localized date string (e.g., "dd/MM/yyyy").
 * The `timeZone: 'UTC'` is crucial to prevent the date from shifting by a day
 * depending on the user's local timezone.
 */
export const formatDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

/**
 * Formats a date string specifically for birth dates, ensuring UTC is respected.
 */
export const formatBirthDate = (dateString: string): string => {
  return new Date(dateString).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
};

/**
 * Formats an ISO date string to a localized date and time string (e.g., "dd de MMMM de yyyy, HH:mm").
 */
export const formatDateTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('pt-BR', { dateStyle: 'long', timeStyle: 'short' });
};

/**
 * Formats an ISO date string to a short, localized date and time string.
 */
export const formatShortDateTime = (dateString: string | null): string => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleString('pt-BR', { dateStyle: 'short', timeStyle: 'medium' });
};

/**
 * Returns the current local date and time as a string formatted for datetime-local input.
 */
export const getLocalDateTimeString = (date = new Date()): string => {
    const pad = (num: number) => num.toString().padStart(2, '0');
    const year = date.getFullYear();
    const month = pad(date.getMonth() + 1);
    const day = pad(date.getDate());
    const hours = pad(date.getHours());
    const minutes = pad(date.getMinutes());
    return `${year}-${month}-${day}T${hours}:${minutes}`;
};


/**
 * Converts a File object to a Base64 Data URL.
 */
export const fileToDataURL = (file: File): Promise<string> => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = error => reject(error);
    reader.readAsDataURL(file);
  });
};

/**
 * Determines the document type based on its MIME type.
 */
export const getFileType = (mimeType: string): 'pdf' | 'image' | 'report' => {
  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType === 'application/pdf') return 'pdf';
  return 'report';
};