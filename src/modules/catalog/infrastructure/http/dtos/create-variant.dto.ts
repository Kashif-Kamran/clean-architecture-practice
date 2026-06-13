// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: class-validator, class-transformer
// MUST NOT IMPORT: domain entities, application use cases, TypeORM
//
// Note on validation overlap: class-validator runs BEFORE the use case.
// The domain entity constructor runs INSIDE the use case.
// Both validate engineCc > 0, but for different reasons:
//   - DTO validation: fast-fail at the HTTP boundary, good error messages
//   - Domain validation: correctness guarantee regardless of entry point
// This is intentional duplication, not a mistake.
// =============================================================================

import { IsInt, IsNotEmpty, IsNumber, IsString, IsUUID, Min } from 'class-validator';

export class CreateVariantDto {
  @IsUUID()
  modelId!: string;

  @IsString()
  @IsNotEmpty()
  name!: string;

  @IsInt()
  @Min(1885)
  year!: number;

  @IsInt()
  @Min(1)
  engineCc!: number;

  @IsNumber()
  @Min(0)
  priceMsrp!: number;
}
