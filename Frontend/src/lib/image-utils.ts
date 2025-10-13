/**
 * Image utilities
 * Helper functions for handling image URLs
 */

const API_BASE_URL = import.meta.env.VITE_API_URL?.replace('/api/v1', '') || 'http://localhost:4000';

/**
 * Get full image URL
 * Handles both absolute URLs and relative paths
 */
export function getImageUrl(path: string | null | undefined): string {
  if (!path) return '/items/placeholder.svg';
  
  // Si es una URL completa (http, https, data:)
  if (path.startsWith('http') || path.startsWith('data:')) {
    return path;
  }
  
  // Si es una ruta relativa, agregar la URL base del backend
  return `${API_BASE_URL}${path}`;
}

