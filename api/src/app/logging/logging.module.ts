// api/src/app/logging/logging.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { AuditLog } from '../../entities/audit-log.entity';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';
import { LoggingService } from './logging.service';

@Module({
  imports: [TypeOrmModule.forFeature([AuditLog, User, Organization])],
  providers: [LoggingService],
  exports: [LoggingService],
})
export class LoggingModule {}
