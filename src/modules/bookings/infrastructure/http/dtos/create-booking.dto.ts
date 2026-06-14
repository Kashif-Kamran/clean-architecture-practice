// =============================================================================
// LAYER: Infrastructure (bookings HTTP)
// =============================================================================

import { IsNotEmpty, IsString, IsUUID } from 'class-validator';

export class CreateBookingDto {
  @IsUUID()
  variantId!: string;

  @IsString()
  @IsNotEmpty()
  customerName!: string;
}
