// api/src/app/tasks/tasks.controller.ts
import {
  Controller,
  Get,
  Post,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  UseGuards,
  BadRequestException,
} from '@nestjs/common';

import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { TasksService } from './tasks.service';
import { CreateTaskDto } from './dto/create-task.dto';
import { UpdateTaskDto } from './dto/update-task.dto';

@Controller('tasks')
@UseGuards(JwtAuthGuard)
export class TasksController {
  constructor(private tasksService: TasksService) {}

  private getOrgIdFromRequest(req: any): string {
    const orgId = req.headers['x-org-id'] as string;
    if (!orgId) {
      throw new BadRequestException('x-org-id header is required');
    }
    return orgId;
  }

  @Get()
  async listTasks(@Req() req: any) {
    const userId = req.user.userId as string;
    const orgId = this.getOrgIdFromRequest(req);
    return this.tasksService.listTasksForOrg(userId, orgId);
  }

  @Get(':id')
  async getTask(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId as string;
    const orgId = this.getOrgIdFromRequest(req);
    return this.tasksService.getTaskForOrg(userId, orgId, id);
  }

  @Post()
  async createTask(@Req() req: any, @Body() dto: CreateTaskDto) {
    const userId = req.user.userId as string;
    const orgId = this.getOrgIdFromRequest(req);
    return this.tasksService.createTaskForOrg(userId, orgId, dto);
  }

  @Patch(':id')
  async updateTask(
    @Req() req: any,
    @Param('id') id: string,
    @Body() dto: UpdateTaskDto,
  ) {
    const userId = req.user.userId as string;
    const orgId = this.getOrgIdFromRequest(req);
    return this.tasksService.updateTaskForOrg(userId, orgId, id, dto);
  }

  @Delete(':id')
  async deleteTask(@Req() req: any, @Param('id') id: string) {
    const userId = req.user.userId as string;
    const orgId = this.getOrgIdFromRequest(req);
    await this.tasksService.deleteTaskForOrg(userId, orgId, id);
    return { success: true };
  }
}
