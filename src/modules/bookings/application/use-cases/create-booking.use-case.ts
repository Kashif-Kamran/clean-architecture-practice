// =============================================================================
// LAYER: Application (bookings use case)
// MAY IMPORT: @Injectable/@Inject from @nestjs/common (DI metadata only),
//             this module's domain + ports, exported use cases from catalog
// MUST NOT IMPORT: catalog internals (repositories, ORM entities, mappers)
// =============================================================================

import { Injectable, Inject } from '@nestjs/common';
import { randomUUID } from 'crypto';
import { Booking } from '../../domain/entities/booking.entity';
import { BOOKING_REPOSITORY, type BookingRepositoryPort } from '../ports/booking-repository.port';
import { GetVariantByIdUseCase } from '../../../catalog/application/use-cases/get-variant-by-id.use-case';

export interface CreateBookingInput {
  variantId: string;
  customerName: string;
}

@Injectable()
export class CreateBookingUseCase {
  constructor(
    // Class token — NestJS resolves this automatically via metadata reflection.
    // No @Inject() needed because GetVariantByIdUseCase is a class, not a Symbol.
    private readonly getVariantById: GetVariantByIdUseCase,

    // Symbol token — @Inject() required because Symbols are erased at runtime
    // and TypeScript metadata can't carry them automatically.
    @Inject(BOOKING_REPOSITORY) private readonly bookingRepo: BookingRepositoryPort,
  ) {}

  async execute(input: CreateBookingInput): Promise<Booking> {
    // GetVariantByIdUseCase throws NotFoundError if the variant doesn't exist,
    // so no null check needed here — the error propagates to the global filter.
    await this.getVariantById.execute({ id: input.variantId });

    const booking = new Booking(
      randomUUID(),
      input.variantId,
      input.customerName,
      new Date(),
    );

    await this.bookingRepo.save(booking);
    return booking;
  }
}
