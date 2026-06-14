// =============================================================================
// LAYER: Domain
// MAY IMPORT: nothing — this is the innermost layer
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, or any infrastructure
//
// This mirrors catalog's DomainError deliberately — modules are independent.
// The global exception filter uses duck-typing (checks `isDomainError === true`)
// so modules never need to share a base class: just implement the same protocol.
// =============================================================================

export abstract class AuthDomainError extends Error {
  /** Sentinel flag read by the global filter without importing this class. */
  readonly isDomainError = true;

  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
