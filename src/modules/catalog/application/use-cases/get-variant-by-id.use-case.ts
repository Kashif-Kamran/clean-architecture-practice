// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: domain entities, domain errors, application ports
// MUST NOT IMPORT: NestJS decorators, TypeORM, HTTP types, ORM entities
// =============================================================================

import { Variant } from '../../domain/entities/variant.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { VariantRepositoryPort } from '../ports/variant-repository.port';

export interface GetVariantByIdInput {
  id: string;
}

export class GetVariantByIdUseCase {
  constructor(private readonly variantRepo: VariantRepositoryPort) {}

  async execute(input: GetVariantByIdInput): Promise<Variant> {
    const variant = await this.variantRepo.findById(input.id);
    if (!variant) {
      throw new NotFoundError('Variant', input.id);
    }
    return variant;
  }
}
