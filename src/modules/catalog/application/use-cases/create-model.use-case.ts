// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: domain entities, domain errors, application ports
// MUST NOT IMPORT: NestJS decorators, TypeORM, HTTP types, ORM entities
// =============================================================================

import { randomUUID } from 'crypto';
import { Model } from '../../domain/entities/model.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { MakeRepositoryPort } from '../ports/make-repository.port';
import { ModelRepositoryPort } from '../ports/model-repository.port';

export interface CreateModelInput {
  makeId: string;
  name: string;
  bodyType: string;
  yearIntroduced: number;
}

export class CreateModelUseCase {
  constructor(
    private readonly makeRepo: MakeRepositoryPort,
    private readonly modelRepo: ModelRepositoryPort,
  ) {}

  async execute(input: CreateModelInput): Promise<Model> {
    // Application-layer guard: verify the referenced Make exists.
    // This is ORCHESTRATION (use case responsibility), not a business rule.
    // The rule "a model must belong to a real make" is enforced here
    // because it requires a database call — domain entities must not do I/O.
    const make = await this.makeRepo.findById(input.makeId);
    if (!make) {
      throw new NotFoundError('Make', input.makeId);
    }

    // Domain entity constructor enforces "name must not be empty" (business rule).
    const model = new Model(
      randomUUID(),
      input.makeId,
      input.name, // ← InvalidModelError thrown here if empty
      input.bodyType,
      input.yearIntroduced,
    );

    await this.modelRepo.save(model);

    return model;
  }
}
