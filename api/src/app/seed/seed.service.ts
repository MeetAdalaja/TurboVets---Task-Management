// // apps/api/src/app/seed/seed.service.ts
// import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { UsersService } from '../users/users.service';
// import { OrgRole } from '../../entities/role.enum';
// import { Organization } from '../../entities/organization.entity';

// @Injectable()
// export class SeedService implements OnModuleInit {
//   private readonly logger = new Logger(SeedService.name);

//   constructor(
//     private usersService: UsersService,
//     @InjectRepository(Organization)
//     private orgsRepo: Repository<Organization>,
//   ) {}

//   async onModuleInit() {
//     await this.seed();
//   }

//   private async seed() {
//     const orgCount = await this.orgsRepo.count();
//     if (orgCount > 0) {
//       this.logger.log('Seed skipped: organizations already exist');
//       return;
//     }

//     this.logger.log('Seeding initial organization and owner user...');

//     const orgName = 'Demo Organization';
//     const email = 'owner@example.com';
//     const fullName = 'Owner User';
//     const password = 'Password123!';

//     await this.usersService.createUserInOrg(
//       email,
//       fullName,
//       password,
//       orgName,
//       OrgRole.OWNER,
//     );

//     this.logger.log(
//       `Seed completed. Login with email="${email}", password="${password}"`,
//     );
//   }
// }
// apps/api/src/app/seed/seed.service.ts
import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';

import { UsersService } from '../users/users.service';
import { OrgRole } from '../../entities/role.enum';
import { Organization } from '../../entities/organization.entity';

@Injectable()
export class SeedService implements OnModuleInit {
  private readonly logger = new Logger(SeedService.name);

  constructor(
    private readonly usersService: UsersService,
    @InjectRepository(Organization)
    private readonly orgsRepo: Repository<Organization>,
  ) {}

  async onModuleInit() {
    this.logger.log('onModuleInit → calling seed()');
    await this.seed();
  }

  // make it public just in case we want to call it from a CLI later
  public async seed() {
    this.logger.log('SeedService.seed() START');

    const orgsToSeed: {
      orgName: string;
      users: {
        email: string;
        fullName: string;
        password: string;
        role: OrgRole;
      }[];
    }[] = [
      {
        orgName: 'TurboVets – San Diego',
        users: [
          {
            email: 'owner.sd@example.com',
            fullName: 'San Diego Owner',
            password: 'Password123!',
            role: OrgRole.OWNER,
          },
          {
            email: 'multi.user@example.com',
            fullName: 'Multi Org User',
            password: 'Password123!',
            role: OrgRole.MEMBER,
          },
        ],
      },
      {
        orgName: 'TurboVets – Austin',
        users: [
          {
            email: 'owner.aus@example.com',
            fullName: 'Austin Owner',
            password: 'Password123!',
            role: OrgRole.OWNER,
          },
        ],
      },
      {
        orgName: 'Happy Paws Animal Clinic',
        users: [
          {
            email: 'owner.hp@example.com',
            fullName: 'Happy Paws Owner',
            password: 'Password123!',
            role: OrgRole.OWNER,
          },
          {
            email: 'multi.user@example.com', // same user as in SD
            fullName: 'Multi Org User',
            password: 'Password123!',
            role: OrgRole.VIEWER,
          },
        ],
      },
    ];

    // 🔹 Instead of "if orgCount > 0 return", we do smart / idempotent seeding
    const names = orgsToSeed.map((o) => o.orgName);
    const existingOrgs = await this.orgsRepo.find({
      where: { name: In(names) },
    });
    const existingNames = new Set(existingOrgs.map((o) => o.name));

    this.logger.log(
      `Found ${existingOrgs.length} existing org(s): ${[...existingNames].join(', ') || '(none)'}`,
    );

    for (const orgSeed of orgsToSeed) {
      let org = await this.orgsRepo.findOne({
        where: { name: orgSeed.orgName },
      });

      if (!org) {
        this.logger.log(`Creating org "${orgSeed.orgName}"...`);
        org = this.orgsRepo.create({ name: orgSeed.orgName });
        org = await this.orgsRepo.save(org);
        this.logger.log(
          `Created org "${org.name}" with id=${org.id}`,
        );
      } else {
        this.logger.log(
          `Org "${orgSeed.orgName}" already exists with id=${org.id}, will just ensure users are present`,
        );
      }

      for (const user of orgSeed.users) {
        this.logger.log(
          `Seeding user ${user.email} as ${user.role} in org "${orgSeed.orgName}"...`,
        );
        try {
          await this.usersService.createUserInOrg(
            user.email,
            user.fullName,
            user.password,
            orgSeed.orgName,
            user.role,
          );
          this.logger.log(
            `✓ Seeded membership for ${user.email} in "${orgSeed.orgName}"`,
          );
        } catch (err) {
          this.logger.error(
            `Error seeding user ${user.email} in org "${orgSeed.orgName}": ${err?.message}`,
          );
        }
      }
    }

    this.logger.log('SeedService.seed() DONE');
    this.logger.log('Example logins:');
    this.logger.log('  owner.sd@example.com / Password123!');
    this.logger.log('  owner.aus@example.com / Password123!');
    this.logger.log('  owner.hp@example.com / Password123!');
    this.logger.log('  multi.user@example.com / Password123!');
  }
}
