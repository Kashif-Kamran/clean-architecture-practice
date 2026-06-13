// =============================================================================
// LAYER: Infrastructure (persistence)
// MAY IMPORT: TypeORM decorators, anything infrastructure or inward
// MUST NOT IMPORT: application use cases, HTTP controllers, request/response DTOs
// =============================================================================

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('variants')
export class VariantOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'model_id', type: 'uuid' })
  modelId!: string;

  @Column({ length: 200 })
  name!: string;

  @Column({ type: 'int' })
  year!: number;

  @Column({ name: 'engine_cc', type: 'int' })
  engineCc!: number;

  @Column({ name: 'price_msrp', type: 'numeric', precision: 10, scale: 2 })
  priceMsrp!: number;
}
