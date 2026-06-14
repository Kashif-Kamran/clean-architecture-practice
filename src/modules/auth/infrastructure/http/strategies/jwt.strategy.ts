// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: @nestjs/passport, passport-jwt, @nestjs/config, application ports
// MUST NOT IMPORT: domain entities, application use cases, TypeORM
//
// HOW PASSPORT-JWT WORKS:
//   1. JwtAuthGuard activates this strategy on every protected request.
//   2. ExtractJwt pulls the Bearer token from the Authorization header.
//   3. passport-jwt verifies the signature + expiry using JWT_SECRET.
//   4. validate() receives the already-decoded payload and returns whatever
//      should be set as req.user (the @CurrentUser() decorator reads from there).
//
// We return the raw payload — user existence is verified only in use cases
// that need it (e.g. GetCurrentUserUseCase), keeping this path fast.
// =============================================================================

import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { ConfigService } from '@nestjs/config';
import type { TokenPayload } from '../../../application/ports/token-service.port';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(config: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: config.get<string>('JWT_SECRET', 'change-me-in-production'),
    });
  }

  /** Called after signature + expiry are verified. Return value → req.user */
  validate(payload: TokenPayload): TokenPayload {
    return { sub: payload.sub, email: payload.email };
  }
}
