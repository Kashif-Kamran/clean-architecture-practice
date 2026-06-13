// =============================================================================
// LAYER: Infrastructure (persistence)
// MAY IMPORT: TypeORM decorators, anything infrastructure or inward
// MUST NOT IMPORT: application use cases, HTTP controllers, request/response DTOs
// =============================================================================

import { Column, Entity, PrimaryColumn } from 'typeorm';

@Entity('models')
export class ModelOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ name: 'make_id', type: 'uuid' })
  makeId!: string;

  @Column({ length: 120 })
  name!: string;

  @Column({ name: 'body_type', length: 60 })
  bodyType!: string;

  @Column({ name: 'year_introduced', type: 'int' })
  yearIntroduced!: number;
}
