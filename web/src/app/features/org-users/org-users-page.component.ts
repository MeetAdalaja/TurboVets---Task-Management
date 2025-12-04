import { Component, OnInit } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";

import { OrgUsersService } from "./org-users.service";
import { AuthService } from "../../core/auth.service";
import { OrgRole, OrgUser } from "../../core/models";

@Component({
  standalone: true,
  selector: "app-org-users-page",
  imports: [CommonModule, NgIf, NgFor, FormsModule],
  template: `
    <div class="space-y-6 md:space-y-6">
      <!-- Header -->
      <div class="flex flex-wrap items-center justify-between gap-2">
        <div>
          <h2 class="text-lg font-semibold text-slate-50">
            Organization members
          </h2>
          <p class="mt-1 text-xs text-slate-400">
            Manage who has access to the current organization and what they’re
            allowed to do.
          </p>
        </div>

        <div class="text-[11px] text-slate-400">
          <ng-container *ngIf="currentOrgRole; else noRole">
            You are signed in as
            <span class="font-semibold text-slate-200">
              {{ currentOrgRole }}
            </span>
            for this organization.
          </ng-container>
          <ng-template #noRole> Role information not available. </ng-template>
        </div>
      </div>

      <!-- No org selected -->
      <div
        *ngIf="!currentOrgId"
        class="rounded-xl border border-sky-500/40 bg-sky-500/10 px-4 py-3 text-xs text-sky-100"
      >
        Please select an organization in the header before managing its members.
      </div>

      <!-- Content when org selected -->
      <ng-container *ngIf="currentOrgId">
        <!-- Not allowed to manage -->
        <section
          *ngIf="!canManageOrgUsers"
          class="card-elevated px-4 py-4 sm:px-5 sm:py-5"
        >
          <h3 class="text-sm font-semibold text-slate-50">Limited access</h3>
          <p class="mt-2 text-xs text-slate-300">
            Your current role
            <span class="font-semibold text-slate-100">
              ({{ currentOrgRole || "unknown" }})
            </span>
            does not allow you to manage organization members.
          </p>
          <p class="mt-2 text-xs text-slate-400">
            Contact an
            <span class="font-semibold">OWNER</span> or
            <span class="font-semibold">ADMIN</span> if you need your access
            level changed.
          </p>
        </section>

        <!-- Full management UI -->
        <ng-container *ngIf="canManageOrgUsers">
          <!-- Add / update member -->
          <section class="card-elevated px-4 py-4 sm:px-5 sm:py-5">
            <header class="mb-4 flex items-start justify-between gap-2">
              <div>
                <h3 class="text-sm font-semibold text-slate-50">
                  {{
                    editingMembershipId
                      ? "Update member"
                      : "Add or update member"
                  }}
                </h3>
                <p class="mt-0.5 text-[11px] text-slate-400">
                  Invite a user by email or adjust the role of an existing
                  member in this organization.
                </p>
                <p
                  *ngIf="editingMembershipId"
                  class="mt-1 text-[11px] text-indigo-300"
                >
                  Editing
                  <span class="font-semibold">
                    {{ formEmail || "selected member" }}
                  </span>
                  .
                </p>
              </div>
              <div class="flex flex-col items-end gap-2">
                <div
                  class="hidden rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 md:inline-flex md:items-center md:gap-1"
                >
                  <span class="h-1.5 w-1.5 rounded-full bg-amber-400"></span>
                  ADMIN / OWNER only
                </div>
                <!-- Cancel edit -->
                <button
                  *ngIf="editingMembershipId"
                  type="button"
                  (click)="cancelEdit()"
                  class="btn-org-cancel"
                >
                  Cancel edit
                </button>
              </div>
            </header>

            <!-- Alerts -->
            <div class="space-y-2 mb-3">
              <div
                *ngIf="success"
                class="rounded-lg border border-emerald-500/50 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100"
              >
                {{ success }}
              </div>
              <div
                *ngIf="error"
                class="rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100"
              >
                {{ error }}
              </div>
            </div>

            <!-- Form: fields + illustration + button -->
            <form class="space-y-3" (ngSubmit)="onSubmit()">
              <!-- Fields + Illustration -->
              <div
                class="grid gap-6 md:grid-cols-[minmax(0,1.3fr)_minmax(0,0.9fr)] items-stretch"
              >
                <!-- Fields column -->
                <div class="space-y-3">
                  <!-- Email -->
                  <div class="space-y-1.5">
                    <label
                      for="email"
                      class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Email
                    </label>
                    <input
                      id="email"
                      type="email"
                      name="email"
                      [(ngModel)]="formEmail"
                      required
                      placeholder="user@example.com"
                      class="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <!-- Full name -->
                  <div class="space-y-1.5">
                    <label
                      for="fullName"
                      class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Full name
                    </label>
                    <input
                      id="fullName"
                      type="text"
                      name="fullName"
                      [(ngModel)]="formFullName"
                      placeholder="Optional – used for display only"
                      class="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                  </div>

                  <!-- Initial password (optional) -->
                  <div class="space-y-1.5">
                    <label
                      for="password"
                      class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Initial password (optional)
                    </label>
                    <input
                      id="password"
                      type="text"
                      name="password"
                      [(ngModel)]="formPassword"
                      placeholder="Leave blank to auto-generate or keep existing"
                      class="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs sm:text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    />
                    <p class="mt-1 text-[11px] text-slate-500">
                      If the email already exists, this can be used to reset the
                      password. Leaving it empty keeps the existing password or
                      lets the backend generate one (same behavior as before).
                    </p>
                  </div>

                  <!-- Role -->
                  <div class="space-y-1.5">
                    <label
                      for="role"
                      class="text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                    >
                      Role in this organization
                    </label>
                    <select
                      id="role"
                      name="role"
                      [(ngModel)]="formRole"
                      class="w-full rounded-lg border border-slate-800 bg-slate-900/80 px-3 py-2 text-xs sm:text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                    >
                      <option *ngFor="let r of orgRoles" [value]="r">
                        {{ r }}
                      </option>
                    </select>
                    <p class="mt-1 text-[11px] text-slate-500">
                      Owners have the highest level of access. Use
                      <span class="font-semibold text-slate-300">ADMIN</span> or
                      <span class="font-semibold text-slate-300">MANAGER</span>
                      for day-to-day coordination, and
                      <span class="font-semibold text-slate-300">VIEWER</span>
                      for read-only access.
                    </p>
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
                    <!-- soft glows -->
                    <div
                      class="absolute -top-3 -left-4 h-10 w-12 rounded-full bg-indigo-500/25 blur-xl"
                    ></div>
                    <div
                      class="absolute -bottom-5 -right-3 h-12 w-14 rounded-full bg-emerald-500/20 blur-xl"
                    ></div>

                    <div class="relative flex-1 space-y-3">
                      <!-- header -->
                      <div class="flex items-center justify-between gap-2">
                        <div class="space-y-0.5">
                          <p class="text-[11px] font-semibold text-slate-200">
                            Access overview
                          </p>
                          <p class="text-[10px] text-slate-500">
                            Snapshot of roles in this org
                          </p>
                        </div>
                        <span
                          class="inline-flex items-center rounded-full bg-slate-900/90 px-2 py-0.5 text-[9px] text-slate-300"
                        >
                          Secure
                          <span
                            class="ml-1 inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
                          ></span>
                        </span>
                      </div>

                      <!-- mini list of roles -->
                      <div class="space-y-1.5 text-[9px]">
                        <div
                          class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1.5"
                        >
                          <div class="flex items-center gap-2">
                            <span
                              class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-amber-500/20 text-[9px] text-amber-300"
                            >
                              ★
                            </span>
                            <div class="space-y-0.5">
                              <p
                                class="text-[10px] font-semibold text-slate-100"
                              >
                                OWNER
                              </p>
                              <p class="text-[9px] text-slate-400">
                                Full control & billing
                              </p>
                            </div>
                          </div>
                          <span class="text-[9px] text-slate-500">
                            Highest
                          </span>
                        </div>

                        <div
                          class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1.5"
                        >
                          <div class="flex items-center gap-2">
                            <span
                              class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-indigo-500/25 text-[9px] text-indigo-300"
                            >
                              A
                            </span>
                            <div class="space-y-0.5">
                              <p
                                class="text-[10px] font-semibold text-slate-100"
                              >
                                ADMIN
                              </p>
                              <p class="text-[9px] text-slate-400">
                                Manage members & settings
                              </p>
                            </div>
                          </div>
                          <span class="text-[9px] text-slate-500">
                            Elevated
                          </span>
                        </div>

                        <div
                          class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1.5"
                        >
                          <div class="flex items-center gap-2">
                            <span
                              class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-sky-500/20 text-[9px] text-sky-300"
                            >
                              M
                            </span>
                            <div class="space-y-0.5">
                              <p
                                class="text-[10px] font-semibold text-slate-100"
                              >
                                MANAGER
                              </p>
                              <p class="text-[9px] text-slate-400">
                                Coordinate tasks & teams
                              </p>
                            </div>
                          </div>
                          <span class="text-[9px] text-slate-500">
                            Project
                          </span>
                        </div>

                        <div
                          class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1.5"
                        >
                          <div class="flex items-center gap-2">
                            <span
                              class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-slate-700/60 text-[9px] text-slate-200"
                            >
                              M
                            </span>
                            <div class="space-y-0.5">
                              <p
                                class="text-[10px] font-semibold text-slate-100"
                              >
                                MEMBER
                              </p>
                              <p class="text-[9px] text-slate-400">
                                Work on assigned tasks
                              </p>
                            </div>
                          </div>
                          <span class="text-[9px] text-slate-500">
                            Standard
                          </span>
                        </div>

                        <div
                          class="flex items-center justify-between rounded-lg border border-slate-800 bg-slate-950/80 px-2 py-1.5"
                        >
                          <div class="flex items-center gap-2">
                            <span
                              class="inline-flex h-4 w-4 items-center justify-center rounded-full bg-emerald-500/20 text-[9px] text-emerald-300"
                            >
                              V
                            </span>
                            <div class="space-y-0.5">
                              <p
                                class="text-[10px] font-semibold text-slate-100"
                              >
                                VIEWER
                              </p>
                              <p class="text-[9px] text-slate-400">
                                Read-only dashboards
                              </p>
                            </div>
                          </div>
                          <span class="text-[9px] text-slate-500"> Safe </span>
                        </div>
                      </div>

                      <!-- footer hint -->
                      <div
                        class="mt-2 flex items-center justify-between text-[9px] text-slate-400"
                      >
                        <span class="flex items-center gap-1">
                          <span
                            class="inline-block h-1.5 w-1.5 rounded-full bg-rose-400"
                          ></span>
                          Avoid too many owners
                        </span>
                        <span class="flex items-center gap-1">
                          <span
                            class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
                          ></span>
                          Follow least privilege
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Save / update button -->
              <button
                type="submit"
                [disabled]="saving || !formEmail"
                class="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs sm:text-sm font-semibold text-white shadow-sm shadow-indigo-500/40 transition disabled:cursor-not-allowed disabled:opacity-60 org-members-submit-btn"
                [ngClass]="
                  editingMembershipId
                    ? 'bg-emerald-500 hover:bg-emerald-400'
                    : 'bg-indigo-500 hover:bg-indigo-400'
                "
              >
                <span *ngIf="!saving">
                  {{ editingMembershipId ? "Update member" : "Save member" }}
                </span>
                <span *ngIf="saving">
                  {{ editingMembershipId ? "Updating…" : "Saving…" }}
                </span>
              </button>
              <button
                type="submit"
                [disabled]="saving || !formEmail"
                class="inline-flex w-full items-center justify-center rounded-lg px-3 py-2 text-xs font-semibold text-white shadow-sm shadow-indigo-500/40 transition disabled:cursor-not-allowed disabled:opacity-60"
                [ngClass]="
                  editingMembershipId
                    ? 'bg-emerald-500 hover:bg-emerald-400'
                    : 'bg-indigo-500 hover:bg-indigo-400'
                "
              >
                <span *ngIf="!saving">
                  {{ editingMembershipId ? "Update member" : "Save member" }}
                </span>
                <span *ngIf="saving">
                  {{ editingMembershipId ? "Updating…" : "Saving.." }}
                </span>
              </button>
            </form>
          </section>

          <!-- Members list -->
          <section class="card-elevated px-4 py-4 sm:px-5 sm:py-5">
            <header class="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-semibold text-slate-50">
                  Current members
                </h3>
                <p class="mt-0.5 text-[11px] text-slate-400">
                  Review who belongs to this organization and adjust membership
                  as needed.
                </p>
              </div>
              <div
                *ngIf="users.length"
                class="hidden rounded-full bg-slate-900/80 px-3 py-1 text-[11px] text-slate-300 sm:inline-flex sm:items-center sm:gap-1.5"
              >
                <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
                <span>{{ users.length }} members</span>
              </div>
            </header>

            <!-- Loading -->
            <div *ngIf="loading" class="mb-2 text-xs text-slate-400">
              Loading members…
            </div>

            <!-- Empty state -->
            <div
              *ngIf="!loading && !users.length"
              class="rounded-xl border border-dashed border-slate-700 bg-slate-950/60 px-4 py-6 text-center text-xs text-slate-400"
            >
              <p>No members found.</p>
              <p class="mt-1">
                Add someone using the form above to get your team started.
              </p>
            </div>

            <!-- Card list with hover like Tasks -->
            <div
              *ngIf="users.length"
              class="mt-2 max-h-[420px] space-y-2 overflow pr-1 px-3"
            >
              <div
                *ngFor="let user of users"
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

                <!-- content -->
                <div
                  class="relative flex flex-wrap items-start justify-between gap-3"
                >
                  <!-- Left info -->
                  <div class="space-y-1">
                    <div class="text-xs font-medium sm:text-sm">
                      {{ user.email }}
                    </div>
                    <div class="text-[11px] text-slate-300">
                      {{ user.fullName || "—" }}
                    </div>
                    <div
                      class="flex flex-wrap items-center gap-1.5 text-[10px]"
                    >
                      <span
                        class="inline-flex items-center rounded-full border border-slate-700 bg-slate-900/80 px-2 py-0.5 text-[10px] font-semibold text-slate-200"
                      >
                        {{ user.role }}
                      </span>
                      <span
                        *ngIf="user.membershipId === editingMembershipId"
                        class="inline-flex items-center rounded-full bg-indigo-500/20 px-2 py-0.5 text-[10px] font-semibold text-indigo-100"
                      >
                        Editing
                      </span>
                    </div>
                  </div>

                  <!-- Actions (same visual style as Task card buttons) -->
                  <div
                    class="flex flex-col items-end gap-1 org-user-card-actions"
                  >
                    <!-- Update -->
                    <button
                      type="button"
                      (click)="startEditUser(user)"
                      class="btn-org-update "
                    >
                      Update
                    </button>

                    <!-- Remove -->
                    <button
                      type="button"
                      (click)="removeUser(user)"
                      *ngIf="user.membershipId"
                      [disabled]="
                        user.membershipId ? removing[user.membershipId] : false
                      "
                      class="btn-org-remove"
                    >
                      {{
                        user.membershipId && removing[user.membershipId]
                          ? "Removing…"
                          : "Remove"
                      }}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </section>
        </ng-container>
      </ng-container>
    </div>
  `,
  styleUrls: ["./org-users-page.component.css"],
})
export class OrgUsersPageComponent implements OnInit {
  users: OrgUser[] = [];

