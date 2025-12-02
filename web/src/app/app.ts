// web/src/app/app.component.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { OrgSummary } from './core/models';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, NgIf, NgFor],
  template: `
    <div class="app-shell">
      <header class="app-header">
        <div class="left">
          <span class="logo">TurboVets Tasker</span>
        </div>

        <div class="right" *ngIf="isLoggedIn; else loggedOut">
          <span class="user">
            {{ email }}
          </span>

          <ng-container *ngIf="organizations?.length">
            <label class="org-label">
              Org:
              <select
                [value]="currentOrgId || ''"
                (change)="onOrgChange($event)"
              >
                <option
                  *ngFor="let org of organizations"
                  [value]="org.organizationId"
                >
                  {{ org.organizationName }} ({{ org.role }})
                </option>
              </select>
            </label>
          </ng-container>

          <nav class="nav-links">
            <a routerLink="/tasks" routerLinkActive="active">Tasks</a>
            <a routerLink="/org-users" routerLinkActive="active"
              >Org Users</a
            >
          </nav>

          <button class="logout-btn" (click)="logout()">Logout</button>
        </div>

        <ng-template #loggedOut>
          <div class="right">
            <a routerLink="/login">Login</a>
          </div>
        </ng-template>
      </header>

      <main class="app-main">
        <router-outlet></router-outlet>
      </main>
    </div>
  `,
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  organizations: OrgSummary[] = [];
  currentOrgId: string | null = null;

  constructor(private auth: AuthService) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn;
  }

  get email(): string | null {
    return this.auth.email;
  }

  ngOnInit(): void {
    // Subscribe to org list
    this.auth.organizations$.subscribe((orgs) => {
      this.organizations = orgs;
      this.currentOrgId = this.auth.currentOrgId;
    });

    // If already logged in (e.g., after page refresh), load orgs
    if (this.auth.isLoggedIn) {
      this.auth.loadOrganizations().subscribe({
        error: () => {
          // Ignore for now; page components will also handle missing orgs
        },
      });
    }
  }

  onOrgChange(event: Event) {
  const select = event.target as HTMLSelectElement | null;
  const value = select?.value;
  if (!value) return;

  this.auth.setCurrentOrgById(value);
  this.currentOrgId = value;
}


  logout() {
    this.auth.logout();
  }
}
