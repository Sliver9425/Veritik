/** Puerto: reloj inyectable, para que los casos de uso sean deterministas en pruebas. */
export interface Clock {
  now(): Date;
}
