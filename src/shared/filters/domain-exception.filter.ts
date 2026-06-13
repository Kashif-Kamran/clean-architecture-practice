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
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/** Shape we expect on caught domain errors (matches DomainError base class). */
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

    if (isDomainError(exception)) {
      // A business rule was violated — return 4xx to the client
      response.status(exception.statusCode).json({
        statusCode: exception.statusCode,
        error: exception.name,
        message: exception.message,
        path: request.url,
      });
      return;
    }

    // Unknown error — log it and return 500
    this.logger.error(exception);
    response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      statusCode: HttpStatus.INTERNAL_SERVER_ERROR,
      error: 'Internal Server Error',
      path: request.url,
    });
  }
}
