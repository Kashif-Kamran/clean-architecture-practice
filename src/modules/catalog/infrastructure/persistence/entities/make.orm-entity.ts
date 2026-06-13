// =============================================================================
// LAYER: Infrastructure (persistence)
// MAY IMPORT: TypeORM decorators, anything infrastructure or inward
// MUST NOT IMPORT: application use cases, HTTP controllers, request/response DTOs
//
// WHY THIS FILE EXISTS (the key teaching point):
//   The domain `Make` is a plain TS class with behavior and invariants.
//   This file is a DUMB TABLE MAPPING — it exists purely to satisfy TypeORM's
//   decorator requirements. Keeping them separate means:
//     • You can rename a DB column without touching the domain entity.
//     • You can migrate from TypeORM to Prisma/Drizzle without touching domain.
//     • Domain unit tests never need a database or ORM at all.
//
// The `!` assertions are required with strict mode because TypeORM hydrates
// these properties after construction — TypeScript cannot see that happening.
// =============================================================================

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('makes')
export class MakeOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ name: 'country_of_origin', length: 80 })
  countryOfOrigin!: string;
}
