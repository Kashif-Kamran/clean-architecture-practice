// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// =============================================================================

import { AuthDomainError } from './auth-domain.error';

/** Thrown by RegisterUseCase when the email is already taken. */
export class UserAlreadyExistsError extends AuthDomainError {
  readonly statusCode = 409;

  constructor(email: string) {
    super(`A user with email "${email}" already exists`);
  }
}
