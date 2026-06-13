// =============================================================================
// LAYER: Infrastructure (persistence — adapter)
// MAY IMPORT: TypeORM, domain entities, ORM entities, mappers, application ports
// MUST NOT IMPORT: application use cases, HTTP controllers, request/response DTOs
// =============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Variant } from '../../../domain/entities/variant.entity';
import { VariantRepositoryPort } from '../../../application/ports/variant-repository.port';
import { VariantOrmEntity } from '../entities/variant.orm-entity';
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
}
