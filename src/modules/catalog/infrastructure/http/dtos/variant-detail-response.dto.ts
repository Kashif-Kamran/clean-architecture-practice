// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: application read models (to convert from)
// MUST NOT IMPORT: application use cases, TypeORM, ORM entities, domain entities
// =============================================================================

import { VariantDetail } from '../../../application/ports/variant-repository.port';

export class VariantDetailResponseDto {
  id!: string;
  name!: string;
  year!: number;
  engineCc!: number;
  priceMsrp!: number;
  model!: {
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

  static fromReadModel(detail: VariantDetail): VariantDetailResponseDto {
    const dto = new VariantDetailResponseDto();
    dto.id        = detail.id;
    dto.name      = detail.name;
    dto.year      = detail.year;
    dto.engineCc  = detail.engineCc;
    dto.priceMsrp = detail.priceMsrp;
    dto.model     = {
      id:             detail.model.id,
      name:           detail.model.name,
      bodyType:       detail.model.bodyType,
      yearIntroduced: detail.model.yearIntroduced,
      make: {
        id:              detail.model.make.id,
        name:            detail.model.make.name,
        countryOfOrigin: detail.model.make.countryOfOrigin,
      },
    };
    return dto;
  }
}
