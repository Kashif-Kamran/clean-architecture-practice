// =============================================================================
// LAYER: Domain
// MAY IMPORT: domain/errors only
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, HTTP types, or DTOs
// =============================================================================

import { InvalidVariantError } from '../errors/invalid-variant.error';

// The first year a motorcycle was produced (Daimler Reitwagen, 1885).
const FIRST_MOTORCYCLE_YEAR = 1885;

/**
 * Variant — a specific trim/year of a Model (e.g. "CBR650R Standard 2024").
 *
 * This is the richest domain entity because it has the most invariants.
 * ALL of the rules below are enforced in the constructor — they cannot be
 * violated no matter which route (HTTP, CLI, test) the object is created from.
 *
 * Rules:
 *   1. engineCc  > 0
 *   2. priceMsrp >= 0
 *   3. year in [1885, currentYear + 2]
 */
export class Variant {
  constructor(
    public readonly id: string,
    public readonly modelId: string,
    public readonly name: string,
    public readonly year: number,
    public readonly engineCc: number,
    public readonly priceMsrp: number,
  ) {
    // ← BUSINESS RULES — each throws a typed DomainError, never a generic Error
    if (engineCc <= 0) {
      throw new InvalidVariantError('engineCc', `must be > 0, got ${engineCc}`);
    }

    if (priceMsrp < 0) {
      throw new InvalidVariantError(
        'priceMsrp',
        `must be >= 0, got ${priceMsrp}`,
      );
    }

    const maxYear = new Date().getFullYear() + 2;
    if (year < FIRST_MOTORCYCLE_YEAR || year > maxYear) {
      throw new InvalidVariantError(
        'year',
        `must be between ${FIRST_MOTORCYCLE_YEAR} and ${maxYear}, got ${year}`,
      );
    }
  }
}
