// apps/api/src/entities/task.entity.ts
import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  CreateDateColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';
import { Organization } from './organization.entity';
import { User } from './user.entity';
import { TaskStatus } from './task-status.enum';

@Entity()
export class Task {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Index()
  @Column()
  title: string;

  @Column({ type: 'text', nullable: true })
  description?: string;

  @Column({ type: 'text', default: TaskStatus.TODO })
  status: TaskStatus;

  @Column({ type: 'datetime', nullable: true })
  dueDate?: Date;

  @ManyToOne(() => Organization, (org) => org.tasks, { eager: true })
  organization: Organization;

  @ManyToOne(() => User, (user) => user.createdTasks, { eager: true })
  createdBy: User;

  @ManyToOne(() => User, (user) => user.assignedTasks, {
    eager: true,
    nullable: true,
  })
  assignedTo?: User | null;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;
}
