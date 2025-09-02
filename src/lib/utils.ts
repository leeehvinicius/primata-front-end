// Utility functions for the application

/**
 * Validates if a string is a valid UUID v4 format
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID v4, false otherwise
 */
export function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates if a string is a valid UUID (any version)
 * @param uuid - The string to validate
 * @returns true if the string is a valid UUID, false otherwise
 */
export function isValidUUIDAnyVersion(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

/**
 * Validates if a string looks like a valid ID (UUID or other common ID formats)
 * @param id - The string to validate
 * @returns true if the string looks like a valid ID, false otherwise
 */
export function isValidId(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // Check for UUID format
  if (isValidUUIDAnyVersion(id)) {
    return true;
  }
  
  // Check for other common ID formats (alphanumeric, at least 8 characters)
  const commonIdRegex = /^[a-zA-Z0-9]{8,}$/;
  return commonIdRegex.test(id);
}

/**
 * Validates if a string looks like a valid ID with more lenient rules
 * This is used as a fallback when the strict validation fails
 * @param id - The string to validate
 * @returns true if the string looks like a valid ID, false otherwise
 */
export function isValidIdLenient(id: string): boolean {
  if (!id || typeof id !== 'string') {
    return false;
  }
  
  // More lenient: alphanumeric with at least 6 characters
  const lenientIdRegex = /^[a-zA-Z0-9]{6,}$/;
  return lenientIdRegex.test(id);
}

/**
 * Sanitizes an ID by removing any potentially dangerous characters
 * @param id - The ID to sanitize
 * @returns The sanitized ID
 */
export function sanitizeId(id: string): string {
  if (!id || typeof id !== 'string') {
    return '';
  }
  
  // Remove any characters that aren't alphanumeric, hyphens, or underscores
  return id.replace(/[^a-zA-Z0-9\-_]/g, '');
}

/**
 * Formats an error message for user display
 * @param error - The error object or message
 * @returns A user-friendly error message
 */
export function formatErrorMessage(error: unknown): string {
  if (error instanceof Error) {
    return error.message;
  }
  
  if (typeof error === 'string') {
    return error;
  }
  
  return 'Ocorreu um erro inesperado';
}

/**
 * Attempts to convert a non-UUID ID to a UUID-like format
 * This is a workaround for systems that expect UUID format
 * @param id - The ID to convert
 * @returns A UUID-like string or the original ID if conversion fails
 */
export function tryConvertToUUID(id: string): string {
  if (!id || typeof id !== 'string') {
    return id;
  }
  
  // If it's already a valid UUID, return as is
  if (isValidUUIDAnyVersion(id)) {
    return id;
  }
  
  // Try to create a UUID-like format from the existing ID
  // This is a workaround and may not work with all backends
  try {
    // Pad the ID to 32 characters and format as UUID
    const paddedId = id.padEnd(32, '0').substring(0, 32);
    const uuidLike = [
      paddedId.substring(0, 8),
      paddedId.substring(8, 12),
      paddedId.substring(12, 16),
      paddedId.substring(16, 20),
      paddedId.substring(20, 32)
    ].join('-');
    
    console.log(`Converted ID "${id}" to UUID-like format: "${uuidLike}"`);
    return uuidLike;
  } catch (error) {
    console.warn('Failed to convert ID to UUID format:', error);
    return id;
  }
}

/**
 * Checks if an ID format mismatch error occurred
 * @param error - The error to check
 * @returns true if it's a UUID format mismatch error
 */
export function isUUIDFormatError(error: unknown): boolean {
  if (error instanceof Error) {
    return error.message.includes('Validation failed (uuid is expected)') ||
           error.message.includes('uuid is expected') ||
           error.message.includes('Invalid UUID format');
  }
  
  if (typeof error === 'string') {
    return error.includes('Validation failed (uuid is expected)') ||
           error.includes('uuid is expected') ||
           error.includes('Invalid UUID format');
  }
  
  return false;
}
