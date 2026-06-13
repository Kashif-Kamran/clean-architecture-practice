// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, or any infrastructure
// =============================================================================

import { DomainError } from './domain.error';

/** Thrown when an entity lookup fails — used by use cases after calling ports. */
export class NotFoundError extends DomainError {
  readonly statusCode = 404;

  constructor(entity: string, id: string) {
    super(`${entity} with id "${id}" was not found`);
  }
}
