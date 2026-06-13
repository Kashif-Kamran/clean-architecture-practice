// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, or any infrastructure
// =============================================================================

import { DomainError } from './domain.error';

/** Thrown when a Model is constructed with invalid data (empty name, etc.) */
export class InvalidModelError extends DomainError {
  readonly statusCode = 400;

  constructor(field: string, reason: string) {
    super(`Invalid model — ${field}: ${reason}`);
  }
}
