// =============================================================================
// LAYER: Domain
// MAY IMPORT: nothing — this is the innermost layer
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, or any infrastructure
// =============================================================================

/**
 * Base class for all domain errors.
 *
 * Extending Error gives us a real stack trace. We tag it with `isDomainError`
 * so the exception filter (infrastructure) can identify it without importing
 * this class and coupling the outer layer to the inner one — it just checks
 * the boolean flag on the caught `unknown`.
 */
export abstract class DomainError extends Error {
  /** Sentinel flag: infrastructure reads this to detect domain errors without
   *  importing the class. Avoids infrastructure → domain type coupling. */
  readonly isDomainError = true;

  /** HTTP status code suggestion. Infrastructure layer is free to ignore it. */
  abstract readonly statusCode: number;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
    // Restore prototype chain (needed when targeting ES5 in TypeScript)
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
