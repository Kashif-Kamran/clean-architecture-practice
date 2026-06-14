import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserModule } from './modules/user/user.module';
import { AuthModule } from './modules/auth/auth.module';
import { CatalogModule } from './modules/catalog/catalog.module';
import { BookingsModule } from './modules/bookings/bookings.module';

@Module({
  imports: [
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
        // autoLoadEntities: each feature module registers its own ORM entities
        // via TypeOrmModule.forFeature() — no manual entity list needed here.
        autoLoadEntities: true,
        // ⚠️  synchronize: true auto-creates/alters tables from entity definitions.
        // NEVER use this in production — use TypeORM migrations instead.
        synchronize: true,
      }),
    }),

    UserModule,
    AuthModule,
    CatalogModule,
    BookingsModule,
  ],
})
export class AppModule {}
