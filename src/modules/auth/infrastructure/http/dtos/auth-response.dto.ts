// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: domain entities (to map from)
// MUST NOT IMPORT: application use cases, TypeORM, ORM entities
// =============================================================================

import type { User } from '../../../../user/domain/entities/user.entity';
import type { AuthResult } from '../../../application/use-cases/register.use-case';

class UserResponseDto {
  id!: string;
  email!: string;
}

export class AuthResponseDto {
  accessToken!: string;
  user!: UserResponseDto;

  static from(result: AuthResult): AuthResponseDto {
    const dto = new AuthResponseDto();
    dto.accessToken = result.token;
    dto.user = { id: result.user.id, email: result.user.email };
    return dto;
  }
}

/** Returned by GET /auth/me — just the user, no new token. */
export class MeResponseDto {
  id!: string;
  email!: string;

  static fromDomain(user: User): MeResponseDto {
    const dto = new MeResponseDto();
    dto.id = user.id;
    dto.email = user.email;
    return dto;
  }
}
