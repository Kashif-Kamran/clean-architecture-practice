// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: NestJS HTTP decorators, DTOs, application use cases
// MUST NOT IMPORT: domain entities directly, TypeORM, ORM entities, mappers
// =============================================================================

import {
  Body,
  Controller,
  Get,
  HttpCode,
  HttpStatus,
  Param,
  Post,
} from '@nestjs/common';
import { CreateVariantUseCase } from '../../../application/use-cases/create-variant.use-case';
import { GetVariantByIdUseCase } from '../../../application/use-cases/get-variant-by-id.use-case';
import { GetVariantDetailUseCase } from '../../../application/use-cases/get-variant-detail.use-case';
import { CreateVariantDto } from '../dtos/create-variant.dto';
import { VariantResponseDto } from '../dtos/variant-response.dto';
import { VariantDetailResponseDto } from '../dtos/variant-detail-response.dto';

@Controller('variants')
export class VariantController {
  constructor(
    private readonly createVariant: CreateVariantUseCase,
    private readonly getVariantById: GetVariantByIdUseCase,
    private readonly getVariantDetail: GetVariantDetailUseCase,
  ) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateVariantDto): Promise<VariantResponseDto> {
    const variant = await this.createVariant.execute({
      modelId: dto.modelId,
      name: dto.name,
      year: dto.year,
      engineCc: dto.engineCc,
      priceMsrp: dto.priceMsrp,
    });
    return VariantResponseDto.fromDomain(variant);
  }

  // Flat response — just the Variant domain entity fields.
  @Get(':id')
  async findOne(@Param('id') id: string): Promise<VariantResponseDto> {
    const variant = await this.getVariantById.execute({ id });
    return VariantResponseDto.fromDomain(variant);
  }

  // Populated response — Variant + Model + Make in one query (read model).
  // Separate endpoint so callers can choose the weight of the response they need.
  @Get(':id/detail')
  async findDetail(@Param('id') id: string): Promise<VariantDetailResponseDto> {
    const detail = await this.getVariantDetail.execute(id);
    return VariantDetailResponseDto.fromReadModel(detail);
  }
}
