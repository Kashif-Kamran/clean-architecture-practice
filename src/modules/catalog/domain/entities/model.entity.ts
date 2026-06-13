// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, HTTP types, or DTOs
// =============================================================================

import { InvalidModelError } from '../errors/invalid-model.error';

/**
 * Model — a product line under a Make (e.g. "CBR650R" under "Honda").
 *
 * Business rule: a Model's name cannot be empty.
 * The rule lives HERE, not in a service or controller, because:
 *   - It's always true regardless of how or where the model is created.
 *   - It can be tested without starting NestJS or a database.
 */
export class Model {
  constructor(
    public readonly id: string,
    public readonly makeId: string,
    public readonly name: string,
    public readonly bodyType: string,
    public readonly yearIntroduced: number,
  ) {
    // ← BUSINESS RULE enforced at construction time
    if (!name || name.trim().length === 0) {
      throw new InvalidModelError('name', 'must not be empty');
    }
  }
}
