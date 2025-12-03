// web/src/app/features/tasks/tasks-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from './tasks.service';
import { Task, TaskStatus, OrgUser } from '../../core/models';
import { AuthService } from '../../core/auth.service';
import { OrgUsersService } from '../org-users/org-users.service';

@Component({
  standalone: true,
  selector: 'app-tasks-page',
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  template: `
    <div class="tasks-page">
      <h2>Tasks</h2>

      <!-- No org selected -->
      <div class="info" *ngIf="!currentOrgId">
        <p>Please select an organization in the header.</p>
      </div>

      <ng-container *ngIf="currentOrgId">
        <section class="create-card">
          <h3>Create task</h3>
          <form (ngSubmit)="createTask()">
            <div class="field">
              <label>Title</label>
              <input
                type="text"
                [(ngModel)]="newTitle"
                name="title"
                required
                placeholder="Task title"
              />
            </div>

            <div class="field">
              <label>Description</label>
              <textarea
                [(ngModel)]="newDescription"
                name="description"
                rows="3"
                placeholder="Optional description"
              ></textarea>
            </div>

            <div class="field">
              <label>Due date</label>
              <input
                type="date"
                [(ngModel)]="newDueDate"
                name="dueDate"
              />
            </div>

            <div
              class="field"
              *ngIf="canAssign && members.length"
            >
              <label>Assignee (optional)</label>
              <select
                [(ngModel)]="newAssigneeId"
                name="assignee"
              >
                <option value="">Unassigned</option>
                <option
                  *ngFor="let m of members"
                  [value]="m.userId"
                >
                  {{ m.fullName }} ({{ m.role }})
                </option>
              </select>
            </div>

            <button
              type="submit"
              [disabled]="creating || !newTitle"
            >
              {{ creating ? 'Creating...' : 'Create' }}
            </button>
          </form>
        </section>

        <section class="list-card">
          <h3>Existing tasks</h3>

          <div *ngIf="loading">Loading tasks...</div>
          <div *ngIf="error" class="error">{{ error }}</div>

          <table
            *ngIf="tasks.length"
            class="tasks-table"
          >
            <thead>
              <tr>
                <th>Title</th>
                <th>Status</th>
                <th>Assignee</th>
                <th>Due</th>
                <th>Created</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let task of tasks">
                <td>
                  {{ task.title }}
                  <div
                    class="task-desc"
                    *ngIf="task.description"
                  >
                    {{ task.description }}
                  </div>
                </td>
                <td>
                  <select
                    [(ngModel)]="task.status"
                    (change)="onStatusChange(task)"
                  >
                    <option value="TODO">TODO</option>
                    <option value="IN_PROGRESS">
                      IN_PROGRESS
                    </option>
                    <option value="DONE">DONE</option>
                  </select>
                </td>
                <td>
                  <!-- Assignment UI only for ADMIN/OWNER -->
                  <ng-container *ngIf="canAssign && members.length; else assigneeReadOnly">
                    <select
                      [ngModel]="task.assignedTo?.id || ''"
                      (ngModelChange)="onAssigneeChange(task, $event)"
                    >
                      <option value="">Unassigned</option>
                      <option
                        *ngFor="let m of members"
                        [value]="m.userId"
                      >
                        {{ m.fullName }} ({{ m.role }})
                      </option>
                    </select>
                  </ng-container>
                  <ng-template #assigneeReadOnly>
                    {{ task.assignedTo?.fullName || '—' }}
                  </ng-template>
                </td>
                <td>
                  {{
                    task.dueDate
                      ? (task.dueDate | date: 'yyyy-MM-dd')
                      : '—'
                  }}
                </td>
                <td>
                  {{ task.createdAt | date: 'yyyy-MM-dd' }}
                </td>
                <td>
                  <button
                    (click)="deleteTask(task)"
                    class="danger-btn"
                  >
                    Delete
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div
            *ngIf="!loading && !tasks.length && !error"
          >
            No tasks yet.
          </div>
        </section>
      </ng-container>
    </div>
  `,
  styleUrls: ['./tasks-page.component.css'],
})
export class TasksPageComponent implements OnInit {
  tasks: Task[] = [];
  members: OrgUser[] = [];

  loading = false;
  creating = false;
  error = '';

  newTitle = '';
  newDescription = '';
  newDueDate = '';
  newAssigneeId = '';

  get currentOrgId(): string | null {
    return this.auth.currentOrgId;
  }

  get canAssign(): boolean {
    return this.auth.isAdminOrOwner;
  }

  constructor(
    private tasksService: TasksService,
    private auth: AuthService,
    private orgUsersService: OrgUsersService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) return;

    if (!this.currentOrgId) {
      this.auth.loadOrganizations().subscribe({
        next: () => {
          if (this.currentOrgId) {
            this.loadTasks();
            if (this.canAssign) {
              this.loadMembers();
            }
          }
        },
        error: () => {
          this.error = 'Failed to load organizations';
        },
      });
    } else {
      this.loadTasks();
      if (this.canAssign) {
        this.loadMembers();
      }
    }
  }

  loadTasks() {
    if (!this.currentOrgId) return;

    this.loading = true;
    this.error = '';

    this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load tasks';
        this.loading = false;
      },
    });
  }

  loadMembers() {
    if (!this.currentOrgId || !this.canAssign) return;

    this.orgUsersService.getOrgUsers().subscribe({
      next: (users) => {
        this.members = users;
      },
      error: () => {
        // silently ignore; assignment UI will just not show options
      },
    });
  }

  createTask() {
    if (!this.currentOrgId || !this.newTitle) return;

    this.creating = true;

    const dueDateIso = this.newDueDate
      ? new Date(this.newDueDate).toISOString()
      : undefined;

    this.tasksService
      .createTask({
        title: this.newTitle,
        description: this.newDescription || undefined,
        dueDate: dueDateIso,
        assignedToUserId: this.newAssigneeId || undefined,
      })
      .subscribe({
        next: (task) => {
          this.tasks.unshift(task);
          this.creating = false;
          this.newTitle = '';
          this.newDescription = '';
          this.newDueDate = '';
          this.newAssigneeId = '';
        },
        error: () => {
          this.creating = false;
          this.error = 'Failed to create task';
        },
      });
  }

  onStatusChange(task: Task) {
    const status = task.status as TaskStatus;

    this.tasksService
      .updateTask(task.id, { status })
      .subscribe({
        error: () => {
          this.error = 'Failed to update status';
        },
      });
  }

  onAssigneeChange(task: Task, userId: string) {
    const assignedToUserId = userId || null;

    this.tasksService
      .updateTask(task.id, { assignedToUserId })
      .subscribe({
        next: (updated) => {
          task.assignedTo = updated.assignedTo;
        },
        error: () => {
          this.error = 'Failed to update assignee';
        },
      });
  }

  deleteTask(task: Task) {
    if (!confirm(`Delete task "${task.title}"?`)) return;

    this.tasksService.deleteTask(task.id).subscribe({
      next: () => {
        this.tasks = this.tasks.filter((t) => t.id !== task.id);
      },
      error: () => {
        this.error = 'Failed to delete task';
      },
    });
  }
}
