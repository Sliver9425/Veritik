/** Contrato mínimo de almacenamiento clave-valor. AsyncStorage lo cumple; en pruebas se usa una versión en memoria. */
export interface KeyValueStorage {
  getItem(key: string): Promise<string | null>;
  setItem(key: string, value: string): Promise<void>;
  removeItem(key: string): Promise<void>;
}
