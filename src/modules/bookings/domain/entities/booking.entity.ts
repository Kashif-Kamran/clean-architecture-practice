// =============================================================================
// LAYER: Domain (bookings module)
// MAY IMPORT: domain/errors only
// MUST NOT IMPORT: NestJS, TypeORM, class-validator, HTTP types, DTOs,
//                  or anything from another module
// =============================================================================

export class Booking {
  constructor(
    public readonly id: string,
    public readonly variantId: string, // references catalog — stored as ID only
    public readonly customerName: string,
    public readonly bookedAt: Date,
  ) {}
}
