import { Component, OnInit } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { TasksService } from "./tasks.service";
import { Task, TaskStatus, OrgUser } from "../../core/models";
import { AuthService } from "../../core/auth.service";
import { OrgUsersService } from "../org-users/org-users.service";

@Component({
  standalone: true,
  selector: "app-tasks-page",
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  template: `
    <div class="space-y-4 md:space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-lg font-semibold text-slate-50">Tasks</h2>
          <p class="mt-1 text-xs text-slate-400">
            Create, assign, and track work items for the selected organization.
          </p>
        </div>

        <div class="hidden text-[11px] text-slate-400 md:block">
          <span *ngIf="currentOrgId; else noOrgMsg">
            Managing tasks for
            <span class="font-semibold text-slate-200">{{
              currentOrgName
            }}</span>
          </span>
          <ng-template #noOrgMsg>
            No organization selected · choose one in the header.
          </ng-template>
        </div>
      </div>

      <!-- No org selected -->
      <div
        *ngIf="!currentOrgId"
        class="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-xs text-sky-100"
      >
        Please select an organization in the header to view and manage tasks.
      </div>

      <!-- Main content when org selected -->
      <ng-container *ngIf="currentOrgId">
        <div
          class="space-y-6 gap-4 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] md:gap-6"
        >
          <!-- Create card -->
          <section class="card-elevated px-4 py-4 sm:px-5 sm:py-5">
            <header class="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-semibold text-slate-50">Create task</h3>
                <p class="mt-0.5 text-[11px] text-slate-400">
                  Capture a concise title and optionally assign it to a
                  teammate.
                </p>
              </div>
            </header>

            <form class="space-y-3" (ngSubmit)="createTask()">
              <!-- Title -->
              <div class="space-y-1.5">
                <label
                  class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Title
                </label>
                <input
                  type="text"
                  [(ngModel)]="newTitle"
                  name="title"
                  required
                  placeholder="Short, action-oriented title"
                  class="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
              </div>

              <!-- Description -->
              <div class="space-y-1.5">
                <label
                  class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                >
                  Description
                </label>
                <textarea
                  [(ngModel)]="newDescription"
                  name="description"
                  rows="3"
                  placeholder="Optional details, context, or links"
                  class="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                ></textarea>
              </div>

              <!-- Due date + Assignee -->
              <div class="grid gap-3 sm:grid-cols-2">
                <div class="space-y-1.5">
                  <label
                    class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Due date
                  </label>
                  <input
                    type="date"
                    [(ngModel)]="newDueDate"
                    name="dueDate"
                    class="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  />
                </div>

                <div
                  class="space-y-1.5"
                  *ngIf="canAssign && assignableMembers.length"
                >
                  <label
                    class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                  >
                    Assignee
                  </label>
                  <select
                    [(ngModel)]="newAssigneeId"
                    name="assignee"
                    class="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  >
                    <option value="">Unassigned</option>
                    <option
                      *ngFor="let m of assignableMembers"
                      [value]="m.userId"
                    >
                      {{ m.fullName }} ({{ m.role }})
                    </option>
                  </select>
                </div>
              </div>

              <!-- Error (create) -->
              <div
                *ngIf="error && !tasks.length"
                class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100"
              >
                {{ error }}
              </div>

              <!-- Submit -->
              <button
                type="submit"
                [disabled]="creating || !newTitle"
                class="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/40 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span *ngIf="!creating">Create task</span>
                <span *ngIf="creating">Creating…</span>
              </button>
            </form>
          </section>

          <!-- Tasks list -->
          <section class="card-elevated px-4 py-4 sm:px-5 sm:py-5">
            <header class="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-semibold text-slate-50">
                  Existing tasks
                </h3>
                <p class="mt-0.5 text-[11px] text-slate-400">
                  Update status, reassign work, or clean up completed items.
                </p>
              </div>
            </header>

            <!-- Loading -->
            <div *ngIf="loading" class="mb-3 text-xs text-slate-400">
              Loading tasks…
            </div>

            <!-- Error (list) -->
            <div
              *ngIf="error && !loading"
              class="mb-3 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100"
            >
              {{ error }}
            </div>

            <!-- Empty state -->
            <div
              *ngIf="!loading && !tasks.length && !error"
              class="text-xs text-slate-400"
            >
              No tasks yet. Use the form on the left to create the first one.
            </div>

            <!-- Table -->
            <div
              *ngIf="tasks.length"
              class="mt-2 max-h-[420px] overflow-auto rounded-xl border border-slate-800 bg-slate-950/40"
            >
              <table class="min-w-full text-left text-xs sm:text-sm">
                <thead
                  class="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400"
                >
                  <tr>
                    <th class="px-3 py-2">Title</th>
                    <th class="px-3 py-2">Status</th>
                    <th class="px-3 py-2">Assignee</th>
                    <th class="px-3 py-2">Due</th>
                    <th class="px-3 py-2">Created</th>
                    <th class="px-3 py-2"></th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let task of tasks"
                    class="border-t border-slate-800 hover:bg-slate-900/60"
                  >
                    <!-- Title + description -->
                    <td class="px-3 py-2 align-top">
                      <div
                        class="text-xs font-medium text-slate-100 sm:text-sm"
                      >
                        {{ task.title }}
                      </div>
                      <div
                        *ngIf="task.description"
                        class="mt-0.5 text-[11px] text-slate-400"
                      >
                        {{ task.description }}
                      </div>
                    </td>

                    <!-- Status -->
                    <td class="px-3 py-2 align-top">
                      <select
                        [(ngModel)]="task.status"
                        (change)="onStatusChange(task)"
                        class="w-full rounded-md border border-slate-800 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                      >
                        <option value="TODO">TODO</option>
                        <option value="IN_PROGRESS">IN_PROGRESS</option>
                        <option value="DONE">DONE</option>
                      </select>
                    </td>

                    <!-- Assignee -->
                    <td class="px-3 py-2 align-top">
                      <ng-container
                        *ngIf="
                          canAssign && assignableMembers.length;
                          else assigneeReadonly
                        "
                      >
                        <select
                          [ngModel]="task.assignedTo?.id || ''"
                          (ngModelChange)="onAssigneeChange(task, $event)"
                          class="w-full rounded-md border border-slate-800 bg-slate-950/70 px-2 py-1 text-xs text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                          <option value="">Unassigned</option>
                          <option *ngFor="let m of assignableMembers" [value]="m.userId">
                            {{ m.fullName }} ({{ m.role }})
                          </option>
                        </select>
                      </ng-container>
                      <ng-template #assigneeReadonly>
                        <span class="text-xs text-slate-300">
                          {{ task.assignedTo?.fullName || "—" }}
                        </span>
                      </ng-template>
                    </td>

                    <!-- Due date -->
                    <td class="px-3 py-2 align-top">
                      <span class="text-xs text-slate-200">
                        {{
                          task.dueDate
                            ? (task.dueDate | date : "yyyy-MM-dd")
                            : "—"
                        }}
                      </span>
                    </td>

                    <!-- Created at -->
                    <td class="px-3 py-2 align-top">
                      <span class="text-xs text-slate-200">
                        {{ task.createdAt | date : "yyyy-MM-dd" }}
                      </span>
                    </td>

                    <!-- Actions -->
                    <td class="px-3 py-2 align-top text-right">
                      <button
                        (click)="deleteTask(task)"
                        class="inline-flex items-center rounded-md bg-rose-500/90 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-400"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </ng-container>
    </div>
  `,
  styleUrls: ["./tasks-page.component.css"],
})
export class TasksPageComponent implements OnInit {
  tasks: Task[] = [];
  members: OrgUser[] = [];
  assignableMembers: OrgUser[] = [];

