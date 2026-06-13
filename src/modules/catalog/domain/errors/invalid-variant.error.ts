// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, or any infrastructure
// =============================================================================

import { DomainError } from './domain.error';

/** Thrown when a Variant is constructed with invalid data (engineCc ≤ 0, etc.) */
export class InvalidVariantError extends DomainError {
  readonly statusCode = 400;

  constructor(field: string, reason: string) {
    super(`Invalid variant — ${field}: ${reason}`);
  }
}
