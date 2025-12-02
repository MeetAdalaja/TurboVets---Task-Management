// api/src/app/tasks/dto/update-task.dto.ts
import { TaskStatus } from '../../../entities/task-status.enum';

export class UpdateTaskDto {
  title?: string;
  description?: string;
  status?: TaskStatus;
  dueDate?: string;                // ISO string
  assignedToUserId?: string | null; // null = unassign
}
