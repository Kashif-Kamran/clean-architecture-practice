// =============================================================================
// LAYER: Application (use case — query)
// MAY IMPORT: @Injectable/@Inject (DI metadata only), domain entities/errors,
//             application ports
// MUST NOT IMPORT: TypeORM, HTTP decorators
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { User } from '../../domain/entities/user.entity';
import { UserNotFoundError } from '../../domain/errors/user-not-found.error';
import { USER_REPOSITORY, type UserRepositoryPort } from '../ports/user-repository.port';

@Injectable()
export class GetUserByIdUseCase {
  constructor(
    @Inject(USER_REPOSITORY) private readonly userRepo: UserRepositoryPort,
  ) {}

  async execute(id: string): Promise<User> {
    const user = await this.userRepo.findById(id);
    if (!user) throw new UserNotFoundError(id);
    return user;
  }
}
