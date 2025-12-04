import { Component, OnInit } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { DragDropModule, CdkDragDrop } from "@angular/cdk/drag-drop";

import { TasksService } from "./tasks.service";
import { Task, TaskStatus, OrgUser } from "../../core/models";
import { AuthService } from "../../core/auth.service";
import { OrgUsersService } from "../org-users/org-users.service";

@Component({
  standalone: true,
  selector: "app-tasks-page",
  imports: [CommonModule, NgFor, NgIf, FormsModule, DragDropModule],
  template: `
    <div class="space-y-4 md:space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-lg font-semibold text-slate-50">Tasks</h2>
          <p class="mt-1 text-xs text-slate-400">
            Create, update, assign, and track work items for the selected
            organization.
          </p>
        </div>

        <div class="hidden text-[11px] text-slate-400 md:block">
          <span *ngIf="currentOrgId; else noOrgMsg">
            Managing tasks for
            <span class="font-semibold text-slate-200">
              {{ currentOrgName }}
            </span>
          </span>
          <ng-template #noOrgMsg>
            <span>Please select an organization in the header.</span>
          </ng-template>
        </div>
      </div>

      <!-- Global error -->
      <div
        *ngIf="error"
        class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100"
      >
        {{ error }}
      </div>

      <!-- No org selected -->
      <div
        *ngIf="!currentOrgId"
        class="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-xs text-sky-100"
      >
        Please select an organization in the header to view and manage tasks.
      </div>

      <!-- Main layout when org selected -->
      <ng-container *ngIf="currentOrgId">
        <div class="space-y-6 md:gap-6">
          <!-- Create / Update task card -->
          <section class="card-elevated px-4 py-4 sm:px-5 sm:py-5">
            <header class="mb-4 flex items-start justify-between gap-2">
              <div>
                <h3 class="text-sm font-semibold text-slate-50">
                  {{ editingTaskId ? "Update task" : "Create a new task" }}
                </h3>
                <p class="mt-0.5 text-[11px] text-slate-400">
                  {{
                    editingTaskId
                      ? "Modify the details below and save your changes."
                      : "Capture a clear title, optional details, and assign it to a teammate."
                  }}
                </p>
              </div>

              <button
                *ngIf="editingTaskId"
                type="button"
                (click)="cancelEdit()"
                class="rounded-md border border-slate-700 bg-slate-900/80 px-2 py-1 text-[10px] font-semibold text-slate-200 hover:bg-slate-800/80"
              >
                Cancel edit
              </button>
            </header>

            <!-- Form wraps grid + button -->
            <form class="space-y-3" (ngSubmit)="onSubmitTask()">
              <!-- Fields + Illustration in same row -->
              <div
                class="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] items-stretch"
              >
                <!-- Fields column -->
                <div class="space-y-3">
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
                      class="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
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
                      class="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none placeholder:text-slate-500 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
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
                        class="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
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
                        class="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs text-slate-50 outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500"
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

                    <div
                      class="space-y-1.5 text-[11px] text-slate-500"
                      *ngIf="canAssign && !assignableMembers.length"
                    >
                      <span class="font-semibold text-slate-300">
                        No members yet
                      </span>
                      <p>
                        Add team members on the
                        <span class="font-semibold">Org users</span>
                        page to assign work.
                      </p>
                    </div>
                  </div>
                </div>

                <!-- Illustration column -->
                <div
                  class="hidden md:flex h-full items-stretch"
                  aria-hidden="true"
                >
                  <div
                    class="relative w-full max-w-xs md:max-w-sm rounded-2xl border border-slate-800 bg-gradient-to-b from-slate-900/80 to-slate-950/90 px-4 py-4 shadow-lg shadow-black/50 flex flex-col"
                  >
                    <div
                      class="absolute -top-2 -left-2 h-10 w-10 rounded-full bg-indigo-500/20 blur-xl"
                    ></div>
                    <div
                      class="absolute -bottom-4 -right-3 h-12 w-12 rounded-full bg-emerald-500/20 blur-xl"
                    ></div>

                    <div class="relative space-y-3 flex-1">
                      <!-- small header -->
                      <div class="flex items-center justify-between">
                        <div class="space-y-0.5">
                          <p
                            class="text-[11px] font-semibold text-slate-200"
                          >
                            Task pipeline
                          </p>
                          <p class="text-[10px] text-slate-500">
                            Visual snapshot of your board
                          </p>
                        </div>
                        <span
                          class="inline-flex items-center rounded-full bg-slate-900/90 px-2 py-0.5 text-[9px] text-slate-300"
                        >
                          Live
                          <span
                            class="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
                          ></span>
                        </span>
                      </div>

                      <!-- mini board -->
                      <div class="mt-1 grid grid-cols-3 gap-2 text-[9px]">
                        <div
                          class="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-2"
                        >
                          <p
                            class="text-[10px] font-semibold text-slate-200"
                          >
                            Backlog
                          </p>
                          <div class="space-y-1.5">
                            <div
                              class="h-3 w-full rounded bg-slate-800/90"
                            ></div>
                            <div
                              class="h-3 w-5/6 rounded bg-slate-800/70"
                            ></div>
                            <div
                              class="h-3 w-4/5 rounded bg-slate-800/70"
                            ></div>
                          </div>
                        </div>
                        <div
                          class="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-2"
                        >
                          <p
                            class="text-[10px] font-semibold text-slate-200"
                          >
                            In progress
                          </p>
                          <div class="space-y-1.5">
                            <div
                              class="h-3 w-full rounded bg-indigo-500/50"
                            ></div>
                            <div
                              class="h-3 w-3/4 rounded bg-slate-800/70"
                            ></div>
                          </div>
                        </div>
                        <div
                          class="space-y-1 rounded-xl border border-slate-800 bg-slate-950/80 p-2"
                        >
                          <p
                            class="text-[10px] font-semibold text-slate-200"
                          >
                            Done
                          </p>
                          <div class="space-y-1.5">
                            <div
                              class="h-3 w-full rounded bg-emerald-500/60"
                            ></div>
                            <div
                              class="h-3 w-4/5 rounded bg-emerald-500/40"
                            ></div>
                          </div>
                        </div>
                      </div>

                      <!-- bottom hint -->
                      <div
                        class="mt-1 flex items-center justify-between text-[9px] text-slate-400"
                      >
                        <span class="flex items-center gap-1">
                          <span
                            class="inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
                          ></span>
                          Drag to reorder
                        </span>
                        <span class="flex items-center gap-1">
                          <span
                            class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
                          ></span>
                          Drop to complete
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Button row spanning full width -->
              <button
                type="submit"
                [disabled]="saving || !newTitle"
                class="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/40 transition disabled:cursor-not-allowed disabled:opacity-60"
                [ngClass]="
                  editingTaskId
                    ? 'bg-emerald-500 hover:bg-emerald-400'
                    : 'bg-indigo-500 hover:bg-indigo-400'
                "
              >
                <span *ngIf="!saving">
                  {{ editingTaskId ? "Update task" : "Create task" }}
                </span>
                <span *ngIf="saving">
                  {{ editingTaskId ? "Updating…" : "Creating…" }}
                </span>
              </button>
            </form>
          </section>

          <!-- Board -->
          <section class="card-elevated px-4 py-4 sm:px-5 sm:py-5">
            <header class="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-semibold text-slate-50">Task board</h3>
                <p class="mt-0.5 text-[11px] text-slate-400">
                  Drag tasks between columns to update their status.
                </p>
              </div>

              <div
                *ngIf="tasks.length"
                class="hidden rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 sm:flex sm:items-center sm:gap-1.5"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{{ tasks.length }} total</span>
              </div>
            </header>

            <div *ngIf="loading" class="mb-3 text-xs text-slate-400">
              Loading tasks…
            </div>

            <div
              *ngIf="!loading && !tasks.length"
              class="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-400"
            >
              <p>No tasks yet.</p>
              <p class="mt-1">Create a task above to get started.</p>
            </div>

            <div
              *ngIf="!loading && tasks.length"
              cdkDropListGroup
              class="mt-2 grid gap-3 md:grid-cols-3"
            >
              <div
                *ngFor="let column of columns"
                class="flex min-h-[240px] flex-col rounded-xl border border-slate-800 bg-slate-950/70"
              >
                <div
                  class="flex items-center justify-between gap-2 border-b border-slate-800 bg-slate-900/80 px-3 py-2"
                >
                  <span class="text-xs font-semibold text-slate-50">
                    {{ column.title }}
                  </span>
                  <span class="text-[11px] text-slate-400">
                    {{ getTasksByStatus(column.key).length }}
                  </span>
                </div>

                <div
                  class="flex-1 space-y-2 overflow-auto p-2"
                  cdkDropList
                  [id]="column.key + 'List'"
                  [cdkDropListConnectedTo]="connectedDropListIds"
                  (cdkDropListDropped)="onDrop($event, column.key)"
                >
                  <div
                    *ngFor="
                      let task of getTasksByStatus(column.key);
                      trackBy: trackByTaskId
                    "
                    cdkDrag
                    [cdkDragData]="task"
                    class="group relative overflow-hidden rounded-xl border border-slate-800 bg-slate-900/90 px-3 py-2 text-xs text-slate-100 shadow-sm shadow-black/30 transition-all duration-200 ease-out hover:-translate-y-0.5 hover:scale-[1.01] hover:border-indigo-400 hover:shadow-[0_18px_35px_rgba(15,23,42,0.9)]"
                  >
                    <!-- left gradient bar -->
                    <div
                      class="pointer-events-none absolute left-0 top-0 h-full w-1 bg-gradient-to-b from-indigo-400 to-emerald-400 opacity-0 -translate-x-1 transition-all duration-200 ease-out group-hover:opacity-100 group-hover:translate-x-0"
                    ></div>

                    <!-- glow overlay -->
                    <div
                      class="pointer-events-none absolute -inset-px rounded-xl bg-[radial-gradient(circle_at_top_left,rgba(129,140,248,0.35),transparent_55%)] opacity-0 transition-opacity duration-200 ease-out group-hover:opacity-100"
                    ></div>

                    <!-- card content -->
                    <div class="relative flex items-start justify-between gap-2">
                      <div class="space-y-1">
                        <div class="text-xs font-medium sm:text-sm">
                          {{ task.title }}
                        </div>
                        <div
                          *ngIf="task.description"
                          class="text-[11px] text-slate-400"
                        >
                          {{ task.description }}
                        </div>
                        <div
                          class="flex flex-wrap items-center gap-1.5 text-[10px] text-slate-400"
                        >
                          <span>
                            Created:
                            <span class="text-slate-200">
                              {{ task.createdAt | date : "yyyy-MM-dd" }}
                            </span>
                          </span>
                          <span *ngIf="task.dueDate">
                            <span class="hidden text-slate-500 sm:inline"
                              >•</span
                            >
                            Due:
                            <span class="text-slate-200">
                              {{ task.dueDate | date : "yyyy-MM-dd" }}
                            </span>
                          </span>

                          <!-- Assignee -->
                          <ng-container
                            *ngIf="
                              canAssign && assignableMembers.length;
                              else assigneeReadonly
                            "
                          >
                            <span class="hidden text-slate-500 sm:inline"
                              >•</span
                            >

                            <!-- pill + change link -->
                            <div class="inline-flex items-center gap-1.5">
                              <span
                                class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium border border-slate-700"
                                [ngClass]="
                                  task.assignedTo
                                    ? 'bg-slate-800 text-slate-100'
                                    : 'bg-slate-950 text-slate-400 border-dashed'
                                "
                              >
                                <ng-container
                                  *ngIf="task.assignedTo; else unassignedLabel"
                                >
                                  {{ task.assignedTo.fullName }}
                                </ng-container>
                                <ng-template #unassignedLabel
                                  >Unassigned</ng-template
                                >
                              </span>

                              <button
                                type="button"
                                (click)="toggleAssigneeEdit(task)"
                                class="text-[10px] text-indigo-300 hover:text-indigo-200 underline decoration-dotted"
                              >
                                {{
                                  editingAssigneeTaskId === task.id
                                    ? "Cancel"
                                    : "Change"
                                }}
                              </button>
                            </div>

                            <!-- custom dropdown, only when editing -->
                            <div
                              *ngIf="editingAssigneeTaskId === task.id"
                              class="mt-1"
                            >
                              <div
                                class="w-full max-w-[240px] rounded-md border border-slate-700 bg-slate-900/95 text-[11px] shadow-lg shadow-black/40"
                              >
                                <!-- Current selection header -->
                                <div
                                  class="flex items-center justify-between px-2 py-1.5 text-slate-100"
                                >
                                  <span>
                                    <ng-container
                                      *ngIf="
                                        task.assignedTo;
                                        else currentUnassigned
                                      "
                                    >
                                      {{ task.assignedTo.fullName }}
                                    </ng-container>
                                    <ng-template #currentUnassigned
                                      >Unassigned</ng-template
                                    >
                                  </span>
                                  <span class="text-[9px] text-slate-500"
                                    >▼</span
                                  >
                                </div>

                                <!-- Options list -->
                                <div
                                  class="max-h-44 border-t border-slate-800"
                                >
                                  <ul class="max-h-44 overflow-auto py-1">
                                    <!-- Unassigned option -->
                                    <li>
                                      <button
                                        type="button"
                                        (click)="onAssigneeChange(task, '')"
                                        class="flex w-full items-center justify-between px-2 py-1 text-left text-[11px]"
                                        [ngClass]="
                                          !task.assignedTo
                                            ? 'bg-indigo-600/80 text-white'
                                            : 'text-slate-100 hover:bg-slate-800/80'
                                        "
                                      >
                                        <span>Unassigned</span>
                                      </button>
                                    </li>

                                    <!-- Member options -->
                                    <li *ngFor="let m of assignableMembers">
                                      <button
                                        type="button"
                                        (click)="
                                          onAssigneeChange(task, m.userId)
                                        "
                                        class="flex w-full items-center justify-between px-2 py-1 text-left text-[11px]"
                                        [ngClass]="
                                          task.assignedTo?.id === m.userId
                                            ? 'bg-indigo-600/80 text-white'
                                            : 'text-slate-100 hover:bg-slate-800/80'
                                        "
                                      >
                                        <span>{{ m.fullName }}</span>
                                        <span
                                          class="text-[10px] text-slate-400"
                                        >
                                          {{ m.role }}
                                        </span>
                                      </button>
                                    </li>
                                  </ul>
                                </div>
                              </div>
                            </div>
                          </ng-container>

                          <ng-template #assigneeReadonly>
                            <span class="hidden text-slate-500 sm:inline"
                              >•</span
                            >
                            <span
                              class="inline-flex items-center rounded-full px-2 py-0.5 text-[10px] border border-slate-700"
                              [ngClass]="
                                task.assignedTo
                                  ? 'bg-slate-800 text-slate-100'
                                  : 'bg-slate-950 text-slate-400 border-dashed'
                              "
                            >
                              <ng-container
                                *ngIf="task.assignedTo; else readonlyUnassigned"
                              >
                                {{ task.assignedTo.fullName }}
                              </ng-container>
                              <ng-template #readonlyUnassigned
                                >Unassigned</ng-template
                              >
                            </span>
                          </ng-template>
                        </div>
                      </div>

                      <!-- Card actions -->
                      <div class="flex flex-col items-end gap-1">
                        <button
                          type="button"
                          (click)="startEditTask(task)"
                          class="inline-flex items-center rounded-md border border-slate-600 bg-slate-900/80 px-2 py-1 my-1 text-[10px] font-semibold text-slate-100 opacity-0 transition group-hover:opacity-100 hover:bg-slate-800/80"
                        >
                          Update
                        </button>
                        <button
                          type="button"
                          (click)="deleteTask(task)"
                          class="inline-flex items-center rounded-md border border-rose-500/40 bg-rose-500/10 px-1.5 py-0.5 text-[10px] font-semibold text-rose-100 opacity-0 transition group-hover:opacity-100 hover:bg-rose-500/20"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>

                  <div
                    *ngIf="!getTasksByStatus(column.key).length"
                    class="flex h-full items-center justify-center rounded-md border border-dashed border-slate-700 bg-slate-950/50 px-2 py-3 text-center text-[11px] text-slate-500"
                  >
                    Drop tasks here to move them to
                    <span class="mx-1 font-semibold lowercase">
                      {{ column.title }}
                    </span>
                    status.
                  </div>
                </div>
              </div>
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
  saving = false;
  error = "";

  newTitle = "";
  newDescription = "";
  newDueDate = "";
  newAssigneeId = "";

  editingTaskId: string | null = null; // form-level edit
  editingAssigneeTaskId: string | null = null; // inline assignee dropdown

  readonly columns: { key: TaskStatus; title: string }[] = [
    { key: "TODO", title: "Backlog" },
    { key: "IN_PROGRESS", title: "In progress" },
    { key: "DONE", title: "Done" },
  ];

  readonly connectedDropListIds = this.columns.map((c) => c.key + "List");

  get currentOrgId(): string | null {
    return this.auth.currentOrgId;
  }

  get currentOrgName(): string | null {
    return this.auth.currentOrgName;
  }

  get canAssign(): boolean {
    return this.auth.isManagerOrAbove;
  }

  constructor(
    private tasksService: TasksService,
    private auth: AuthService,
    private orgUsersService: OrgUsersService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) {
      return;
    }

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

  getTasksByStatus(status: TaskStatus): Task[] {
    return this.tasks.filter((t) => t.status === status);
  }

  trackByTaskId(index: number, task: Task): string {
    return task.id;
  }

  onDrop(event: CdkDragDrop<Task[]>, newStatus: TaskStatus): void {
    const task = (event.item.data as Task) || null;

    if (!task || task.status === newStatus) {
      return;
    }

    const previousStatus = task.status;
    task.status = newStatus;

    this.tasksService.updateTask(task.id, { status: newStatus }).subscribe({
      next: (updated) => {
        task.status = updated.status;
      },
      error: () => {
        task.status = previousStatus;
        this.error = "Failed to update status";
      },
    });
  }

  loadTasks(): void {
    if (!this.currentOrgId) {
      return;
    }

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

  loadMembers(): void {
    if (!this.currentOrgId || !this.canAssign) {
      return;
    }

    this.orgUsersService.getOrgUsers().subscribe({
      next: (users) => {
        this.members = users;
        // Exclude VIEWERs from assignable list
        this.assignableMembers = users.filter((u) => u.role !== "VIEWER");
      },
      error: () => {
        // ignore; assignment UI will just not show options
      },
    });
  }

  private resetForm(): void {
    this.newTitle = "";
    this.newDescription = "";
    this.newDueDate = "";
    this.newAssigneeId = "";
    this.editingTaskId = null;
  }

  startEditTask(task: Task): void {
    this.editingTaskId = task.id;
    this.newTitle = task.title;
    this.newDescription = task.description || "";
    this.newDueDate = task.dueDate
      ? (task.dueDate as any).toString().slice(0, 10)
      : "";
    this.newAssigneeId = task.assignedTo?.id || "";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cancelEdit(): void {
    this.resetForm();
  }

  onSubmitTask(): void {
    if (!this.currentOrgId || !this.newTitle) {
      return;
    }

    this.error = "";

    // ====== Due date validation vs created date ======
    let dueDateIso: string | undefined;

    if (this.newDueDate) {
      const due = new Date(this.newDueDate);
      const dueOnly = new Date(
        due.getFullYear(),
        due.getMonth(),
        due.getDate()
      );

      // Determine created date (date-only)
      let createdOnly: Date;

      if (this.editingTaskId) {
        // Updating: use the task's real createdAt from backend
        const task = this.tasks.find((t) => t.id === this.editingTaskId);
        if (task && task.createdAt) {
          const created = new Date(task.createdAt as any);
          createdOnly = new Date(
            created.getFullYear(),
            created.getMonth(),
            created.getDate()
          );
        } else {
          // fallback to today if somehow missing
          const now = new Date();
          createdOnly = new Date(
            now.getFullYear(),
            now.getMonth(),
            now.getDate()
          );
        }
      } else {
        // Creating: treat "created date" as today
        const now = new Date();
        createdOnly = new Date(
          now.getFullYear(),
          now.getMonth(),
          now.getDate()
        );
      }

      // Compare dates (no time component)
      if (dueOnly < createdOnly) {
        const createdLabel = createdOnly.toISOString().slice(0, 10);
        this.error =
          "Due date cannot be earlier than the created date (" +
          createdLabel +
          ").";
        return; // stop submit, do NOT call API
      }

      // Valid -> convert to ISO for API
      dueDateIso = due.toISOString();
    }

    // =================================================

    this.saving = true;

    const payload: any = {
      title: this.newTitle,
      description: this.newDescription || undefined,
      dueDate: dueDateIso,
      assignedToUserId: this.newAssigneeId || undefined,
    };

    if (!this.editingTaskId) {
      // CREATE
      this.tasksService.createTask(payload).subscribe({
        next: (task) => {
          this.tasks.unshift(task);
          this.saving = false;
          this.resetForm();
        },
        error: () => {
          this.saving = false;
          this.error = "Failed to create task";
        },
      });
    } else {
      // UPDATE
      const taskId = this.editingTaskId;
      this.tasksService.updateTask(taskId, payload).subscribe({
        next: (updated) => {
          const idx = this.tasks.findIndex((t) => t.id === taskId);
          if (idx !== -1) {
            this.tasks[idx] = { ...this.tasks[idx], ...updated };
          }
          this.saving = false;
          this.resetForm();
        },
        error: () => {
          this.saving = false;
          this.error = "Failed to update task";
        },
      });
    }
  }

  toggleAssigneeEdit(task: Task): void {
    this.editingAssigneeTaskId =
      this.editingAssigneeTaskId === task.id ? null : task.id;
  }

  onAssigneeChange(task: Task, userId: string): void {
    const assignedToUserId = userId || null;

    this.tasksService.updateTask(task.id, { assignedToUserId }).subscribe({
      next: (updated) => {
        task.assignedTo = updated.assignedTo;
        this.editingAssigneeTaskId = null; // close dropdown after save
      },
      error: () => {
        this.error = "Failed to update assignee";
      },
    });
  }

  deleteTask(task: Task): void {
    if (!confirm('Delete task "' + task.title + '"?')) {
      return;
    }

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
