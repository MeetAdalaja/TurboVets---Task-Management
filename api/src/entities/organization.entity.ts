// apps/api/src/entities/organization.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
} from 'typeorm';
import { Membership } from './membership.entity';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity';

@Entity()
export class Organization {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  name: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @OneToMany(() => Membership, (m) => m.organization)
  memberships: Membership[];

  @OneToMany(() => Task, (t) => t.organization)
  tasks: Task[];

  @OneToMany(() => AuditLog, (log) => log.organization)
  auditLogs: AuditLog[];
}
