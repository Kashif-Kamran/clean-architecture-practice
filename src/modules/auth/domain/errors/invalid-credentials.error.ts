// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// =============================================================================

import { AuthDomainError } from './auth-domain.error';

/**
 * Thrown when login fails OR when a valid token references a deleted user.
 *
 * Deliberately generic: the same error covers "user not found" and "wrong
 * password" so callers cannot probe which emails are registered (user-enumeration
 * attack prevention).
 */
export class InvalidCredentialsError extends AuthDomainError {
  readonly statusCode = 401;

  constructor() {
    super('Invalid email or password');
  }
}
