// =============================================================================
// LAYER: Infrastructure (bookings HTTP)
// =============================================================================

import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { CreateBookingUseCase } from '../../../application/use-cases/create-booking.use-case';
import { CreateBookingDto } from '../dtos/create-booking.dto';

@Controller('bookings')
export class BookingController {
  constructor(private readonly createBooking: CreateBookingUseCase) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  async create(@Body() dto: CreateBookingDto) {
    const booking = await this.createBooking.execute({
      variantId: dto.variantId,
      customerName: dto.customerName,
    });
    return { id: booking.id, variantId: booking.variantId, customerName: booking.customerName, bookedAt: booking.bookedAt };
  }
}
