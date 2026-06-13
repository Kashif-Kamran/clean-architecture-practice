// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: domain entities (to convert from)
// MUST NOT IMPORT: application use cases, TypeORM, ORM entities
// =============================================================================

import { Make } from '../../../domain/entities/make.entity';

export class MakeResponseDto {
  id!: string;
  name!: string;
  countryOfOrigin!: string;

  static fromDomain(make: Make): MakeResponseDto {
    const dto = new MakeResponseDto();
    dto.id = make.id;
    dto.name = make.name;
    dto.countryOfOrigin = make.countryOfOrigin;
    return dto;
  }
}
