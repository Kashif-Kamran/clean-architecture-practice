// =============================================================================
// LAYER: Infrastructure (persistence)
// MAY IMPORT: domain entities, ORM entities
// MUST NOT IMPORT: application use cases, HTTP controllers, request DTOs
//
// A MAPPER translates between the ORM world and the domain world.
// It's the only place in infrastructure that "speaks" both languages.
// Neither the domain entity nor the ORM entity knows about the other.
// =============================================================================

import { Make } from '../../../domain/entities/make.entity';
import { MakeOrmEntity } from '../entities/make.orm-entity';

export class MakeMapper {
  /** ORM entity → domain entity (used when reading from DB) */
  static toDomain(orm: MakeOrmEntity): Make {
    return new Make(orm.id, orm.name, orm.countryOfOrigin);
  }

  /** domain entity → ORM entity (used when writing to DB) */
  static toOrm(domain: Make): MakeOrmEntity {
    const orm = new MakeOrmEntity();
    orm.id = domain.id;
    orm.name = domain.name;
    orm.countryOfOrigin = domain.countryOfOrigin;
    return orm;
  }
}
