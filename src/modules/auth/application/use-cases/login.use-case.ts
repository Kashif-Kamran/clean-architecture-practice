// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: @Injectable/@Inject (DI metadata only), domain entities/errors,
//             application ports
// MUST NOT IMPORT: bcrypt, @nestjs/jwt, TypeORM, HTTP decorators
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { USER_REPOSITORY, type UserRepositoryPort } from '../../../user/application/ports/user-repository.port';
import { PASSWORD_HASHER, type PasswordHasherPort } from '../ports/password-hasher.port';
import { TOKEN_SERVICE, type TokenServicePort } from '../ports/token-service.port';
import type { AuthResult } from './register.use-case';

export interface LoginInput {
  email: string;
  password: string;
}

@Injectable()
export class LoginUseCase {
  constructor(
    @Inject(USER_REPOSITORY)  private readonly userRepo: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)  private readonly hasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE)    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: LoginInput): Promise<AuthResult> {
    // Look up user — throw the SAME error as wrong password to prevent
    // user-enumeration: callers cannot tell which accounts exist.
    const user = await this.userRepo.findByEmail(input.email);
    if (!user) throw new InvalidCredentialsError();

    const isValid = await this.hasher.compare(input.password, user.passwordHash);
    if (!isValid) throw new InvalidCredentialsError();

    const token = this.tokenService.generate({ sub: user.id, email: user.email });

    return { token, user };
  }
}
