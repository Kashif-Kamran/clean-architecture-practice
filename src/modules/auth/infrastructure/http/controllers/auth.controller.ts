// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: NestJS HTTP decorators, DTOs, application use cases, guards
// MUST NOT IMPORT: domain entities directly, TypeORM, ORM entities, mappers
//
// CONTROLLERS ARE THIN:
//   1. Receive a validated DTO (ValidationPipe ran class-validator already)
//   2. Call the use case
//   3. Map the result to a response DTO
//   4. Return it
// =============================================================================

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Post,
  UseGuards,
} from '@nestjs/common';
import { RegisterUseCase } from '../../../application/use-cases/register.use-case';
import { LoginUseCase } from '../../../application/use-cases/login.use-case';
import { GetCurrentUserUseCase } from '../../../application/use-cases/get-current-user.use-case';
import { RegisterDto } from '../dtos/register.dto';
import { LoginDto } from '../dtos/login.dto';
import { AuthResponseDto, MeResponseDto } from '../dtos/auth-response.dto';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { CurrentUser } from '../decorators/current-user.decorator';
import type { TokenPayload } from '../../../application/ports/token-service.port';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly register: RegisterUseCase,
    private readonly login: LoginUseCase,
    private readonly getCurrentUser: GetCurrentUserUseCase,
  ) {}

  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  async registerUser(@Body() dto: RegisterDto): Promise<AuthResponseDto> {
    const result = await this.register.execute({
      email: dto.email,
      password: dto.password,
    });
    return AuthResponseDto.from(result);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  async loginUser(@Body() dto: LoginDto): Promise<AuthResponseDto> {
    const result = await this.login.execute({
      email: dto.email,
      password: dto.password,
    });
    return AuthResponseDto.from(result);
  }

  /** Protected route — demonstrates JwtAuthGuard + @CurrentUser() in action. */
  @Get('me')
  @UseGuards(JwtAuthGuard)
  async me(@CurrentUser() token: TokenPayload): Promise<MeResponseDto> {
    // Use case does the DB lookup — guard only verified the JWT signature.
    const user = await this.getCurrentUser.execute(token.sub);
    return MeResponseDto.fromDomain(user);
  }
}
