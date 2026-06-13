// =============================================================================
// LAYER: Infrastructure (persistence)
// MAY IMPORT: domain entities, ORM entities
// MUST NOT IMPORT: application use cases, HTTP controllers, request DTOs
// =============================================================================

import { Model } from '../../../domain/entities/model.entity';
import { ModelOrmEntity } from '../entities/model.orm-entity';

export class ModelMapper {
  static toDomain(orm: ModelOrmEntity): Model {
    return new Model(
      orm.id,
      orm.makeId,
      orm.name,
      orm.bodyType,
      orm.yearIntroduced,
    );
  }

  static toOrm(domain: Model): ModelOrmEntity {
    const orm = new ModelOrmEntity();
    orm.id = domain.id;
    orm.makeId = domain.makeId;
    orm.name = domain.name;
    orm.bodyType = domain.bodyType;
    orm.yearIntroduced = domain.yearIntroduced;
    return orm;
  }
}
