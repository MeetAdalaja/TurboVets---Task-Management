// web/src/app/app.ts
import { Component, OnInit } from '@angular/core';
import { CommonModule, NgIf, NgFor } from '@angular/common';
import { Router, RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './core/auth.service';
import { OrgSummary } from './core/models';

@Component({
  standalone: true,
  selector: 'app-root', // keep whatever Nx initially generated here
  imports: [CommonModule, RouterOutlet, RouterLink, NgIf, NgFor],
  templateUrl: './app.html',
  styleUrls: ['./app.css'],
})
export class AppComponent implements OnInit {
  organizations: OrgSummary[] = [];
  currentOrgId: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router
  ) {}

  get isLoggedIn(): boolean {
    return this.auth.isLoggedIn;
  }

  get email(): string | null {
    return this.auth.email;
  }

  get currentOrgRole(): string | null {
    return this.auth.getCurrentOrgRole();
  }

  ngOnInit(): void {
    this.auth.organizations$.subscribe((orgs) => {
      this.organizations = orgs;
      this.currentOrgId = this.auth.currentOrgId;
    });

    if (this.auth.isLoggedIn) {
      this.auth.loadOrganizations().subscribe({
        error: () => {
          // ignore for now – pages will also handle missing orgs
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
    this.router.navigate(['/login']);
  }
}
