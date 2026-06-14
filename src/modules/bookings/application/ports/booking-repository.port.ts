// =============================================================================
// LAYER: Application (bookings port)
// MAY IMPORT: domain entities from THIS module only
// MUST NOT IMPORT: catalog internals, NestJS, TypeORM, infrastructure
// =============================================================================

import { Booking } from '../../domain/entities/booking.entity';

export interface BookingRepositoryPort {
  save(booking: Booking): Promise<void>;
}

export const BOOKING_REPOSITORY = Symbol('BOOKING_REPOSITORY');
