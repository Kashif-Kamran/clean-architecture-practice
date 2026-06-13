// =============================================================================
// LAYER: Infrastructure (persistence — adapter)
// MAY IMPORT: TypeORM, domain entities, ORM entities, mappers, application ports
// MUST NOT IMPORT: application use cases, HTTP controllers, request/response DTOs
// =============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Model } from '../../../domain/entities/model.entity';
import { ModelRepositoryPort } from '../../../application/ports/model-repository.port';
import { ModelOrmEntity } from '../entities/model.orm-entity';
import { ModelMapper } from '../mappers/model.mapper';

@Injectable()
export class ModelTypeOrmRepository implements ModelRepositoryPort {
  constructor(
    @InjectRepository(ModelOrmEntity)
    private readonly ormRepo: Repository<ModelOrmEntity>,
  ) {}

  async save(model: Model): Promise<void> {
    await this.ormRepo.save(ModelMapper.toOrm(model));
  }

  async findById(id: string): Promise<Model | null> {
    const orm = await this.ormRepo.findOneBy({ id });
    return orm ? ModelMapper.toDomain(orm) : null;
  }
}
