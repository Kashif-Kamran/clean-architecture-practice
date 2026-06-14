// =============================================================================
// LAYER: Application (use case — query)
// MAY IMPORT: @Injectable/@Inject (DI metadata only), domain entities/errors,
//             application ports
// MUST NOT IMPORT: TypeORM, HTTP decorators, JWT libraries
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../../user/domain/entities/user.entity';
import { InvalidCredentialsError } from '../../domain/errors/invalid-credentials.error';
import { USER_REPOSITORY, type UserRepositoryPort } from '../../../user/application/ports/user-repository.port';

@Injectable()
export class GetCurrentUserUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(userId: string): Promise<User> {
    const user = await this.userRepo.findById(userId);
    // A valid JWT for a deleted account — treat as 401, not 404.
    // Returning 404 here would confirm that the account existed.
    if (!user) throw new InvalidCredentialsError();
    return user;
  }
}
