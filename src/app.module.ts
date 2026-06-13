import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CatalogModule } from './modules/catalog/catalog.module';

// ORM entities — TypeORM needs them at the root level for schema sync
import { MakeOrmEntity } from './modules/catalog/infrastructure/persistence/entities/make.orm-entity';
import { ModelOrmEntity } from './modules/catalog/infrastructure/persistence/entities/model.orm-entity';
import { VariantOrmEntity } from './modules/catalog/infrastructure/persistence/entities/variant.orm-entity';

@Module({
  imports: [
    // Load .env into process.env; isGlobal means no need to import ConfigModule elsewhere
    ConfigModule.forRoot({ isGlobal: true }),

    TypeOrmModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        type: 'postgres',
        host: config.get<string>('DB_HOST', 'localhost'),
        port: config.get<number>('DB_PORT', 5432),
        username: config.get<string>('DB_USERNAME', 'postgres'),
        password: config.get<string>('DB_PASSWORD', 'postgres'),
        database: config.get<string>('DB_DATABASE', 'bikebook'),
        entities: [MakeOrmEntity, ModelOrmEntity, VariantOrmEntity],
        // ⚠️  synchronize: true auto-creates/alters tables from entity definitions.
        // NEVER use this in production — it can silently drop columns.
        // Use migrations instead (TypeORM `migration:generate` / `migration:run`).
        synchronize: true,
      }),
    }),

    CatalogModule,
  ],
})
export class AppModule {}