  formEmail = "";
  formFullName = "";
  formPassword = "";
  formRole: OrgRole = "MEMBER";

  orgRoles: OrgRole[] = ["OWNER", "ADMIN", "MANAGER", "MEMBER", "VIEWER"];

  loading = false;
  saving = false;
  error = "";
  success = "";

  removing: Record<string, boolean> = {};

  // which membership (if any) is currently being edited via the form
  editingMembershipId: string | null = null;

  get currentOrgId(): string | null {
    return this.auth.currentOrgId;
  }

  get currentOrgRole(): OrgRole | null {
    return this.auth.getCurrentOrgRole();
  }

  get canManageOrgUsers(): boolean {
    return this.auth.isAdminOrOwner;
  }

  constructor(
    private readonly orgUsersService: OrgUsersService,
    private readonly auth: AuthService
  ) {}

  ngOnInit(): void {
    if (
      !this.auth.isLoggedIn ||
      !this.currentOrgId ||
      !this.canManageOrgUsers
    ) {
      return;
    }
    this.loadUsers();
  }

  loadUsers() {
    if (!this.currentOrgId || !this.canManageOrgUsers) return;

    this.loading = true;
    this.error = "";

    this.orgUsersService.getOrgUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.loading = false;
        this.error = "Failed to load organization members.";
      },
    });
  }

  private resetFormState(): void {
    this.formEmail = "";
    this.formFullName = "";
    this.formPassword = "";
    this.formRole = "MEMBER";
    this.editingMembershipId = null;
  }

  startEditUser(user: OrgUser): void {
    this.formEmail = user.email;
    this.formFullName = user.fullName || "";
    this.formPassword = "";
    this.formRole = user.role;
    this.editingMembershipId = user.membershipId || null;
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  cancelEdit(): void {
    this.resetFormState();
    this.error = "";
    this.success = "";
  }

  onSubmit() {
    if (!this.formEmail || !this.currentOrgId || !this.canManageOrgUsers) {
      return;
    }

    this.saving = true;
    this.error = "";
    this.success = "";

    const passwordTrimmed = this.formPassword.trim();

    const payload = {
      email: this.formEmail.trim(),
      fullName: this.formFullName.trim() || undefined,
      role: this.formRole,
      password: passwordTrimmed || undefined, // optional password, same behavior as old UI
    };

    this.orgUsersService.addOrgUser(payload as any).subscribe({
      next: () => {
        this.saving = false;
        this.success = this.editingMembershipId
          ? "Member updated successfully."
          : "Member added successfully.";
        this.resetFormState();
        this.loadUsers();
      },
      error: () => {
        this.saving = false;
        this.error = "Failed to add or update member.";
      },
    });
  }

  removeUser(user: OrgUser) {
    if (!user.membershipId || !this.canManageOrgUsers) return;

    const confirmed = confirm(`Remove ${user.email} from this organization?`);
    if (!confirmed) return;

    this.removing[user.membershipId] = true;
    this.error = "";
    this.success = "";

    this.orgUsersService.deleteOrgUser(user.membershipId).subscribe({
      next: () => {
        delete this.removing[user.membershipId!];
        this.users = this.users.filter(
          (u) => u.membershipId !== user.membershipId
        );
        this.success = "User removed from organization.";
      },
      error: () => {
        delete this.removing[user.membershipId!];
        this.error =
          "Failed to remove user (requires ADMIN or OWNER in this org).";
      },
    });
  }
}
