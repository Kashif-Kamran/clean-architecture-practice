// =============================================================================
// LAYER: Infrastructure (persistence — adapter)
// MAY IMPORT: TypeORM, domain entities, ORM entities, mappers, application ports
// MUST NOT IMPORT: application use cases, HTTP controllers, request/response DTOs
//
// This is the ADAPTER for the MakeRepositoryPort.
// It translates the port's interface into actual SQL via TypeORM.
// The application layer has no idea this class exists — it only knows the port.
// =============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Make } from '../../../domain/entities/make.entity';
import { MakeRepositoryPort } from '../../../application/ports/make-repository.port';
import { MakeOrmEntity } from '../entities/make.orm-entity';
import { MakeMapper } from '../mappers/make.mapper';

@Injectable()
export class MakeTypeOrmRepository implements MakeRepositoryPort {
  constructor(
    @InjectRepository(MakeOrmEntity)
    private readonly ormRepo: Repository<MakeOrmEntity>,
  ) {}

  async save(make: Make): Promise<void> {
    // Map domain → ORM, then let TypeORM handle the SQL
    await this.ormRepo.save(MakeMapper.toOrm(make));
  }

  async findById(id: string): Promise<Make | null> {
    const orm = await this.ormRepo.findOneBy({ id });
    // Map ORM → domain (or null if not found)
    return orm ? MakeMapper.toDomain(orm) : null;
  }
}
