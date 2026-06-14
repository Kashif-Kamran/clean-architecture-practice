// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: @Injectable/@Inject (DI metadata only), domain entities/errors,
//             application ports
// MUST NOT IMPORT: bcrypt, @nestjs/jwt, TypeORM, HTTP decorators
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { User } from '../../../user/domain/entities/user.entity';
import { UserAlreadyExistsError } from '../../domain/errors/user-already-exists.error';
import { USER_REPOSITORY, type UserRepositoryPort } from '../../../user/application/ports/user-repository.port';
import { PASSWORD_HASHER, type PasswordHasherPort } from '../ports/password-hasher.port';
import { TOKEN_SERVICE, type TokenServicePort } from '../ports/token-service.port';

export interface RegisterInput {
  email: string;
  password: string;
}

export interface AuthResult {
  token: string;
  user: User;
}

@Injectable()
export class RegisterUseCase {
  constructor(
    @Inject(USER_REPOSITORY)  private readonly userRepo: UserRepositoryPort,
    @Inject(PASSWORD_HASHER)  private readonly hasher: PasswordHasherPort,
    @Inject(TOKEN_SERVICE)    private readonly tokenService: TokenServicePort,
  ) {}

  async execute(input: RegisterInput): Promise<AuthResult> {
    // 1. Email uniqueness check
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) throw new UserAlreadyExistsError(input.email);

    // 2. Hash password (bcrypt stays in infrastructure — we call the port)
    const passwordHash = await this.hasher.hash(input.password);

    // 3. Create domain entity — constructor enforces email format invariant
    const user = new User(randomUUID(), input.email, passwordHash, new Date());

    // 4. Persist
    await this.userRepo.save(user);

    // 5. Issue token
    const token = this.tokenService.generate({ sub: user.id, email: user.email });

    return { token, user };
  }
}
