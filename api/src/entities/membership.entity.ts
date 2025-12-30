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
@Unique(['user', 'organization']) // prevents duplicate memberships: not allow multiple roles per user in one org
export class Membership {
  // Columns
  @PrimaryGeneratedColumn('uuid')
  id: string;

  // Relations
  @ManyToOne(() => User, (user) => user.memberships, { eager: true })
  user: User;

  @ManyToOne(
    () => Organization,
    (organization) => organization.memberships,
    { eager: true },
  )
  organization: Organization;

  // Role of the user in the organization
  @Column({ type: 'text' }) // SQLite does not have a native ENUM data type, so need to use TEXT
  role: OrgRole;
}
