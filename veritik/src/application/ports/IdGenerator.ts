/** Puerto: genera identificadores únicos. La implementación (uuid, nanoid, etc.) vive en infrastructure. */
export interface IdGenerator {
  next(): string;
}
