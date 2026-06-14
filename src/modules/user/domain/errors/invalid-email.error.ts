// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// =============================================================================

import { UserDomainError } from './user-domain.error';

/** Thrown by the User entity constructor when the email format is invalid. */
export class InvalidEmailError extends UserDomainError {
  readonly statusCode = 422;

  constructor(email: string) {
    super(`"${email}" is not a valid email address`);
  }
}
