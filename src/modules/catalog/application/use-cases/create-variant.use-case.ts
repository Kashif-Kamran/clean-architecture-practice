// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: domain entities, domain errors, application ports
// MUST NOT IMPORT: NestJS decorators, TypeORM, HTTP types, ORM entities
// =============================================================================

import { randomUUID } from 'crypto';
import { Variant } from '../../domain/entities/variant.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { ModelRepositoryPort } from '../ports/model-repository.port';
import { VariantRepositoryPort } from '../ports/variant-repository.port';

export interface CreateVariantInput {
  modelId: string;
  name: string;
  year: number;
  engineCc: number;
  priceMsrp: number;
}

export class CreateVariantUseCase {
  constructor(
    private readonly modelRepo: ModelRepositoryPort,
    private readonly variantRepo: VariantRepositoryPort,
  ) {}

  async execute(input: CreateVariantInput): Promise<Variant> {
    // Orchestration: ensure the referenced Model exists.
    const model = await this.modelRepo.findById(input.modelId);
    if (!model) {
      throw new NotFoundError('Model', input.modelId);
    }

    // Domain entity constructor enforces all three Variant invariants:
    //   - engineCc > 0         → InvalidVariantError
    //   - priceMsrp >= 0       → InvalidVariantError
    //   - year in valid range  → InvalidVariantError
    //
    // If any rule is violated, execution stops here with a DomainError.
    // The use case does NOT catch it — it lets it propagate to the controller,
    // which maps it to a 400 HTTP response via the global exception filter.
    const variant = new Variant(
      randomUUID(),
      input.modelId,
      input.name,
      input.year,
      input.engineCc,    // ← throws if <= 0
      input.priceMsrp,   // ← throws if < 0
    );

    await this.variantRepo.save(variant);

    return variant;
  }
}
