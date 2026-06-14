// =============================================================================
// LAYER: Infrastructure (shared cross-cutting concern)
// MAY IMPORT: NestJS, domain errors (to read the isDomainError flag)
// PURPOSE: Translate DomainErrors into HTTP responses without polluting
//          controllers with try/catch blocks.
//
// This filter is registered globally in main.ts so every controller benefits.
// It detects DomainErrors via the `isDomainError` flag rather than `instanceof`
// to avoid a hard import coupling on every individual error subclass.
// =============================================================================

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

// =============================================================================
// Three kinds of exceptions flow through this filter:
//
//  1. Domain errors   — thrown by use cases / domain entities when a business
//                       rule is violated (NotFoundError, InvalidVariantError…).
//                       Detected via the `isDomainError` sentinel flag.
//
//  2. HttpExceptions  — thrown by NestJS itself or Passport:
//                         • ValidationPipe      → BadRequestException (400)
//                         • JwtAuthGuard        → UnauthorizedException (401)
//                         • any guard/interceptor that calls `throw new ForbiddenException()`
//                       These must be passed through as-is; we must NOT convert
//                       them to 500 just because they are not domain errors.
//
//  3. Unexpected bugs — null refs, missing env vars, etc.
//                       These become 500 Internal Server Error and are logged.
// =============================================================================

interface CaughtDomainError {
  isDomainError: true;
  statusCode: number;
  message: string;
  name: string;
}

function isDomainError(err: unknown): err is CaughtDomainError {
  return (
    typeof err === 'object' &&
    err !== null &&
    (err as CaughtDomainError).isDomainError === true
  );
}

@Catch()
export class DomainExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(DomainExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // ── 1. Domain error ───────────────────────────────────────────────────────
    if (isDomainError(exception)) {
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        error: exception.name,
        message: exception.message,
        path: request.url,
      });
      return;
    }

    // ── 2. NestJS / framework HttpException ───────────────────────────────────
    // ValidationPipe, guards, Passport, and any code that throws `new NotFoundException()`
    // etc. all produce HttpException. Pass the status and body through unchanged.
    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const body = exception.getResponse();

      response.status(status).json(
        // getResponse() returns either a plain string or an object
        // (ValidationPipe returns an object with `message: string[]`).
        typeof body === 'string'
          ? { statusCode: status, message: body, path: request.url }
          : { ...(body as object), path: request.url },
      );
      return;
    }

    // ── 3. Unexpected error (bug) ─────────────────────────────────────────────
    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      path: request.url,
    });
  }
}
