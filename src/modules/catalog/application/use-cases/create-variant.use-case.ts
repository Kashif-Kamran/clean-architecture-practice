// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: @Injectable/@Inject from @nestjs/common (DI metadata only),
//             domain entities, domain errors, application ports
// MUST NOT IMPORT: TypeORM, HTTP decorators, ORM entities
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Variant } from '../../domain/entities/variant.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { MODEL_REPOSITORY, type ModelRepositoryPort } from '../ports/model-repository.port';
import { VARIANT_REPOSITORY, type VariantRepositoryPort } from '../ports/variant-repository.port';

export interface CreateVariantInput {
  modelId: string;
  name: string;
  year: number;
  engineCc: number;
  priceMsrp: number;
}

@Injectable()
export class CreateVariantUseCase {
  constructor(
    @Inject(MODEL_REPOSITORY)   private readonly modelRepo: ModelRepositoryPort,
    @Inject(VARIANT_REPOSITORY) private readonly variantRepo: VariantRepositoryPort,
  ) {}

  async execute(input: CreateVariantInput): Promise<Variant> {
    const model = await this.modelRepo.findById(input.modelId);
    if (!model) throw new NotFoundError('Model', input.modelId);

    // Domain constructor enforces engineCc > 0, priceMsrp >= 0, year in range.
    const variant = new Variant(
      randomUUID(),
      input.modelId,
      input.name,
      input.year,
      input.engineCc,
      input.priceMsrp,
    );

    await this.variantRepo.save(variant);
    return variant;
  }
}
