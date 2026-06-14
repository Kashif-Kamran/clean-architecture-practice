// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: @Injectable/@Inject from @nestjs/common (DI metadata only),
//             domain entities, domain errors, application ports
// MUST NOT IMPORT: TypeORM, HTTP decorators, ORM entities
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Model } from '../../domain/entities/model.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { MAKE_REPOSITORY, type MakeRepositoryPort } from '../ports/make-repository.port';
import { MODEL_REPOSITORY, type ModelRepositoryPort } from '../ports/model-repository.port';

export interface CreateModelInput {
  makeId: string;
  name: string;
  bodyType: string;
  yearIntroduced: number;
}

@Injectable()
export class CreateModelUseCase {
  constructor(
    @Inject(MAKE_REPOSITORY)  private readonly makeRepo: MakeRepositoryPort,
    @Inject(MODEL_REPOSITORY) private readonly modelRepo: ModelRepositoryPort,
  ) {}

  async execute(input: CreateModelInput): Promise<Model> {
    const make = await this.makeRepo.findById(input.makeId);
    if (!make) throw new NotFoundError('Make', input.makeId);

    const model = new Model(
      randomUUID(),
      input.makeId,
      input.name,
      input.bodyType,
      input.yearIntroduced,
    );

    await this.modelRepo.save(model);
    return model;
  }
}
