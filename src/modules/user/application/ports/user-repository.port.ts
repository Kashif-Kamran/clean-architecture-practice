// =============================================================================
// LAYER: Application (port / interface)
// MAY IMPORT: domain entities
// MUST NOT IMPORT: NestJS, TypeORM — implementations live in infrastructure
// =============================================================================

import type { User } from '../../domain/entities/user.entity';

export interface UserRepositoryPort {
  save(user: User): Promise<void>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
}

/** DI token — Symbol decouples use cases from the adapter class name. */
export const USER_REPOSITORY = Symbol('USER_REPOSITORY');
