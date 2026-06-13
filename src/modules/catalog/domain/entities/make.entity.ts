// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, HTTP types, or DTOs
//
// This is a PLAIN TypeScript class. No decorators, no framework coupling.
// It can be instantiated in a unit test with zero dependencies.
// =============================================================================

/**
 * Make — the top of the hierarchy (e.g. "Honda", "Yamaha").
 *
 * This class holds identity + data only. Make has no invariants beyond
 * what the type system already enforces, so its constructor is simple.
 * Business rules belong here when they exist (see Variant for examples).
 */
export class Make {
  constructor(
    public readonly id: string,
    public readonly name: string,
    public readonly countryOfOrigin: string,
  ) {}
}
