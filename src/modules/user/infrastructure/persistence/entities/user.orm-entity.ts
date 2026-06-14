// =============================================================================
// LAYER: Infrastructure (persistence)
// MAY IMPORT: TypeORM decorators
// MUST NOT IMPORT: domain entities, application use cases, HTTP DTOs
// =============================================================================

import { Column, CreateDateColumn, Entity, PrimaryColumn } from 'typeorm';

@Entity('users')
export class UserOrmEntity {
  @PrimaryColumn('uuid')
  id!: string;

  @Column({ unique: true, length: 255 })
  email!: string;

  @Column({ name: 'password_hash', length: 255 })
  passwordHash!: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt!: Date;
}
