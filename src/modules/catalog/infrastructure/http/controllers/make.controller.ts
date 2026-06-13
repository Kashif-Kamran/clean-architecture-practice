// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: NestJS HTTP decorators, DTOs, application use cases
// MUST NOT IMPORT: domain entities directly, TypeORM, ORM entities, mappers
//
// CONTROLLERS ARE THIN. The only logic here is:
//   1. Receive a validated DTO from NestJS (class-validator ran in the pipe)
//   2. Call the use case
//   3. Map the domain result to a response DTO
//   4. Return it (NestJS serialises to JSON)
//
// If you find yourself writing an if-statement here, it belongs in a use case.
// =============================================================================

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateMakeUseCase } from '../../../application/use-cases/create-make.use-case';
import { CreateMakeDto } from '../dtos/create-make.dto';
import { MakeResponseDto } from '../dtos/make-response.dto';

@Controller('makes')
export class MakeController {
  constructor(private readonly createMake: CreateMakeUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateMakeDto): Promise<MakeResponseDto> {
    const make = await this.createMake.execute({
      name: dto.name,
      countryOfOrigin: dto.countryOfOrigin,
    });
    return MakeResponseDto.fromDomain(make);
  }
}
