// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: class-validator, class-transformer
// MUST NOT IMPORT: domain entities, application use cases, TypeORM
// =============================================================================

import { IsEmail, IsString, MinLength } from 'class-validator';

export class RegisterDto {
  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;
}
