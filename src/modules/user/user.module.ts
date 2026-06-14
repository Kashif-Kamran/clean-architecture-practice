// =============================================================================
// MODULE: User
//
// Owns the User aggregate: domain entity, repository port, TypeORM adapter,
// and user-query use cases. Other modules that need to read or write users
// import this module and receive the USER_REPOSITORY binding + exported use cases.
//
// AuthModule is the primary consumer — it imports UserModule to gain access
// to USER_REPOSITORY for its register/login/get-current-user use cases.
// The pattern mirrors BookingsModule importing CatalogModule.
// =============================================================================

import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { UserOrmEntity } from './infrastructure/persistence/entities/user.orm-entity';
import { UserTypeOrmRepository } from './infrastructure/persistence/repositories/user.typeorm-repository';
import { USER_REPOSITORY } from './application/ports/user-repository.port';
import { GetUserByIdUseCase } from './application/use-cases/get-user-by-id.use-case';

@Module({
  imports: [TypeOrmModule.forFeature([UserOrmEntity])],
  providers: [
    // Adapter binding — the only place that maps the port Symbol to a class
    { provide: USER_REPOSITORY, useClass: UserTypeOrmRepository },

    GetUserByIdUseCase,
  ],
  exports: [
    // Export the binding so importing modules can inject USER_REPOSITORY.
    // Exporting the Symbol re-exports the entire provider (token + implementation).
    USER_REPOSITORY,

    // Export the use case so other modules (e.g. an admin module) can call it
    // without knowing how user persistence works internally.
    GetUserByIdUseCase,
  ],
})
export class UserModule {}
