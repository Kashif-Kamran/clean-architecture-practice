// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// =============================================================================

import { UserDomainError } from './user-domain.error';

export class UserNotFoundError extends UserDomainError {
  readonly statusCode = 404;

  constructor(id: string) {
    super(`User with id "${id}" was not found`);
  }
}
