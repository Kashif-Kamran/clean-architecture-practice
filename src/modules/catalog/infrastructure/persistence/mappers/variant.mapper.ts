// =============================================================================
// LAYER: Infrastructure (persistence)
// MAY IMPORT: domain entities, ORM entities
// MUST NOT IMPORT: application use cases, HTTP controllers, request DTOs
// =============================================================================

import { Variant } from '../../../domain/entities/variant.entity';
import { VariantOrmEntity } from '../entities/variant.orm-entity';

export class VariantMapper {
  static toDomain(orm: VariantOrmEntity): Variant {
    return new Variant(
      orm.id,
      orm.modelId,
      orm.name,
      orm.year,
      orm.engineCc,
      // TypeORM returns NUMERIC columns as strings from pg driver
      Number(orm.priceMsrp),
    );
  }

  static toOrm(domain: Variant): VariantOrmEntity {
    const orm = new VariantOrmEntity();
    orm.id = domain.id;
    orm.modelId = domain.modelId;
    orm.name = domain.name;
    orm.year = domain.year;
    orm.engineCc = domain.engineCc;
    orm.priceMsrp = domain.priceMsrp;
    return orm;
  }
}
