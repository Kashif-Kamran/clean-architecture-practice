// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// MUST NOT IMPORT: NestJS, TypeORM, bcrypt, or any infrastructure
// =============================================================================

import { InvalidEmailError } from '../errors/invalid-email.error';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export class User {
  constructor(
    public readonly id: string,
    public readonly email: string,
    /** bcrypt hash — the plain-text password never enters the domain */
    public readonly passwordHash: string,
    public readonly createdAt: Date,
  ) {
    if (!EMAIL_RE.test(email)) throw new InvalidEmailError(email);
  }
}
