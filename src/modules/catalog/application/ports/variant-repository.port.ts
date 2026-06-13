// =============================================================================
// LAYER: Application (port)
// MAY IMPORT: domain entities only
// MUST NOT IMPORT: NestJS, TypeORM, ORM entities, HTTP types, or infrastructure
// =============================================================================

import { Variant } from '../../domain/entities/variant.entity';

export interface VariantRepositoryPort {
  save(variant: Variant): Promise<void>;
  findById(id: string): Promise<Variant | null>;
  findByModelId(modelId: string): Promise<Variant[]>;
}

export const VARIANT_REPOSITORY = Symbol('VARIANT_REPOSITORY');
