// api/src/app/tasks/tasks.module.ts
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { Task } from '../../entities/task.entity';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';

import { TasksService } from './tasks.service';
import { TasksController } from './tasks.controller';
import { UsersModule } from '../users/users.module';
import { LoggingModule } from '../logging/logging.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Task, Organization, User]),
    UsersModule,
    LoggingModule,
  ],
  providers: [TasksService],
  controllers: [TasksController],
})
export class TasksModule {}
