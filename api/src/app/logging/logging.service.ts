// api/src/app/logging/logging.service.ts
import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { AuditLog } from '../../entities/audit-log.entity';
import { User } from '../../entities/user.entity';
import { Organization } from '../../entities/organization.entity';

interface LogOptions {
  actorUserId?: string;
  organizationId?: string;
  entityType?: string;
  entityId?: string;
  metadata?: any;
}

@Injectable()
export class LoggingService {
  private readonly logger = new Logger(LoggingService.name);

  constructor(
    @InjectRepository(AuditLog)
    private auditRepo: Repository<AuditLog>,
    @InjectRepository(User)
    private usersRepo: Repository<User>,
    @InjectRepository(Organization)
    private orgsRepo: Repository<Organization>,
  ) {}

  async log(action: string, options: LogOptions = {}): Promise<void> {
    try {
      const log = this.auditRepo.create({
        action,
        entityType: options.entityType,
        entityId: options.entityId,
        metadata: options.metadata
          ? JSON.stringify(options.metadata)
          : undefined,
      });

      if (options.actorUserId) {
        const actor = await this.usersRepo.findOne({
          where: { id: options.actorUserId },
        });
        if (actor) log.actor = actor;
      }

      if (options.organizationId) {
        const org = await this.orgsRepo.findOne({
          where: { id: options.organizationId },
        });
        if (org) log.organization = org;
      }

      await this.auditRepo.save(log);
    } catch (err) {
      // Logging should never break the main flow
      this.logger.error('Failed to write audit log', err as any);
    }
  }
}
