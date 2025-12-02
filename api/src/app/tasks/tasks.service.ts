// api/src/app/tasks/tasks.service.ts
import {
  Injectable,
  BadRequestException,
  ForbiddenException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Task } from '../../entities/task.entity';
import { TaskStatus } from '../../entities/task-status.enum';
import { Organization } from '../../entities/organization.entity';
import { User } from '../../entities/user.entity';
import { OrgRole, hasAtLeastRole } from '../../entities/role.enum';

import { UsersService } from '../users/users.service';
import { LoggingService } from '../logging/logging.service';

import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Injectable()
export class TasksService {
  constructor(
    @InjectRepository(Task) private tasksRepo: Repository<Task>,
    @InjectRepository(Organization) private orgsRepo: Repository<Organization>,
    @InjectRepository(User) private usersRepo: Repository<User>,
    private usersService: UsersService,
    private loggingService: LoggingService,
  ) {}

  // ---- helpers ----

  private parseDueDate(dueDate?: string): Date | undefined {
    if (!dueDate) return undefined;
    const d = new Date(dueDate);
    if (Number.isNaN(d.getTime())) {
      throw new BadRequestException('Invalid dueDate format');
    }
    return d;
  }

  // ---- core methods ----

  async listTasksForOrg(userId: string, orgId: string): Promise<Task[]> {
    // Viewer+ can see all tasks in org
    await this.usersService.requireMembershipWithRole(
      userId,
      orgId,
      OrgRole.VIEWER,
    );

    return this.tasksRepo.find({
      where: { organization: { id: orgId } },
      order: { createdAt: 'DESC' },
    });
  }

  async getTaskForOrg(
    userId: string,
    orgId: string,
    taskId: string,
  ): Promise<Task> {
    await this.usersService.requireMembershipWithRole(
      userId,
      orgId,
      OrgRole.VIEWER,
    );

    const task = await this.tasksRepo.findOne({
      where: { id: taskId, organization: { id: orgId } },
    });

    if (!task) {
      throw new NotFoundException('Task not found in this organization');
    }
    return task;
  }

  async createTaskForOrg(
    userId: string,
    orgId: string,
    dto: CreateTaskDto,
  ): Promise<Task> {
    const membership = await this.usersService.requireMembershipWithRole(
      userId,
      orgId,
      OrgRole.MEMBER,
    );

    const org = membership.organization;
    const creator = membership.user;
    const dueDate = this.parseDueDate(dto.dueDate);

    const task = this.tasksRepo.create({
      title: dto.title,
      description: dto.description,
      status: TaskStatus.TODO,
      organization: org,
      createdBy: creator,
      dueDate,
    });

    if (dto.assignedToUserId) {
      const assigneeMembership =
        await this.usersService.getMembershipForUserInOrg(
          dto.assignedToUserId,
          orgId,
        );
      if (!assigneeMembership) {
        throw new BadRequestException(
          'Assigned user must be a member of this organization',
        );
      }
      task.assignedTo = assigneeMembership.user;
    }

    const saved = await this.tasksRepo.save(task);

    await this.loggingService.log('TASK_CREATED', {
      actorUserId: userId,
      organizationId: orgId,
      entityType: 'Task',
      entityId: saved.id,
      metadata: { title: saved.title },
    });

    return saved;
  }

  async updateTaskForOrg(
    userId: string,
    orgId: string,
    taskId: string,
    dto: UpdateTaskDto,
  ): Promise<Task> {
    const membership = await this.usersService.requireMembershipWithRole(
      userId,
      orgId,
      OrgRole.MEMBER,
    );

    const task = await this.tasksRepo.findOne({
      where: { id: taskId, organization: { id: orgId } },
    });

    if (!task) {
      throw new NotFoundException('Task not found in this organization');
    }

    const canManageAll = hasAtLeastRole(membership.role, OrgRole.MANAGER);
    const isOwnerOrAssignee =
      membership.user.id === task.createdBy.id ||
      (task.assignedTo && membership.user.id === task.assignedTo.id);

    if (!canManageAll && !isOwnerOrAssignee) {
      throw new ForbiddenException(
        'You are not allowed to update this task',
      );
    }

    if (dto.title !== undefined) {
      task.title = dto.title;
    }
    if (dto.description !== undefined) {
      task.description = dto.description;
    }
    if (dto.status !== undefined) {
      task.status = dto.status;
    }
    if (dto.dueDate !== undefined) {
      task.dueDate = this.parseDueDate(dto.dueDate);
    }

    if (dto.assignedToUserId !== undefined) {
      if (dto.assignedToUserId === null) {
        task.assignedTo = null;
      } else {
        const assigneeMembership =
          await this.usersService.getMembershipForUserInOrg(
            dto.assignedToUserId,
            orgId,
          );
        if (!assigneeMembership) {
          throw new BadRequestException(
            'Assigned user must be a member of this organization',
          );
        }
        task.assignedTo = assigneeMembership.user;
      }
    }

    const saved = await this.tasksRepo.save(task);

    await this.loggingService.log('TASK_UPDATED', {
      actorUserId: userId,
      organizationId: orgId,
      entityType: 'Task',
      entityId: saved.id,
      metadata: { title: saved.title },
    });

    return saved;
  }

  async deleteTaskForOrg(
    userId: string,
    orgId: string,
    taskId: string,
  ): Promise<void> {
    await this.usersService.requireMembershipWithRole(
      userId,
      orgId,
      OrgRole.ADMIN,
    );

    const task = await this.tasksRepo.findOne({
      where: { id: taskId, organization: { id: orgId } },
    });

    if (!task) {
      throw new NotFoundException('Task not found in this organization');
    }

    await this.tasksRepo.remove(task);

    await this.loggingService.log('TASK_DELETED', {
      actorUserId: userId,
      organizationId: orgId,
      entityType: 'Task',
      entityId: task.id,
      metadata: { title: task.title },
    });
  }
}
