// =============================================================================
// COMPOSITION ROOT for the bookings feature slice.
// =============================================================================

import { Module } from '@nestjs/common';
import { CatalogModule } from '../catalog/catalog.module';
import { BOOKING_REPOSITORY } from './application/ports/booking-repository.port';
import { CreateBookingUseCase } from './application/use-cases/create-booking.use-case';
import { InMemoryBookingRepository } from './infrastructure/persistence/in-memory-booking.repository';
import { BookingController } from './infrastructure/http/controllers/booking.controller';

@Module({
  imports: [
    // Makes CatalogModule's exports (GetVariantByIdUseCase, etc.) injectable here.
    CatalogModule,
  ],

  providers: [
    { provide: BOOKING_REPOSITORY, useClass: InMemoryBookingRepository },

    // NestJS sees GetVariantByIdUseCase (class token) in the constructor and
    // resolves it from CatalogModule's exports automatically — no @Inject() needed.
    CreateBookingUseCase,
  ],

  controllers: [BookingController],
})
export class BookingsModule {}
