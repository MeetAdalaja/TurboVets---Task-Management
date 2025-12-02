// apps/api/src/app/seed/seed.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { UsersService } from '../users/users.service';
import { OrgRole } from '../../entities/role.enum';
import { Organization } from '../../entities/organization.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private usersService: UsersService,
    @InjectRepository(Organization)
    private orgsRepo: Repository<Organization>,
  ) {}

  async onModuleInit() {
    await this.seed();
  }

  private async seed() {
    const orgCount = await this.orgsRepo.count();
    if (orgCount > 0) {
      this.logger.log('Seed skipped: organizations already exist');
      return;
    }

    this.logger.log('Seeding initial organization and owner user...');

    const orgName = 'Demo Organization';
    const email = 'owner@example.com';
    const fullName = 'Owner User';
    const password = 'Password123!';

    await this.usersService.createUserInOrg(
      email,
      fullName,
      password,
      orgName,
      OrgRole.OWNER,
    );

    this.logger.log(
      `Seed completed. Login with email="${email}", password="${password}"`,
    );
  }
}
