// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: class-validator, class-transformer
// MUST NOT IMPORT: domain entities, application use cases, TypeORM
// =============================================================================

import { IsInt, IsNotEmpty, IsString, IsUUID, Max, MaxLength, Min } from 'class-validator';

export class CreateModelDto {
  @IsUUID()
  makeId!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(60)
  bodyType!: string;

  @IsInt()
  @Min(1885)
  @Max(2100)
  yearIntroduced!: number;
}
