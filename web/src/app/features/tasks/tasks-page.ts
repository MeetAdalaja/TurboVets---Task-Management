// web/src/app/features/tasks/tasks-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TasksService } from './tasks.service';
import { Task, TaskStatus } from '../../core/models';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-tasks-page',
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  template: `
    <div class="tasks-page">
      <h2>Tasks</h2>

      <div class="info" *ngIf="!currentOrgId">
        <p>Please select an organization in the header.</p>
      </div>

      <section class="create-card" *ngIf="currentOrgId">
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

          <button type="submit" [disabled]="creating || !newTitle">
            {{ creating ? 'Creating...' : 'Create' }}
          </button>
        </form>
      </section>

      <section class="list-card" *ngIf="currentOrgId">
        <h3>Existing tasks</h3>

        <div *ngIf="loading">Loading tasks...</div>
        <div *ngIf="error" class="error">{{ error }}</div>

        <table *ngIf="tasks.length" class="tasks-table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Status</th>
              <th>Assignee</th>
              <th>Due</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let task of tasks">
              <td>{{ task.title }}</td>
              <td>
                <select
                  [(ngModel)]="task.status"
                  (change)="onStatusChange(task)"
                >
                  <option value="TODO">TODO</option>
                  <option value="IN_PROGRESS">IN_PROGRESS</option>
                  <option value="DONE">DONE</option>
                </select>
              </td>
              <td>
                {{ task.assignedTo?.fullName || '—' }}
              </td>
              <td>
                {{ task.dueDate ? (task.dueDate | date: 'yyyy-MM-dd') : '—' }}
              </td>
              <td>
                <button (click)="deleteTask(task)" class="danger-btn">
                  Delete
                </button>
              </td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && !tasks.length && !error">
          No tasks yet.
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./tasks-page.css'],
})
export class TasksPageComponent implements OnInit {
  tasks: Task[] = [];
  loading = false;
  error = '';

  newTitle = '';
  newDescription = '';
  newDueDate = '';

  creating = false;

  get currentOrgId(): string | null {
    return this.auth.currentOrgId;
  }

  constructor(
    private tasksService: TasksService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.auth.currentOrgId && this.auth.isLoggedIn) {
      this.auth.loadOrganizations().subscribe({
        next: () => this.loadTasks(),
        error: () => (this.error = 'Failed to load organizations'),
      });
    } else {
      this.loadTasks();
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
      })
      .subscribe({
        next: (task) => {
          this.tasks.unshift(task);
          this.creating = false;
          this.newTitle = '';
          this.newDescription = '';
          this.newDueDate = '';
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
      .updateTask(task.id, {
        status,
      })
      .subscribe({
        error: () => {
          this.error = 'Failed to update status';
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
