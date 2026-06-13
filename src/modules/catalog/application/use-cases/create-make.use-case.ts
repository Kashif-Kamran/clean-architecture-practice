// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: domain entities, domain errors, application ports
// MUST NOT IMPORT: NestJS decorators, TypeORM, HTTP types, ORM entities
//
// A USE CASE orchestrates domain objects and ports to fulfill ONE user intent.
// It contains NO business rules (those live in domain entities).
// It contains NO infrastructure code (that lives in the adapter/repository).
//
// Notice: no @Injectable() here. This class is a plain TS class.
// NestJS DI is wired in catalog.module.ts using a factory provider.
// =============================================================================

import { randomUUID } from 'crypto'; // Node built-in — not a framework import
import { Make } from '../../domain/entities/make.entity';
import { MakeRepositoryPort } from '../ports/make-repository.port';

export interface CreateMakeInput {
  name: string;
  countryOfOrigin: string;
}

export class CreateMakeUseCase {
  // The use case depends on the PORT (interface), never on the adapter (class).
  constructor(private readonly makeRepo: MakeRepositoryPort) {}

  async execute(input: CreateMakeInput): Promise<Make> {
    const make = new Make(randomUUID(), input.name, input.countryOfOrigin);

    await this.makeRepo.save(make);

    return make;
  }
}
