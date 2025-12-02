// api/src/app/tasks/dto/create-task.dto.ts
export class CreateTaskDto {
  title: string = '';
  description?: string;
  dueDate?: string;          // ISO string from client
  assignedToUserId?: string; // optional, must belong to same org
}
