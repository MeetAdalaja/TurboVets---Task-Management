// apps/api/src/entities/membership.entity.ts
import {
  Entity,
  PrimaryGeneratedColumn,
  ManyToOne,
  Column,
  Unique,
} from 'typeorm';
import { User } from './user.entity';
import { Organization } from './organization.entity';
import { OrgRole } from './role.enum';

@Entity()
@Unique(['user', 'organization'])
export class Membership {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => User, (user) => user.memberships, { eager: true })
  user: User;

  @ManyToOne(
    () => Organization,
    (organization) => organization.memberships,
    { eager: true },
  )
  organization: Organization;

  @Column({ type: 'text' })
  role: OrgRole;
}