  loading = false;
  creating = false;
  error = "";

  newTitle = "";
  newDescription = "";
  newDueDate = "";
  newAssigneeId = "";

  get currentOrgId(): string | null {
    return this.auth.currentOrgId;
  }

  get currentOrgName(): string | null {
    return this.auth.currentOrgName;
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
          this.error = "Failed to load organizations";
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
    this.error = "";

    this.tasksService.getTasks().subscribe({
      next: (tasks) => {
        this.tasks = tasks;
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load tasks";
        this.loading = false;
      },
    });
  }

  loadMembers() {
    if (!this.currentOrgId || !this.canAssign) return;

    this.orgUsersService.getOrgUsers().subscribe({
      next: (users) => {
        this.members = users;
        // Exclude VIEWERs from assignable list
        this.assignableMembers = users.filter((u) => u.role !== "VIEWER");
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
          this.newTitle = "";
          this.newDescription = "";
          this.newDueDate = "";
          this.newAssigneeId = "";
        },
        error: () => {
          this.creating = false;
          this.error = "Failed to create task";
        },
      });
  }

  onStatusChange(task: Task) {
    const status = task.status as TaskStatus;

    this.tasksService.updateTask(task.id, { status }).subscribe({
      error: () => {
        this.error = "Failed to update status";
      },
    });
  }

  onAssigneeChange(task: Task, userId: string) {
    const assignedToUserId = userId || null;

    this.tasksService.updateTask(task.id, { assignedToUserId }).subscribe({
      next: (updated) => {
        task.assignedTo = updated.assignedTo;
      },
      error: () => {
        this.error = "Failed to update assignee";
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
        this.error = "Failed to delete task";
      },
    });
  }
}
