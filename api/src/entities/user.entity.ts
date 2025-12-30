// apps/api/src/entities/user.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Membership } from './membership.entity';
import { Task } from './task.entity';
import { AuditLog } from './audit-log.entity';

@Entity()
export class User {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index({ unique: true })
  @Column()
  email: string;

  @Column()
  passwordHash: string;

  @Column()
  fullName: string;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;


  
  // Relations
  @OneToMany(() => Membership, (m) => m.user)
  memberships: Membership[];

  @OneToMany(() => Task, (t) => t.createdBy)
  createdTasks: Task[];

  @OneToMany(() => Task, (t) => t.assignedTo)
  assignedTasks: Task[];

  @OneToMany(() => AuditLog, (log) => log.actor)
  auditLogs: AuditLog[];
}
