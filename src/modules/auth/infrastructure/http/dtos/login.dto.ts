// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: class-validator, class-transformer
// MUST NOT IMPORT: domain entities, application use cases, TypeORM
// =============================================================================

import { IsEmail, IsString } from 'class-validator';

export class LoginDto {
  @IsEmail()
  email!: string;

  @IsString()
  password!: string;
}
