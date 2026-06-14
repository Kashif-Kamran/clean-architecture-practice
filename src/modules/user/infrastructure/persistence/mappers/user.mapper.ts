// =============================================================================
// LAYER: Infrastructure (persistence)
// MAY IMPORT: domain entities, ORM entities
// MUST NOT IMPORT: application use cases, HTTP controllers, request DTOs
// =============================================================================

import { User } from '../../../domain/entities/user.entity';
import { UserOrmEntity } from '../entities/user.orm-entity';

export class UserMapper {
  static toDomain(orm: UserOrmEntity): User {
    return new User(orm.id, orm.email, orm.passwordHash, orm.createdAt);
  }

  static toOrm(domain: User): UserOrmEntity {
    const orm = new UserOrmEntity();
    orm.id = domain.id;
    orm.email = domain.email;
    orm.passwordHash = domain.passwordHash;
    orm.createdAt = domain.createdAt;
    return orm;
  }
}
