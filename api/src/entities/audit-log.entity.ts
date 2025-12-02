// apps/api/src/entities/audit-log.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  ManyToOne,
  CreateDateColumn,
  Index,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';

@Entity()
export class AuditLog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // e.g. TASK_CREATED, TASK_UPDATED, USER_CREATED, LOGIN_SUCCESS, LOGIN_FAILED
  @Index()
  @Column()
  action: string;

  @Column({ nullable: true })
  entityType?: string;

  @Column({ nullable: true })
  entityId?: string;

  @ManyToOne(() => User, (user) => user.auditLogs, { eager: true, nullable: true })
  actor?: User | null;

  @ManyToOne(
    () => Organization,
    (org) => org.auditLogs,
    { eager: true, nullable: true },
  )
  organization?: Organization | null;

  @Column({ type: 'text', nullable: true })
  metadata?: string; // store JSON string (we’ll stringify objects)

  @CreateDateColumn()
  createdAt: Date;
}
