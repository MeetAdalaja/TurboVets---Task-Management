// api/src/app/app.controller.ts
import { Controller, Get, Req, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UsersService } from './users/users.service';

@Controller()
export class AppController {
  constructor(private usersService: UsersService) {}

  @UseGuards(JwtAuthGuard)
  @Get('me')
  getProfile(@Req() req: any) {
    return req.user; // { userId, email }
  }

  @UseGuards(JwtAuthGuard)
  @Get('me/organizations')
  async getMyOrganizations(@Req() req: any) {
    const userId = req.user.userId as string;

    const memberships = await this.usersService.listMembershipsForUser(userId);

    return memberships.map((m) => ({
      organizationId: m.organization.id,
      organizationName: m.organization.name,
      role: m.role,
    }));
  }
}
