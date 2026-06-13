// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: NestJS HTTP decorators, DTOs, application use cases
// MUST NOT IMPORT: domain entities directly, TypeORM, ORM entities, mappers
// =============================================================================

import { Body, Controller, Get, HttpCode, HttpStatus, Param, Post } from '@nestjs/common';
import { CreateModelUseCase } from '../../../application/use-cases/create-model.use-case';
import { ListVariantsByModelUseCase } from '../../../application/use-cases/list-variants-by-model.use-case';
import { CreateModelDto } from '../dtos/create-model.dto';
import { ModelResponseDto } from '../dtos/model-response.dto';
import { VariantResponseDto } from '../dtos/variant-response.dto';

@Controller('models')
export class ModelController {
  constructor(
    private readonly createModel: CreateModelUseCase,
    private readonly listVariantsByModel: ListVariantsByModelUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateModelDto): Promise<ModelResponseDto> {
    const model = await this.createModel.execute({
      makeId: dto.makeId,
      name: dto.name,
      bodyType: dto.bodyType,
      yearIntroduced: dto.yearIntroduced,
    });
    return ModelResponseDto.fromDomain(model);
  }

  @Get(':modelId/variants')
  async listVariants(
    @Param('modelId') modelId: string,
  ): Promise<VariantResponseDto[]> {
    const variants = await this.listVariantsByModel.execute({ modelId });
    return variants.map(VariantResponseDto.fromDomain);
  }
}
