// =============================================================================
// LAYER: Infrastructure (persistence — adapter)
// MAY IMPORT: TypeORM, domain entities, ORM entities, mappers, application ports
// MUST NOT IMPORT: application use cases, HTTP controllers, request/response DTOs
// =============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variant } from '../../../domain/entities/variant.entity';
import {
  VariantDetail,
  VariantRepositoryPort,
} from '../../../application/ports/variant-repository.port';
import { VariantOrmEntity } from '../entities/variant.orm-entity';
import { ModelOrmEntity } from '../entities/model.orm-entity';
import { MakeOrmEntity } from '../entities/make.orm-entity';
import { VariantMapper } from '../mappers/variant.mapper';

@Injectable()
export class VariantTypeOrmRepository implements VariantRepositoryPort {
  constructor(
    @InjectRepository(VariantOrmEntity)
    private readonly ormRepo: Repository<VariantOrmEntity>,
  ) {}

  async save(variant: Variant): Promise<void> {
    await this.ormRepo.save(VariantMapper.toOrm(variant));
  }

  async findById(id: string): Promise<Variant | null> {
    const orm = await this.ormRepo.findOneBy({ id });
    return orm ? VariantMapper.toDomain(orm) : null;
  }

  async findByModelId(modelId: string): Promise<Variant[]> {
    const orms = await this.ormRepo.findBy({ modelId });
    return orms.map(VariantMapper.toDomain);
  }

  // ── Populated read — single JOIN across three tables ───────────────────────
  // This is the ONLY place in the codebase that knows the variant→model→make
  // relationship requires joining three tables. The use case, controller, and
  // response DTO all see a flat VariantDetail interface — they're unaware of SQL.
  async findDetailById(id: string): Promise<VariantDetail | null> {
    const row = await this.ormRepo.manager
      .createQueryBuilder()
      .select([
        'v.id                AS "variantId"',
        'v.name              AS "variantName"',
        'v.year              AS "year"',
        'v.engine_cc         AS "engineCc"',
        'v.price_msrp        AS "priceMsrp"',
        'm.id                AS "modelId"',
        'm.name              AS "modelName"',
        'm.body_type         AS "bodyType"',
        'm.year_introduced   AS "yearIntroduced"',
        'mk.id               AS "makeId"',
        'mk.name             AS "makeName"',
        'mk.country_of_origin AS "countryOfOrigin"',
      ])
      .from(VariantOrmEntity, 'v')
      .innerJoin(ModelOrmEntity, 'm',  'm.id = v.model_id')
      .innerJoin(MakeOrmEntity,  'mk', 'mk.id = m.make_id')
      .where('v.id = :id', { id })
      .getRawOne<Record<string, string>>();

    if (!row) return null;

    // Assemble the nested read model from the flat SQL row.
    return {
      id:         row.variantId,
      name:       row.variantName,
      year:       Number(row.year),
      engineCc:   Number(row.engineCc),
      priceMsrp:  Number(row.priceMsrp),
      model: {
        id:             row.modelId,
        name:           row.modelName,
        bodyType:       row.bodyType,
        yearIntroduced: Number(row.yearIntroduced),
        make: {
          id:              row.makeId,
          name:            row.makeName,
          countryOfOrigin: row.countryOfOrigin,
        },
      },
    };
  }
}
