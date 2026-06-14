// =============================================================================
// LAYER: Application (use case)
// MAY IMPORT: @Injectable/@Inject from @nestjs/common (DI metadata only),
//             domain entities, domain errors, application ports
// MUST NOT IMPORT: TypeORM, HTTP decorators, ORM entities
//
// TRADEOFF: @Injectable() + @Inject() are metadata decorators — they don't
// couple this class to NestJS runtime behaviour, only to the DI container.
// The payoff: the module lists this class directly instead of a factory provider.
//
// WHY @Inject(MAKE_REPOSITORY) is required:
//   TypeScript metadata reflection can resolve CLASS tokens automatically.
//   SYMBOL tokens (like MAKE_REPOSITORY) are invisible to the type system at
//   runtime — @Inject() is how we tell NestJS which provider to use.
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Make } from '../../domain/entities/make.entity';
import { MAKE_REPOSITORY, type MakeRepositoryPort } from '../ports/make-repository.port';

export interface CreateMakeInput {
  name: string;
  countryOfOrigin: string;
}

@Injectable()
export class CreateMakeUseCase {
  constructor(
    @Inject(MAKE_REPOSITORY) private readonly makeRepo: MakeRepositoryPort,
  ) {}

  async execute(input: CreateMakeInput): Promise<Make> {
    const make = new Make(randomUUID(), input.name, input.countryOfOrigin);
    await this.makeRepo.save(make);
    return make;
  }
}
