// web/src/app/features/login/login.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../core/auth.service";

@Component({
  standalone: true,
  selector: "app-login",
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-[72vh] items-center justify-center">
      <div
        class="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
      >
        <!-- Left side: branding / copy (desktop only) -->
        <section class="hidden flex-col justify-center gap-4 md:flex">
          <div
            class="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-800"
          >
            <span
              class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
            ></span>
            Internal tool · TurboVets assessment
          </div>

          <h1 class="text-2xl font-semibold tracking-tight text-slate-50">
            Sign in to manage tasks across clinics
          </h1>

          <p class="text-sm text-slate-300">
            Use this dashboard to triage tasks, assign work across locations,
            and keep visibility on who’s responsible for what in each
            organization.
          </p>

          <ul class="mt-2 space-y-2 text-sm text-slate-300">
            <li class="flex items-start gap-2">
              <span
                class="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
              ></span>
              <span>Two-level organizational RBAC with per-clinic roles.</span>
            </li>
            <li class="flex items-start gap-2">
              <span
                class="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
              ></span>
              <span
                >Task creation, status updates, and assignment to org
                members.</span
              >
            </li>
            <li class="flex items-start gap-2">
              <span
                class="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
              ></span>
              <span
                >Support for users who belong to multiple organizations.</span
              >
            </li>
          </ul>
        </section>

        <!-- Right side: login card -->
        <section class="card-elevated px-5 py-6 sm:px-7 sm:py-7 md:px-8">
          <div class="mb-5 flex items-start justify-between gap-3">
            <div>
              <h2 class="text-lg font-semibold text-slate-50">Welcome back</h2>
              <p class="mt-1 text-xs text-slate-400">
                Sign in with one of the seeded demo accounts to explore the
                app’s behavior across different roles.
              </p>
            </div>
            <div
              class="hidden rounded-full bg-slate-900 px-3 py-1 text-[11px] font-medium text-slate-300 sm:inline-flex"
            >
              v1 · Assessment build
            </div>
          </div>

          <!-- Sample credentials helper -->
          <div
            class="mb-5 grid gap-2 rounded-xl bg-slate-900/70 p-3 text-[11px] text-slate-300 ring-1 ring-slate-800"
          >
            <div class="flex items-center justify-between gap-2">
              <span class="font-semibold text-slate-100">Example logins</span>
              <span
                class="rounded-full bg-slate-800 px-2 py-0.5 text-[10px] uppercase tracking-wide text-slate-400"
              >
                Seeded users
              </span>
            </div>
            <div class="grid gap-1.5">
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
                >
                  OWNER
                </span>
                <span class="font-mono text-[11px]">owner.sd@example.com</span>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
                >
                  OWNER
                </span>
                <span class="font-mono text-[11px]">owner.aus@example.com</span>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full bg-emerald-500/15 px-2 py-0.5 text-[10px] font-semibold text-emerald-300"
                >
                  OWNER
                </span>
                <span class="font-mono text-[11px]">owner.hp@example.com</span>
              </div>
              <div class="flex flex-wrap items-center gap-2">
                <span
                  class="rounded-full bg-sky-500/15 px-2 py-0.5 text-[10px] font-semibold text-sky-300"
                >
                  MULTI-ORG
                </span>
                <span class="font-mono text-[11px]"
                  >multi.user@example.com</span
                >
              </div>
            </div>
            <p class="mt-1 text-[11px] text-slate-400">
              Password for all seeded accounts:
              <span class="font-mono text-slate-200">Password123!</span>
            </p>
          </div>

          <form class="space-y-4" (ngSubmit)="onSubmit()">
            <!-- Email -->
            <div class="space-y-1.5">
              <label
                class="block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                for="email"
              >
                Email
              </label>
              <div
                class="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
              >
                <span class="text-xs text-slate-500">@</span>
                <input
                  id="email"
                  type="email"
                  name="email"
                  [(ngModel)]="email"
                  placeholder="owner.sd@example.com"
                  class="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  required
                  autocomplete="email"
                />
              </div>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <label
                class="block text-[11px] font-semibold uppercase tracking-wide text-slate-400"
                for="password"
              >
                Password
              </label>
              <div
                class="flex items-center gap-2 rounded-lg border border-slate-800 bg-slate-950/60 px-3 py-2 focus-within:ring-2 focus-within:ring-indigo-500 focus-within:border-indigo-500"
              >
                <span class="text-xs text-slate-500">•••</span>
                <input
                  id="password"
                  type="password"
                  name="password"
                  [(ngModel)]="password"
                  placeholder="Password123!"
                  class="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none"
                  required
                  autocomplete="current-password"
                />
              </div>
            </div>

            <!-- Error message -->
            <div
              *ngIf="error"
              class="flex items-start gap-2 rounded-lg border border-rose-500/50 bg-rose-500/10 px-3 py-2 text-xs text-rose-100"
            >
              <span class="mt-0.5 h-1.5 w-1.5 rounded-full bg-rose-400"></span>
              <p>{{ error }}</p>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              [disabled]="loading || !email || !password"
              class="inline-flex w-full items-center justify-center rounded-lg bg-indigo-500 px-3 py-2 text-sm font-semibold text-white shadow-sm shadow-indigo-500/40 hover:bg-indigo-400 disabled:cursor-not-allowed disabled:opacity-60"
            >
              <span *ngIf="!loading">Sign in</span>
              <span *ngIf="loading">Signing in…</span>
            </button>
          </form>

          <p class="mt-4 text-[11px] text-slate-500">
            Tip: log in as an
            <span class="font-semibold text-slate-300">OWNER</span> first to
            manage members and see the full RBAC behavior, then try the
            <span class="font-mono text-slate-300">multi.user@example.com</span>
            account.
          </p>
        </section>
      </div>
    </div>
  `,
  styleUrls: ["./login.css"],
})
export class LoginComponent {
  email = "";
  password = "";
  loading = false;
  error = "";

  private returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.returnUrl = this.route.snapshot.queryParamMap.get("returnUrl");
  }

  onSubmit() {
    if (!this.email || !this.password) return;

    this.loading = true;
    this.error = "";

    this.auth.login(this.email, this.password).subscribe({
      next: () => {
        this.loading = false;
        this.auth.loadOrganizations().subscribe();
        this.router.navigate([this.returnUrl || "/"]);
      },
      error: () => {
        this.loading = false;
        this.error = "Invalid email or password.";
      },
    });
  }
}
