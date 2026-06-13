// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: domain entities (to convert from)
// MUST NOT IMPORT: application use cases, TypeORM, ORM entities
// =============================================================================

import { Model } from '../../../domain/entities/model.entity';

export class ModelResponseDto {
  id!: string;
  makeId!: string;
  name!: string;
  bodyType!: string;
  yearIntroduced!: number;

  static fromDomain(model: Model): ModelResponseDto {
    const dto = new ModelResponseDto();
    dto.id = model.id;
    dto.makeId = model.makeId;
    dto.name = model.name;
    dto.bodyType = model.bodyType;
    dto.yearIntroduced = model.yearIntroduced;
    return dto;
  }
}
