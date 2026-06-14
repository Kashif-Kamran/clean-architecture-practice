// =============================================================================
// LAYER: Application (port)
// MAY IMPORT: domain entities only
// MUST NOT IMPORT: NestJS, TypeORM, ORM entities, HTTP types, or infrastructure
// =============================================================================

import { Variant } from '../../domain/entities/variant.entity';

// ── Read model ────────────────────────────────────────────────────────────────
// A read model is a plain data interface shaped for ONE specific query.
// It is NOT a domain entity — it has no behaviour, no invariants.
// It lives in the application layer because the application defines what it
// needs; the infrastructure layer decides how to fetch it (a JOIN, a view, etc).
//
// Compare to Variant (domain entity): Variant enforces rules and is used for
// writes. VariantDetail is assembled from three tables and used for reads only.
// This separation is the lightweight CQRS pattern.
export interface VariantDetail {
  id: string;
  name: string;
  year: number;
  engineCc: number;
  priceMsrp: number;
  model: {
    id: string;
    name: string;
    bodyType: string;
    yearIntroduced: number;
    make: {
      id: string;
      name: string;
      countryOfOrigin: string;
    };
  };
}

// ── Port ──────────────────────────────────────────────────────────────────────
export interface VariantRepositoryPort {
  // Write path — works with domain entities
  save(variant: Variant): Promise<void>;

  // Read paths
  findById(id: string): Promise<Variant | null>;
  findByModelId(modelId: string): Promise<Variant[]>;

  // Populated read — returns a read model, not a domain entity.
  // The repository implements this with a single JOIN across three tables.
  // The use case and everything above it see only this flat contract.
  findDetailById(id: string): Promise<VariantDetail | null>;
}

export const VARIANT_REPOSITORY = Symbol('VARIANT_REPOSITORY');
