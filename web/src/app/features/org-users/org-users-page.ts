// web/src/app/features/org-users/org-users-page.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { OrgUsersService } from './org-users.service';
import { OrgRole, OrgUser } from '../../core/models';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-org-users-page',
  imports: [CommonModule, NgFor, NgIf, FormsModule],
  template: `
    <div class="org-users-page">
      <h2>Organization users</h2>

      <div class="info" *ngIf="!currentOrgId">
        <p>Please select an organization in the header.</p>
      </div>

      <section *ngIf="currentOrgId" class="create-card">
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
            <label>Temp password (optional, only used if user is new)</label>
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
            {{ saving ? 'Saving...' : 'Save user' }}
          </button>
        </form>
      </section>

      <section *ngIf="currentOrgId" class="list-card">
        <h3>Members</h3>

        <div *ngIf="loading">Loading users...</div>
        <div *ngIf="error && !saving" class="error">{{ error }}</div>

        <table *ngIf="users.length" class="users-table">
          <thead>
            <tr>
              <th>Email</th>
              <th>Name</th>
              <th>Role</th>
            </tr>
          </thead>
          <tbody>
            <tr *ngFor="let user of users">
              <td>{{ user.email }}</td>
              <td>{{ user.fullName }}</td>
              <td>{{ user.role }}</td>
            </tr>
          </tbody>
        </table>

        <div *ngIf="!loading && !users.length && !error">
          No users found.
        </div>
      </section>
    </div>
  `,
  styleUrls: ['./org-users-page.css'],
})
export class OrgUsersPageComponent implements OnInit {
  users: OrgUser[] = [];
  loading = false;
  saving = false;
  error = '';
  success = '';

  form: {
    email: string;
    fullName: string;
    role: OrgRole;
    password?: string;
  } = {
    email: '',
    fullName: '',
    role: 'MEMBER',
  };

  get currentOrgId(): string | null {
    return this.auth.currentOrgId;
  }

  constructor(
    private orgUsersService: OrgUsersService,
    private auth: AuthService
  ) {}

  ngOnInit(): void {
    if (!this.auth.currentOrgId && this.auth.isLoggedIn) {
      this.auth.loadOrganizations().subscribe({
        next: () => this.loadUsers(),
        error: () => (this.error = 'Failed to load organizations'),
      });
    } else {
      this.loadUsers();
    }
  }

  loadUsers() {
    if (!this.currentOrgId) return;

    this.loading = true;
    this.error = '';
    this.success = '';

    this.orgUsersService.getOrgUsers().subscribe({
      next: (users) => {
        this.users = users;
        this.loading = false;
      },
      error: () => {
        this.error = 'Failed to load users (requires ADMIN in org)';
        this.loading = false;
      },
    });
  }

  onSubmit() {
    if (!this.currentOrgId) return;

    this.saving = true;
    this.error = '';
    this.success = '';

    this.orgUsersService.addOrgUser(this.form).subscribe({
      next: () => {
        this.saving = false;
        this.success = 'User added/updated successfully.';
        this.loadUsers();
      },
      error: () => {
        this.saving = false;
        this.error = 'Failed to add/update user (requires ADMIN in org).';
      },
    });
  }
}
