// =============================================================================
// LAYER: Application (port)
// MAY IMPORT: domain entities only
// MUST NOT IMPORT: NestJS, TypeORM, ORM entities, HTTP types, or infrastructure
// =============================================================================

import { Model } from '../../domain/entities/model.entity';

export interface ModelRepositoryPort {
  save(model: Model): Promise<void>;
  findById(id: string): Promise<Model | null>;
}

export const MODEL_REPOSITORY = Symbol('MODEL_REPOSITORY');
