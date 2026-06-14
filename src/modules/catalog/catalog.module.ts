// =============================================================================
// COMPOSITION ROOT for the catalog feature slice.
//
// With @Injectable() on use cases, providers[] lists classes directly —
// NestJS reads the @Inject(TOKEN) decorators on each constructor and resolves
// dependencies automatically. No factory functions, no manual `new` calls.
// =============================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// ── ORM entities ─────────────────────────────────────────────────────────────
import { MakeOrmEntity }    from './infrastructure/persistence/entities/make.orm-entity';
import { ModelOrmEntity }   from './infrastructure/persistence/entities/model.orm-entity';
import { VariantOrmEntity } from './infrastructure/persistence/entities/variant.orm-entity';

// ── Adapters (port → implementation) ─────────────────────────────────────────
import { MakeTypeOrmRepository }    from './infrastructure/persistence/repositories/make.typeorm-repository';
import { ModelTypeOrmRepository }   from './infrastructure/persistence/repositories/model.typeorm-repository';
import { VariantTypeOrmRepository } from './infrastructure/persistence/repositories/variant.typeorm-repository';

// ── DI tokens ────────────────────────────────────────────────────────────────
import { MAKE_REPOSITORY }    from './application/ports/make-repository.port';
import { MODEL_REPOSITORY }   from './application/ports/model-repository.port';
import { VARIANT_REPOSITORY } from './application/ports/variant-repository.port';

// ── Use cases ────────────────────────────────────────────────────────────────
import { CreateMakeUseCase }          from './application/use-cases/create-make.use-case';
import { CreateModelUseCase }         from './application/use-cases/create-model.use-case';
import { CreateVariantUseCase }       from './application/use-cases/create-variant.use-case';
import { GetVariantByIdUseCase }      from './application/use-cases/get-variant-by-id.use-case';
import { GetVariantDetailUseCase }    from './application/use-cases/get-variant-detail.use-case';
import { ListVariantsByModelUseCase } from './application/use-cases/list-variants-by-model.use-case';

// ── Controllers ───────────────────────────────────────────────────────────────
import { MakeController }    from './infrastructure/http/controllers/make.controller';
import { ModelController }   from './infrastructure/http/controllers/model.controller';
import { VariantController } from './infrastructure/http/controllers/variant.controller';

@Module({
  imports: [
    TypeOrmModule.forFeature([MakeOrmEntity, ModelOrmEntity, VariantOrmEntity]),
  ],

  providers: [
    // ── Step 1: bind each port Symbol to its adapter class ───────────────────
    { provide: MAKE_REPOSITORY,    useClass: MakeTypeOrmRepository },
    { provide: MODEL_REPOSITORY,   useClass: ModelTypeOrmRepository },
    { provide: VARIANT_REPOSITORY, useClass: VariantTypeOrmRepository },

    // ── Step 2: register use cases — NestJS resolves @Inject() automatically ─
    CreateMakeUseCase,
    CreateModelUseCase,
    CreateVariantUseCase,
    GetVariantByIdUseCase,
    GetVariantDetailUseCase,
    ListVariantsByModelUseCase,
  ],

  controllers: [MakeController, ModelController, VariantController],

  exports: [GetVariantByIdUseCase, GetVariantDetailUseCase],
})
export class CatalogModule {}
