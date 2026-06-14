// =============================================================================
// LAYER: Infrastructure (service adapter)
// MAY IMPORT: bcrypt, application ports
// MUST NOT IMPORT: domain entities, application use cases, TypeORM
//
// This is the ADAPTER for PasswordHasherPort. Bcrypt lives here so that:
//   • Application use cases stay library-agnostic.
//   • Tests can inject a fast fake without waiting for bcrypt rounds.
//   • Swapping to argon2 only requires changing this file + the module binding.
// =============================================================================

import { Injectable } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { PasswordHasherPort } from '../../application/ports/password-hasher.port';

const SALT_ROUNDS = 12;

@Injectable()
export class BcryptPasswordHasher implements PasswordHasherPort {
  async hash(plain: string): Promise<string> {
    return bcrypt.hash(plain, SALT_ROUNDS);
  }

  async compare(plain: string, hash: string): Promise<boolean> {
    return bcrypt.compare(plain, hash);
  }
}
