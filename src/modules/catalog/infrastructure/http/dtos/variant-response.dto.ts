// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: domain entities (to convert from)
// MUST NOT IMPORT: application use cases, TypeORM, ORM entities
// =============================================================================

import { Variant } from '../../../domain/entities/variant.entity';

export class VariantResponseDto {
  id!: string;
  modelId!: string;
  name!: string;
  year!: number;
  engineCc!: number;
  priceMsrp!: number;

  static fromDomain(variant: Variant): VariantResponseDto {
    const dto = new VariantResponseDto();
    dto.id = variant.id;
    dto.modelId = variant.modelId;
    dto.name = variant.name;
    dto.year = variant.year;
    dto.engineCc = variant.engineCc;
    dto.priceMsrp = variant.priceMsrp;
    return dto;
  }
}
