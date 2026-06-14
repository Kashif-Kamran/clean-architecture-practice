// =============================================================================
// MODULE: Auth
//
// Owns authentication flows (register, login, JWT issuance) and the HTTP guard.
// Does NOT own the User aggregate — that lives in UserModule. Instead, AuthModule
// imports UserModule and receives USER_REPOSITORY via NestJS's module system.
//
// This is the same pattern as BookingsModule importing CatalogModule:
//   AuthModule ──imports──▶ UserModule ──provides──▶ USER_REPOSITORY
//
// Auth use cases inject @Inject(USER_REPOSITORY) as normal; the binding just
// comes from an imported module rather than being declared here.
//
// @Global() makes JwtStrategy and JwtAuthGuard available app-wide without
// every feature module needing to import AuthModule.
// =============================================================================

import { Global, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

// UserModule provides USER_REPOSITORY — auth doesn't re-declare it
import { UserModule } from '../user/user.module';

// Services
import { BcryptPasswordHasher } from './infrastructure/services/bcrypt-password-hasher';
import { JwtTokenService } from './infrastructure/services/jwt-token-service';
import { PASSWORD_HASHER } from './application/ports/password-hasher.port';
import { TOKEN_SERVICE } from './application/ports/token-service.port';

// Use cases
import { RegisterUseCase } from './application/use-cases/register.use-case';
import { LoginUseCase } from './application/use-cases/login.use-case';
import { GetCurrentUserUseCase } from './application/use-cases/get-current-user.use-case';

// HTTP
import { JwtStrategy } from './infrastructure/http/strategies/jwt.strategy';
import { JwtAuthGuard } from './infrastructure/http/guards/jwt-auth.guard';
import { AuthController } from './infrastructure/http/controllers/auth.controller';

@Global()
@Module({
  imports: [
    // USER_REPOSITORY + GetUserByIdUseCase become available to this module's providers
    UserModule,

    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET', 'change-me-in-production'),
        signOptions: {
          // Cast needed: ConfigService returns `string` but @nestjs/jwt expects
          // a branded ms.StringValue — the value is valid at runtime.
          expiresIn: config.get('JWT_EXPIRES_IN', '7d') as any,
        },
      }),
    }),
  ],
  providers: [
    // Auth-specific adapter bindings
    { provide: PASSWORD_HASHER, useClass: BcryptPasswordHasher },
    { provide: TOKEN_SERVICE,   useClass: JwtTokenService },

    // Use cases — USER_REPOSITORY is resolved from UserModule's export
    RegisterUseCase,
    LoginUseCase,
    GetCurrentUserUseCase,

    JwtStrategy,
    JwtAuthGuard,
  ],
  controllers: [AuthController],
  exports: [JwtAuthGuard, GetCurrentUserUseCase],
})
export class AuthModule {}
