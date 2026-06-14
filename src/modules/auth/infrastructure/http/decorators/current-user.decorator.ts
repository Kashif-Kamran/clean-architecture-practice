// =============================================================================
// LAYER: Infrastructure (HTTP)
// MAY IMPORT: @nestjs/common
//
// @CurrentUser() extracts the JWT payload that JwtStrategy placed on req.user.
// Usage: @Get('me') @UseGuards(JwtAuthGuard) me(@CurrentUser() user: TokenPayload)
//
// Because JwtAuthGuard is exported from AuthModule (@Global), any controller
// can import just this decorator and the guard class — no extra module import needed.
// =============================================================================

import { createParamDecorator, ExecutionContext } from '@nestjs/common';
import type { TokenPayload } from '../../../application/ports/token-service.port';

export const CurrentUser = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TokenPayload => {
    const request = ctx.switchToHttp().getRequest<{ user: TokenPayload }>();
    return request.user;
  },
);
