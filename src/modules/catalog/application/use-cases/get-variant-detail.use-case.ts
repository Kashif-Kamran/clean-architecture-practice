// =============================================================================
// LAYER: Application (use case — query)
// MAY IMPORT: @Injectable/@Inject from @nestjs/common (DI metadata only),
//             domain errors, application ports
// MUST NOT IMPORT: TypeORM, HTTP decorators, ORM entities
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { NotFoundError } from '../../domain/errors/not-found.error';
import { VARIANT_REPOSITORY, type VariantDetail, type VariantRepositoryPort } from '../ports/variant-repository.port';

@Injectable()
export class GetVariantDetailUseCase {
  constructor(
    @Inject(VARIANT_REPOSITORY) private readonly variantRepo: VariantRepositoryPort,
  ) {}

  async execute(id: string): Promise<VariantDetail> {
    const detail = await this.variantRepo.findDetailById(id);
    if (!detail) throw new NotFoundError('Variant', id);
    return detail;
  }
}
