// api/src/app/org-users/org-users.controller.ts
import {
  Controller,
  Get,
  Post,
  Delete,
  Param,
  Body,
  Req,
  UseGuards,
  BadRequestException,
} from "@nestjs/common";

import { JwtAuthGuard } from "../auth/jwt-auth.guard";
import { UsersService } from "../users/users.service";
import { LoggingService } from "../logging/logging.service";
import { AddOrgUserDto } from "./dto/add-org-user.dto";
import { OrgRole } from "../../entities/role.enum";

@Controller("org-users")
@UseGuards(JwtAuthGuard)
export class OrgUsersController {
  constructor(
    private usersService: UsersService,
    private loggingService: LoggingService
  ) {}

  private getOrgIdFromRequest(req: any): string {
    const orgId = req.headers["x-org-id"] as string;
    if (!orgId) {
      throw new BadRequestException("x-org-id header is required");
    }
    return orgId;
  }

  @Get()
  async listOrgUsers(@Req() req: any) {
    const actorUserId = req.user.userId as string;
    const orgId = this.getOrgIdFromRequest(req);

    // Only ADMIN+ can view/manage org users
    await this.usersService.requireMembershipWithRole(
      actorUserId,
      orgId,
      OrgRole.ADMIN
    );

    const memberships = await this.usersService.listMembershipsForOrg(orgId);

    return memberships.map((m) => ({
      membershipId: m.id,
      userId: m.user.id,
      email: m.user.email,
      fullName: m.user.fullName,
      role: m.role,
    }));
  }

  @Post()
  async addUserToOrg(@Req() req: any, @Body() dto: AddOrgUserDto) {
    const actorUserId = req.user.userId as string;
    const orgId = this.getOrgIdFromRequest(req);

    // Only ADMIN+ can add/update users in org
    await this.usersService.requireMembershipWithRole(
      actorUserId,
      orgId,
      OrgRole.ADMIN
    );

    const result = await this.usersService.addUserToOrgById(
      orgId,
      dto.email,
      dto.fullName,
      dto.role,
      dto.password
    );

    await this.loggingService.log("ORG_USER_ADDED_OR_UPDATED", {
      actorUserId,
      organizationId: orgId,
      entityType: "User",
      entityId: result.user.id,
      metadata: {
        email: result.user.email,
        role: result.membership.role,
        isNewUser: result.isNewUser,
        isNewMembership: result.isNewMembership,
        roleChanged: result.roleChanged,
      },
    });

    // Never return password; only safe fields
    return {
      userId: result.user.id,
      email: result.user.email,
      fullName: result.user.fullName,
      role: result.membership.role,
      isNewUser: result.isNewUser,
      isNewMembership: result.isNewMembership,
      roleChanged: result.roleChanged,
    };
  }

  @Delete(":membershipId")
  async removeUserFromOrg(
    @Req() req: any,
    @Param("membershipId") membershipId: string
  ) {
    const actorUserId = req.user.userId as string;
    const orgId = this.getOrgIdFromRequest(req);

    await this.usersService.removeMembershipFromOrg(
      actorUserId,
      orgId,
      membershipId
    );

    await this.loggingService.log("ORG_USER_REMOVED", {
      actorUserId,
      organizationId: orgId,
      entityType: "Membership",
      entityId: membershipId,
    });

    return { success: true };
  }
}
