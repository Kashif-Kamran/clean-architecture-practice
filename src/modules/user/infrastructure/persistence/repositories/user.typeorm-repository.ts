// =============================================================================
// LAYER: Infrastructure (persistence — adapter)
// MAY IMPORT: TypeORM, domain entities, ORM entities, mappers, application ports
// MUST NOT IMPORT: application use cases, HTTP controllers, request/response DTOs
// =============================================================================

import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from '../../../domain/entities/user.entity';
import { UserRepositoryPort } from '../../../application/ports/user-repository.port';
import { UserOrmEntity } from '../entities/user.orm-entity';
import { UserMapper } from '../mappers/user.mapper';

@Injectable()
export class UserTypeOrmRepository implements UserRepositoryPort {
  constructor(
    @InjectRepository(UserOrmEntity)
    private readonly ormRepo: Repository<UserOrmEntity>,
  ) {}

  async save(user: User): Promise<void> {
    await this.ormRepo.save(UserMapper.toOrm(user));
  }

  async findByEmail(email: string): Promise<User | null> {
    const orm = await this.ormRepo.findOneBy({ email });
    return orm ? UserMapper.toDomain(orm) : null;
  }

  async findById(id: string): Promise<User | null> {
    const orm = await this.ormRepo.findOneBy({ id });
    return orm ? UserMapper.toDomain(orm) : null;
  }
}
