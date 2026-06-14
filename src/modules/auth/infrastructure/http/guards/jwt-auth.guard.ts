// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: @nestjs/common, @nestjs/passport
//
// Thin wrapper around Passport's 'jwt' strategy.
// Usage: @UseGuards(JwtAuthGuard) on any controller method that needs auth.
//
// AuthModule is @Global() so the underlying JwtStrategy and PassportModule are
// registered once — no per-module import needed just to use this guard.
// =============================================================================

import { Injectable } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {}
