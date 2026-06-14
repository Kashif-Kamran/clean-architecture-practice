// =============================================================================
// LAYER: Infrastructure (service adapter)
// MAY IMPORT: @nestjs/jwt, application ports
// MUST NOT IMPORT: domain entities, application use cases, TypeORM
//
// This is the ADAPTER for TokenServicePort. @nestjs/jwt lives here so that
// the application layer never has a JWT dependency.
// =============================================================================

import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { TokenServicePort, type TokenPayload } from '../../application/ports/token-service.port';

@Injectable()
export class JwtTokenService implements TokenServicePort {
  constructor(private readonly jwtService: JwtService) {}

  generate(payload: TokenPayload): string {
    return this.jwtService.sign(payload);
  }

  verify(token: string): TokenPayload {
    return this.jwtService.verify<TokenPayload>(token);
  }
}
