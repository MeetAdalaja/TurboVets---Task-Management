// web/src/app/features/login/login.component.ts
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../core/auth.service';

@Component({
  standalone: true,
  selector: 'app-login',
  imports: [CommonModule, FormsModule],
  template: `
    <div class="login-container">
      <h2>Sign in</h2>

      <form (ngSubmit)="onSubmit()" #form="ngForm">
        <div class="field">
          <label>Email</label>
          <input
            type="email"
            name="email"
            [(ngModel)]="email"
            required
            autocomplete="email"
          />
        </div>

        <div class="field">
          <label>Password</label>
          <input
            type="password"
            name="password"
            [(ngModel)]="password"
            required
            autocomplete="current-password"
          />
        </div>

        <div class="error" *ngIf="error">
          {{ error }}
        </div>

        <button type="submit" [disabled]="loading || form.invalid">
          {{ loading ? 'Signing in...' : 'Sign in' }}
        </button>
      </form>

      <p class="hint">
        Use seeded credentials:
        <code>owner@example.com / Password123!</code>
      </p>
    </div>
  `,
  styleUrls: ['./login.css'],
})
export class LoginComponent {
  email = '';
  password = '';
  loading = false;
  error = '';

  private returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get('returnUrl');
  }

  onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.error = '';

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.auth.loadOrganizations().subscribe();
        this.router.navigate([this.returnUrl || '/']);
      },
      error: () => {
        this.loading = false;
        this.error = 'Invalid email or password.';
      },
    });
  }
}
