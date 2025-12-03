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
    <div class="space-y-6">
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
            <span class="font-semibold text-slate-200">{{
              currentOrgRole
            }}</span>
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
            Your current role (<span class="font-semibold text-slate-100">{{
              currentOrgRole || "unknown"
            }}</span
            >) does not allow you to manage organization members.
          </p>
          <p class="mt-2 text-xs text-slate-400">
            Contact an <span class="font-semibold">OWNER</span> or
            <span class="font-semibold">ADMIN</span> if you need your access
            level changed.
          </p>
        </section>

        <!-- Full management UI -->
        <ng-container *ngIf="canManageOrgUsers">
          <!-- Add / update member -->
          <section class="card-elevated px-4 py-4 sm:px-5 sm:py-5">
            <header class="mb-3 flex items-center justify-between gap-2">
              <div>
                <h3 class="text-sm font-semibold text-slate-50">
                  Add or update member
                </h3>
                <p class="mt-0.5 text-[11px] text-slate-400">
                  Invite a user by email or update the role of an existing
                  member in this organization.
                </p>
              </div>
              <div
                class="hidden rounded-full bg-slate-900 px-3 py-1 text-[11px] text-slate-300 md:inline-flex"
              >
                ADMIN / OWNER only
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

            <form class="space-y-3" (ngSubmit)="onSubmit()">
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
                  class="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  class="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
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
                  class="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                />
                <p class="mt-1 text-[11px] text-slate-500">
                  If the email already exists, this can be used to reset the password.
                  Leaving it empty keeps the existing password or lets the backend
                  generate one (as in the original behavior).
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
                  class="w-full rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 text-sm text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                >
                  <option *ngFor="let r of orgRoles" [value]="r">
                    {{ r }}
                  </option>
                </select>
                <p class="mt-1 text-[11px] text-slate-500">
                  Owners have the highest level of access. Use
                  <span class="font-semibold text-slate-300">ADMIN</span> or
                  <span class="font-semibold text-slate-300">MANAGER</span> for
                  day-to-day coordination, and
                  <span class="font-semibold text-slate-300">VIEWER</span> for
                  read-only access.
                </p>
              </div>

              <!-- Submit -->
              <button
                type="submit"
                [disabled]="saving || !formEmail"
                class="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/40 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <span *ngIf="!saving">Save member</span>
                <span *ngIf="saving">Saving…</span>
              </button>
            </form>
          </section>

          <!-- Members table -->
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
            </header>

            <!-- Loading -->
            <div *ngIf="loading" class="mb-2 text-xs text-slate-400">
              Loading members…
            </div>

            <!-- Empty state -->
            <div
              *ngIf="!loading && !users.length"
              class="text-xs text-slate-400"
            >
              No members found. Add someone using the form above.
            </div>

            <!-- Table -->
            <div
              *ngIf="users.length"
              class="mt-2 max-h-[420px] overflow-auto rounded-xl border border-slate-800 bg-slate-950/40"
            >
              <table class="min-w-full text-left text-xs sm:text-sm">
                <thead
                  class="bg-slate-900/80 text-[11px] uppercase tracking-wide text-slate-400"
                >
                  <tr>
                    <th class="px-3 py-2">Email</th>
                    <th class="px-3 py-2">Name</th>
                    <th class="px-3 py-2">Role</th>
                    <th class="px-3 py-2 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    *ngFor="let user of users"
                    class="border-t border-slate-800 hover:bg-slate-900/60"
                  >
                    <td class="px-3 py-2 align-top">
                      <span
                        class="text-xs font-medium text-slate-100 sm:text-sm"
                      >
                        {{ user.email }}
                      </span>
                    </td>
                    <td class="px-3 py-2 align-top">
                      <span class="text-xs text-slate-200">
                        {{ user.fullName || "—" }}
                      </span>
                    </td>
                    <td class="px-3 py-2 align-top">
                      <span
                        class="inline-flex items-center rounded-full bg-slate-800/80 px-2 py-0.5 text-[11px] font-semibold text-slate-200"
                      >
                        {{ user.role }}
                      </span>
                    </td>
                    <td class="px-3 py-2 align-top text-right">
                      <button
                        class="inline-flex items-center rounded-md bg-rose-500/90 px-2 py-1 text-[11px] font-semibold text-white hover:bg-rose-400 disabled:cursor-not-allowed disabled:opacity-60"
                        (click)="removeUser(user)"
                        [disabled]="
                          user.membershipId
                            ? removing[user.membershipId]
                            : false
                        "
                        *ngIf="user.membershipId"
                      >
                        {{
                          user.membershipId && removing[user.membershipId]
                            ? "Removing…"
                            : "Remove"
                        }}
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
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
      password: passwordTrimmed || undefined, // 👈 optional password, like old UI
    };

    this.orgUsersService.addOrgUser(payload as any).subscribe({
      next: () => {
        this.saving = false;
        this.success = "Member added or updated successfully.";
        this.formEmail = "";
        this.formFullName = "";
        this.formPassword = "";
        this.formRole = "MEMBER";
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
