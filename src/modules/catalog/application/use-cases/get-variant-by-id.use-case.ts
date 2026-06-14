// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: @Injectable/@Inject from @nestjs/common (DI metadata only),
//             domain entities, domain errors, application ports
// MUST NOT IMPORT: TypeORM, HTTP decorators, ORM entities
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { Variant } from '../../domain/entities/variant.entity';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { VARIANT_REPOSITORY, type VariantRepositoryPort } from '../ports/variant-repository.port';

export interface GetVariantByIdInput {
  id: string;
}

@Injectable()
export class GetVariantByIdUseCase {
  constructor(
    @Inject(VARIANT_REPOSITORY) private readonly variantRepo: VariantRepositoryPort,
  ) {}

  async execute(input: GetVariantByIdInput): Promise<Variant> {
    const variant = await this.variantRepo.findById(input.id);
    if (!variant) throw new NotFoundError('Variant', input.id);
    return variant;
  }
}
