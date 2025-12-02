// api/src/app/users/users.service.ts
import {
  Injectable,
  ForbiddenException,
  NotFoundException,
} from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import * as bcrypt from "bcrypt";

import { User } from "../../entities/user.entity";
import { Organization } from "../../entities/organization.entity";
import { Membership } from "../../entities/membership.entity";
import { OrgRole, hasAtLeastRole } from "../../entities/role.enum";

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User) private usersRepo: Repository<User>,
    @InjectRepository(Organization) private orgsRepo: Repository<Organization>,
    @InjectRepository(Membership)
    private membershipsRepo: Repository<Membership>
  ) {}

  async findByEmail(email: string): Promise<User | null> {
    return this.usersRepo.findOne({ where: { email } });
  }

  async createUser(
    email: string,
    fullName: string,
    password: string
  ): Promise<User> {
    const passwordHash = await bcrypt.hash(password, 10);
    const user = this.usersRepo.create({ email, fullName, passwordHash });
    return this.usersRepo.save(user);
  }

  async createUserInOrg(
    email: string,
    fullName: string,
    password: string,
    orgName: string,
    role: OrgRole
  ): Promise<{ user: User; organization: Organization }> {
    let org = await this.orgsRepo.findOne({ where: { name: orgName } });
    if (!org) {
      org = this.orgsRepo.create({ name: orgName });
      org = await this.orgsRepo.save(org);
    }

    let user = await this.findByEmail(email);
    if (!user) {
      user = await this.createUser(email, fullName, password);
    }

    let membership = await this.membershipsRepo.findOne({
      where: {
        user: { id: user.id },
        organization: { id: org.id },
      },
      relations: ["user", "organization"],
    });

    if (!membership) {
      membership = this.membershipsRepo.create({
        user,
        organization: org,
        role,
      });
      await this.membershipsRepo.save(membership);
    }

    return { user, organization: org };
  }

  // ---------- RBAC helpers ----------

  async getMembershipForUserInOrg(
    userId: string,
    orgId: string
  ): Promise<Membership | null> {
    return this.membershipsRepo.findOne({
      where: {
        user: { id: userId },
        organization: { id: orgId },
      },
      relations: ["user", "organization"],
    });
  }

  async requireMembershipWithRole(
    userId: string,
    orgId: string,
    minRole: OrgRole
  ): Promise<Membership> {
    const membership = await this.getMembershipForUserInOrg(userId, orgId);
    if (!membership) {
      throw new ForbiddenException(
        "You are not a member of this organization."
      );
    }
    if (!hasAtLeastRole(membership.role, minRole)) {
      throw new ForbiddenException(
        "You do not have sufficient role for this action."
      );
    }
    return membership;
  }

  // ---------- Org user management ----------

  async listMembershipsForOrg(orgId: string): Promise<Membership[]> {
    return this.membershipsRepo.find({
      where: { organization: { id: orgId } },
      relations: ["user", "organization"],
      order: { role: "DESC" as any },
    });
  }

  /**
   * Add a user to an existing org by orgId.
   * - If user does not exist, create with given password or default.
   * - If membership exists, update role.
   */
  async addUserToOrgById(
    orgId: string,
    email: string,
    fullName: string,
    role: OrgRole,
    password?: string
  ): Promise<{
    user: User;
    organization: Organization;
    membership: Membership;
    isNewUser: boolean;
    isNewMembership: boolean;
    roleChanged: boolean;
  }> {
    const org = await this.orgsRepo.findOne({ where: { id: orgId } });
    if (!org) {
      throw new NotFoundException("Organization not found");
    }

    let user = await this.findByEmail(email);
    let isNewUser = false;

    if (!user) {
      const pwdToUse = password || "ChangeMe123!"; // default temp password
      user = await this.createUser(email, fullName, pwdToUse);
      isNewUser = true;
    } else if (fullName && user.fullName !== fullName) {
      user.fullName = fullName;
      user = await this.usersRepo.save(user);
    }

    let membership = await this.membershipsRepo.findOne({
      where: {
        user: { id: user.id },
        organization: { id: org.id },
      },
      relations: ["user", "organization"],
    });

    let isNewMembership = false;
    let roleChanged = false;

    if (!membership) {
      membership = this.membershipsRepo.create({
        user,
        organization: org,
        role,
      });
      isNewMembership = true;
    } else if (membership.role !== role) {
      membership.role = role;
      roleChanged = true;
    }

    membership = await this.membershipsRepo.save(membership);

    return {
      user,
      organization: org,
      membership,
      isNewUser,
      isNewMembership,
      roleChanged,
    };
  }

  async listMembershipsForUser(userId: string): Promise<Membership[]> {
    return this.membershipsRepo.find({
      where: { user: { id: userId } },
      relations: ["organization", "user"],
      order: { role: "DESC" as any },
    });
  }
}
