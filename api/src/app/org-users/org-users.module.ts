// api/src/app/org-users/org-users.module.ts
import { Module } from '@nestjs/common';

import { UsersModule } from '../users/users.module';
import { LoggingModule } from '../logging/logging.module';
import { OrgUsersController } from './org-users.controller';

@Module({
  imports: [UsersModule, LoggingModule],
  controllers: [OrgUsersController],
})
export class OrgUsersModule {}
