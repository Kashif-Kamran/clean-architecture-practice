// =============================================================================
// LAYER: Infrastructure (bookings persistence — in-memory adapter)
// This adapter satisfies BookingRepositoryPort without a database.
// Swap it for a TypeORM adapter when the bookings table is ready.
// =============================================================================

import { Injectable } from '@nestjs/common';
import { Booking } from '../../domain/entities/booking.entity';
import { BookingRepositoryPort } from '../../application/ports/booking-repository.port';

@Injectable()
export class InMemoryBookingRepository implements BookingRepositoryPort {
  private readonly store = new Map<string, Booking>();

  async save(booking: Booking): Promise<void> {
    this.store.set(booking.id, booking);
  }
}
