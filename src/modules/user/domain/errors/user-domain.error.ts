// =============================================================================
// LAYER: Domain
// MAY IMPORT: nothing — this is the innermost layer
// =============================================================================

export abstract class UserDomainError extends Error {
  readonly isDomainError = true;
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
