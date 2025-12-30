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
  @Index() // index for faster filtering/searching
  @Column()
  action: string;

  // e.g. Task, User, Membership
  @Column({ nullable: true })
  entityType?: string;

  @Column({ nullable: true })
  entityId?: string;

  // Who performed the action? 
  @ManyToOne(() => User, (user) => user.auditLogs, { eager: true, nullable: true })
  actor?: User | null;  // nullable for system actions

  // Which organization is this action associated with? 
  @ManyToOne(
    () => Organization,
    (org) => org.auditLogs,
    { eager: true, nullable: true },
  )
  organization?: Organization | null; // nullable for system actions

  @Column({ type: 'text', nullable: true })
  metadata?: string; // store JSON as a string as we don't have JSONB like Postgres

  @CreateDateColumn()
  createdAt: Date;
}
