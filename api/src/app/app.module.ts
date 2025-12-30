// api/src/app/app.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { appConfig } from '../config/config';

// Entities
import { User } from '../entities/user.entity';
import { Organization } from '../entities/organization.entity';
import { Membership } from '../entities/membership.entity';
import { Task } from '../entities/task.entity';
import { AuditLog } from '../entities/audit-log.entity';

// Modules
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { SeedModule } from './seed/seed.module';
import { LoggingModule } from './logging/logging.module';
import { TasksModule } from './tasks/tasks.module';
import { OrgUsersModule } from './org-users/org-users.module';

// Controllers
import { AppController } from './app.controller';

// Static serving
import { ServeStaticModule } from '@nestjs/serve-static';
import { join } from 'path';

@Module({
  imports: [
    ServeStaticModule.forRoot({
      // In production, API can serve the Angular build from the same server
      // Angular → dist/web
      // API     → api/dist
      // compiled app.module is in api/dist/app
      rootPath: join(process.cwd(), 'dist', 'web'),
    }),
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: appConfig.db.database,
      entities: [User, Organization, Membership, Task, AuditLog],
      synchronize: true, //auto-creates schema in dev, will disable in prod
      logging: true, // prints SQL queries in console, useful for debugging
    }),
    UsersModule,
    AuthModule,
    SeedModule,
    LoggingModule,
    TasksModule,
    OrgUsersModule,
  ],
  controllers: [AppController],
})
export class AppModule {}
