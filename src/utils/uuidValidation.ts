
/**
 * Utilitários para validação e sanitização de UUIDs
 * Corrige o erro crítico "invalid input syntax for type uuid: 'undefined'"
 */

export const isValidUUID = (uuid: string | null | undefined): boolean => {
  if (!uuid || typeof uuid !== 'string') {
    return false;
  }
  
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
};

export const sanitizeUUID = (uuid: string | null | undefined): string | null => {
  if (!uuid || typeof uuid !== 'string' || uuid === 'undefined' || uuid === 'null') {
    console.warn(`Invalid UUID detected: ${uuid}`);
    return null;
  }
  
  if (isValidUUID(uuid)) {
    return uuid;
  }
  
  console.warn(`Invalid UUID format detected: ${uuid}`);
  return null;
};

export const validateUUIDArray = (uuids: (string | null | undefined)[]): string[] => {
  return uuids
    .map(sanitizeUUID)
    .filter((uuid): uuid is string => uuid !== null);
};

export const logUUIDError = (context: string, uuid: any) => {
  console.error(`UUID Error in ${context}:`, {
    value: uuid,
    type: typeof uuid,
    isUndefined: uuid === undefined,
    isNull: uuid === null,
    isString: typeof uuid === 'string'
  });
};
