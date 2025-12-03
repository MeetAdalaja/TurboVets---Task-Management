// web/src/app/features/org-users/org-users-page.component.ts
import { Component, OnInit } from "@angular/core";
import { CommonModule, NgFor, NgIf } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { OrgUsersService } from "./org-users.service";
import { AuthService } from "../../core/auth.service";
import { OrgRole, OrgUser } from "../../core/models";

@Component({
  standalone: true,
  selector: "app-org-users-page",
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  template: `
    <div class="org-users-page">
      <h2>Organization users</h2>

      <!-- No org selected -->
      <div class="info" *ngIf="!currentOrgId">
        <p>Please select an organization in the header.</p>
      </div>

      <!-- Org selected but not enough role -->
      <div class="info warning" *ngIf="currentOrgId && !canManageOrgUsers">
        <p>
          You are logged in as
          <strong>{{ currentOrgRole || "UNKNOWN" }}</strong> in this
          organization. Only <strong>ADMIN</strong> and
          <strong>OWNER</strong> can view and manage members.
        </p>
      </div>

      <!-- Full access section -->
      <ng-container *ngIf="currentOrgId && canManageOrgUsers">
        <section class="create-card">
          <h3>Add / update user</h3>
          <form (ngSubmit)="onSubmit()">
            <div class="field">
              <label>Email</label>
              <input
                type="email"
                [(ngModel)]="form.email"
                name="email"
                required
                placeholder="user@example.com"
              />
            </div>

            <div class="field">
              <label>Full name</label>
              <input
                type="text"
                [(ngModel)]="form.fullName"
                name="fullName"
                required
              />
            </div>

            <div class="field">
              <label>Role</label>
              <select [(ngModel)]="form.role" name="role" required>
                <option value="OWNER">OWNER</option>
                <option value="ADMIN">ADMIN</option>
                <option value="MANAGER">MANAGER</option>
                <option value="MEMBER">MEMBER</option>
                <option value="VIEWER">VIEWER</option>
              </select>
            </div>

            <div class="field">
              <label>
                Temp password (optional, only used if user is new)
              </label>
              <input
                type="password"
                [(ngModel)]="form.password"
                name="password"
                placeholder="ChangeMe123!"
              />
            </div>

            <div class="error" *ngIf="error">{{ error }}</div>
            <div class="success" *ngIf="success">{{ success }}</div>

            <button type="submit" [disabled]="saving">
              {{ saving ? "Saving..." : "Save user" }}
            </button>
          </form>
        </section>

        <section class="list-card">
          <h3>Members</h3>

          <div *ngIf="loading">Loading users...</div>
          <div *ngIf="error && !saving" class="error">{{ error }}</div>

          <table *ngIf="users.length" class="users-table">
            <thead>
              <tr>
                <th>Email</th>
                <th>Name</th>
                <th>Role</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr *ngFor="let user of users">
                <td>{{ user.email }}</td>
                <td>{{ user.fullName }}</td>
                <td>{{ user.role }}</td>
                <td>
                  <button
                    class="danger-btn"
                    (click)="removeUser(user)"
                    [disabled]="
                      user.membershipId ? removing[user.membershipId] : false
                    "
                  >
                    {{
                      user.membershipId && removing[user.membershipId]
                        ? "Removing..."
                        : "Remove"
                    }}
                  </button>
                </td>
              </tr>
            </tbody>
          </table>

          <div *ngIf="!loading && !users.length && !error">No users found.</div>
        </section>
      </ng-container>
    </div>
  `,
  styleUrls: ["./org-users-page.component.css"],
})
export class OrgUsersPageComponent implements OnInit {
  users: OrgUser[] = [];
  loading = false;
  saving = false;
  error = "";
  success = "";

  form: {
    email: string;
    fullName: string;
    role: OrgRole;
    password?: string;
  } = {
    email: "",
    fullName: "",
    role: "MEMBER",
  };

  currentOrgId: string | null = null;
  currentOrgRole: OrgRole | null = null;
  canManageOrgUsers = false;
  removing: Record<string, boolean> = {};

  constructor(
    private orgUsersService: OrgUsersService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.auth.isLoggedIn) return;

    this.currentOrgId = this.auth.currentOrgId;
    this.currentOrgRole = this.auth.getCurrentOrgRole();
    this.canManageOrgUsers = this.auth.isAdminOrOwner;

    if (!this.currentOrgId) {
      this.auth.loadOrganizations().subscribe({
        next: () => {
          this.currentOrgId = this.auth.currentOrgId;
          this.currentOrgRole = this.auth.getCurrentOrgRole();
          this.canManageOrgUsers = this.auth.isAdminOrOwner;
          if (this.currentOrgId && this.canManageOrgUsers) {
            this.loadUsers();
          }
        },
        error: () => {
          this.error = "Failed to load organizations";
        },
      });
    } else if (this.canManageOrgUsers) {
      this.loadUsers();
    }
  }

  loadUsers() {
    if (!this.currentOrgId || !this.canManageOrgUsers) return;

    this.loading = true;
    this.error = "";
    this.success = "";

    this.orgUsersService.getOrgUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = "Failed to load users (requires ADMIN or OWNER in org).";
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (!this.currentOrgId || !this.canManageOrgUsers) return;

    this.saving = true;
    this.error = "";
    this.success = "";

    this.orgUsersService.addOrgUser(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.success = "User added/updated successfully.";
        this.loadUsers();
      },
      error: () => {
        this.saving = false;
        this.error =
          "Failed to add/update user (requires ADMIN or OWNER in org).";
      },
    });
  }

  removeUser(user: OrgUser) {
    if (!user.membershipId) {
      return;
    }

    const confirmed = confirm(`Remove ${user.email} from this organization?`);
    if (!confirmed) return;

    this.error = "";
    this.success = "";
    this.removing[user.membershipId] = true;

    this.orgUsersService.deleteOrgUser(user.membershipId).subscribe({
      next: () => {
        delete this.removing[user.membershipId!];
        // Remove from local list
        this.users = this.users.filter(
          (u) => u.membershipId !== user.membershipId
        );
        this.success = "User removed from organization.";
      },
      error: () => {
        delete this.removing[user.membershipId!];
        this.error = "Failed to remove user (requires ADMIN or OWNER in org).";
      },
    });
  }
}
