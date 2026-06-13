// =============================================================================
// LAYER: Infrastructure (module wiring)
// This file is the COMPOSITION ROOT for the catalog feature slice.
// It is the ONLY place where ports are bound to adapters.
//
// Read this file to understand the entire dependency graph at a glance.
// =============================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ── ORM entities (TypeORM needs to know about these tables) ────────────────
import { MakeOrmEntity } from './infrastructure/persistence/entities/make.orm-entity';
import { ModelOrmEntity } from './infrastructure/persistence/entities/model.orm-entity';
import { VariantOrmEntity } from './infrastructure/persistence/entities/variant.orm-entity';

// ── Adapters (implement the ports) ─────────────────────────────────────────
import { MakeTypeOrmRepository } from './infrastructure/persistence/repositories/make.typeorm-repository';
import { ModelTypeOrmRepository } from './infrastructure/persistence/repositories/model.typeorm-repository';
import { VariantTypeOrmRepository } from './infrastructure/persistence/repositories/variant.typeorm-repository';

// ── DI tokens (Symbols that decouple use cases from adapter classes) ────────
import {
  MAKE_REPOSITORY,
} from './application/ports/make-repository.port';
import {
  MODEL_REPOSITORY,
} from './application/ports/model-repository.port';
import {
  VARIANT_REPOSITORY,
} from './application/ports/variant-repository.port';

// ── Use cases (plain classes, no @Injectable — wired via factories below) ──
import { CreateMakeUseCase } from './application/use-cases/create-make.use-case';
import { CreateModelUseCase } from './application/use-cases/create-model.use-case';
import { CreateVariantUseCase } from './application/use-cases/create-variant.use-case';
import { GetVariantByIdUseCase } from './application/use-cases/get-variant-by-id.use-case';
import { ListVariantsByModelUseCase } from './application/use-cases/list-variants-by-model.use-case';

// ── Controllers ─────────────────────────────────────────────────────────────
import { MakeController } from './infrastructure/http/controllers/make.controller';
import { ModelController } from './infrastructure/http/controllers/model.controller';
import { VariantController } from './infrastructure/http/controllers/variant.controller';

// ── Port types (for inject[] references below) ──────────────────────────────
import type { MakeRepositoryPort } from './application/ports/make-repository.port';
import type { ModelRepositoryPort } from './application/ports/model-repository.port';
import type { VariantRepositoryPort } from './application/ports/variant-repository.port';

@Module({
  imports: [
    // Register ORM entities for this module's TypeORM repositories
    TypeOrmModule.forFeature([MakeOrmEntity, ModelOrmEntity, VariantOrmEntity]),
  ],

  providers: [
    // ── STEP 1: Bind PORTS to ADAPTERS ──────────────────────────────────────
    //
    // MAKE_REPOSITORY is a Symbol token. When something asks for MAKE_REPOSITORY,
    // NestJS injects an instance of MakeTypeOrmRepository.
    // The use case only ever sees the MakeRepositoryPort interface — it never
    // knows that TypeORM is involved.
    {
      provide: MAKE_REPOSITORY,
      useClass: MakeTypeOrmRepository,
    },
    {
      provide: MODEL_REPOSITORY,
      useClass: ModelTypeOrmRepository,
    },
    {
      provide: VARIANT_REPOSITORY,
      useClass: VariantTypeOrmRepository,
    },

    // ── STEP 2: Wire USE CASES with factory providers ───────────────────────
    //
    // Use cases are plain classes with NO @Injectable().
    // useFactory lets us instantiate them while injecting the repository tokens.
    // The `inject` array tells NestJS which providers to resolve and pass as
    // arguments to the factory function, in order.
    {
      provide: CreateMakeUseCase,
      useFactory: (makeRepo: MakeRepositoryPort) =>
        new CreateMakeUseCase(makeRepo),
      inject: [MAKE_REPOSITORY],
    },
    {
      provide: CreateModelUseCase,
      useFactory: (makeRepo: MakeRepositoryPort, modelRepo: ModelRepositoryPort) =>
        new CreateModelUseCase(makeRepo, modelRepo),
      inject: [MAKE_REPOSITORY, MODEL_REPOSITORY],
    },
    {
      provide: CreateVariantUseCase,
      useFactory: (
        modelRepo: ModelRepositoryPort,
        variantRepo: VariantRepositoryPort,
      ) => new CreateVariantUseCase(modelRepo, variantRepo),
      inject: [MODEL_REPOSITORY, VARIANT_REPOSITORY],
    },
    {
      provide: GetVariantByIdUseCase,
      useFactory: (variantRepo: VariantRepositoryPort) =>
        new GetVariantByIdUseCase(variantRepo),
      inject: [VARIANT_REPOSITORY],
    },
    {
      provide: ListVariantsByModelUseCase,
      useFactory: (
        modelRepo: ModelRepositoryPort,
        variantRepo: VariantRepositoryPort,
      ) => new ListVariantsByModelUseCase(modelRepo, variantRepo),
      inject: [MODEL_REPOSITORY, VARIANT_REPOSITORY],
    },
  ],

  controllers: [MakeController, ModelController, VariantController],
})
export class CatalogModule {}
