// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: class-validator, class-transformer
// MUST NOT IMPORT: domain entities, application use cases, TypeORM
//
// DTOs carry HTTP request data. They are NOT domain objects.
// class-validator decorators live here (not in domain entities).
// The `!` (definite assignment assertion) tells TypeScript that NestJS's
// ValidationPipe/class-transformer will populate these before use.
// =============================================================================

import { IsNotEmpty, IsString, MaxLength } from 'class-validator';

export class CreateMakeDto {
  @IsString()
  @IsNotEmpty()
  @MaxLength(120)
  name!: string;

  @IsString()
  @IsNotEmpty()
  @MaxLength(80)
  countryOfOrigin!: string;
}
