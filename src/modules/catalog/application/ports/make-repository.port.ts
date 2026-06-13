// =============================================================================
// LAYER: Application (port — the "left side" of a port/adapter pair)
// MAY IMPORT: domain entities only
// MUST NOT IMPORT: NestJS, TypeORM, ORM entities, HTTP types, or infrastructure
//
// A PORT is a contract (interface) defined by the APPLICATION layer.
// It describes what the application NEEDS from the outside world,
// in the application's own language (domain objects).
//
// The ADAPTER (TypeORM repository in infrastructure/) implements this interface.
// The use case depends ONLY on this interface, never on the adapter.
// This means we can swap PostgreSQL for SQLite or an in-memory map without
// changing a single line of use-case code.
// =============================================================================

import { Make } from '../../domain/entities/make.entity';

export interface MakeRepositoryPort {
  save(make: Make): Promise<void>;
  findById(id: string): Promise<Make | null>;
}

/** DI token — a Symbol is used instead of a class so the use case file
 *  never imports a concrete implementation (which would violate the rule). */
export const MAKE_REPOSITORY = Symbol('MAKE_REPOSITORY');
