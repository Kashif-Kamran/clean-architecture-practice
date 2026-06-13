// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: domain entities, domain errors, application ports
// MUST NOT IMPORT: NestJS decorators, TypeORM, HTTP types, ORM entities
// =============================================================================

import { Variant } from '../../domain/entities/variant.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ModelRepositoryPort } from '../ports/model-repository.port';
import { VariantRepositoryPort } from '../ports/variant-repository.port';

export interface ListVariantsByModelInput {
  modelId: string;
}

export class ListVariantsByModelUseCase {
  constructor(
    private readonly modelRepo: ModelRepositoryPort,
    private readonly variantRepo: VariantRepositoryPort,
  ) {}

  async execute(input: ListVariantsByModelInput): Promise<Variant[]> {
    // Verify the model exists before querying its variants.
    const model = await this.modelRepo.findById(input.modelId);
    if (!model) {
      throw new NotFoundError('Model', input.modelId);
    }

    return this.variantRepo.findByModelId(input.modelId);
  }
}
