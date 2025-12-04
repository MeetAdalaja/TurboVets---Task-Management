// web/src/app/features/login/login.component.ts
import { Component } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { Router, ActivatedRoute } from "@angular/router";
import { AuthService } from "../../core/auth.service";
import { ToastService } from "../../shared/toast.service";

@Component({
  standalone: true,
  selector: "app-login",
  imports: [CommonModule, FormsModule],
  template: `
    <div class="flex min-h-[72vh] items-center justify-center">
      <div
        class="grid w-full max-w-4xl grid-cols-1 gap-8 md:grid-cols-[minmax(0,1.05fr)_minmax(0,0.95fr)]"
      >
        <!-- Left side: branding / copy -->
        <section class="hidden md:flex flex-col justify-center gap-10">
          <!-- Pill -->
          <div
            class="inline-flex items-center gap-2 rounded-full bg-slate-900/70 px-3 py-1 text-[11px] text-slate-300 ring-1 ring-slate-800"
          >
            <span
              class="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400"
            ></span>
            TurboVets Tasker
          </div>

          <!-- Full-width illustration card (NEW) -->
          <div class="w-full">
            <div
              class="relative w-full overflow-hidden rounded-3xl border border-slate-200 bg-gradient-to-br from-indigo-50 via-slate-50 to-emerald-50 px-4 py-4 shadow-lg shadow-slate-200/80 dark:border-slate-800 dark:from-slate-900/90 dark:via-slate-950 dark:to-slate-900/90 dark:shadow-[0_18px_45px_rgba(15,23,42,0.85)]"
            >
              <!-- soft glows -->
              <div
                class="pointer-events-none absolute -top-10 -left-10 h-24 w-32 rounded-full bg-indigo-400/30 blur-3xl dark:bg-indigo-500/30"
              ></div>
              <div
                class="pointer-events-none absolute -bottom-12 -right-4 h-28 w-40 rounded-full bg-emerald-400/25 blur-3xl dark:bg-emerald-500/25"
              ></div>

              <div
                class="relative flex flex-col gap-4 sm:flex-row sm:items-center"
              >
                <!-- Text side -->
                <div class="space-y-2 sm:w-1/2">
                  <p
                    class="text-[11px] font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400"
                  >
                    Unified task view
                  </p>
                  <h2
                    class="text-base font-semibold text-slate-900 dark:text-slate-50"
                  >
                    See every organization, team member, and task at a glance.
                  </h2>
                  <p
                    class="text-[11px] leading-relaxed text-slate-600 dark:text-slate-400"
                  >
                    TurboVets Tasker connects multiple organizations into a single
                    space so owners, admins, managers, and staff stay aligned
                    on what’s happening next.
                  </p>

                  <!-- Small stats chips -->
                  <div class="mt-3 flex flex-wrap gap-2 text-[10px]">
                    <span
                      class="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:ring-slate-700/80"
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full bg-emerald-400"
                      ></span>
                      Real-time updates
                    </span>
                    <span
                      class="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:ring-slate-700/80"
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full bg-indigo-400"
                      ></span>
                      Multi-org RBAC
                    </span>
                    <span
                      class="inline-flex items-center gap-1 rounded-full bg-white/80 px-2 py-0.5 text-slate-700 ring-1 ring-slate-200 dark:bg-slate-900/80 dark:text-slate-200 dark:ring-slate-700/80"
                    >
                      <span
                        class="h-1.5 w-1.5 rounded-full bg-amber-400"
                      ></span>
                      Activity history
                    </span>
                  </div>
                </div>

                <!-- Illustration side -->
                <div class="sm:w-1/2">
                  <svg
                    viewBox="0 0 260 150"
                    class="mx-auto w-full max-w-xs drop-shadow-sm"
                    aria-hidden="true"
                  >
                    <!-- Background panel -->
                    <rect
                      x="10"
                      y="10"
                      width="240"
                      height="130"
                      rx="14"
                      class="fill-white stroke-slate-200"
                    ></rect>
                    <!-- Dark mode overlay -->
                    <rect
                      x="10"
                      y="10"
                      width="240"
                      height="130"
                      rx="14"
                      class="hidden dark:block fill-slate-900 stroke-slate-700"
                    ></rect>

                    <!-- Top bar -->
                    <circle cx="26" cy="26" r="3" class="fill-rose-400"></circle>
                    <circle cx="36" cy="26" r="3" class="fill-amber-400"></circle>
                    <circle cx="46" cy="26" r="3" class="fill-emerald-400"></circle>

                    <rect
                      x="70"
                      y="20"
                      width="60"
                      height="12"
                      rx="6"
                      class="fill-slate-100 dark:fill-slate-800"
                    ></rect>
                    <rect
                      x="135"
                      y="20"
                      width="40"
                      height="12"
                      rx="6"
                      class="fill-indigo-100 dark:fill-indigo-900"
                    ></rect>

                    <!-- Columns: To Do / In Progress / Done -->
                    <!-- Column labels -->
                    <text
                      x="35"
                      y="48"
                      class="fill-slate-500 dark:fill-slate-400"
                      font-size="8"
                    >
                      To do
                    </text>
                    <text
                      x="100"
                      y="48"
                      class="fill-slate-500 dark:fill-slate-400"
                      font-size="8"
                    >
                      In Progress
                    </text>
                    <text
                      x="190"
                      y="48"
                      class="fill-slate-500 dark:fill-slate-400"
                      font-size="8"
                    >
                      Done
                    </text>

                    <!-- Column separators -->
                    <line
                      x1="80"
                      y1="40"
                      x2="80"
                      y2="130"
                      class="stroke-slate-100 dark:stroke-slate-800"
                      stroke-width="1"
                    ></line>
                    <line
                      x1="160"
                      y1="40"
                      x2="160"
                      y2="130"
                      class="stroke-slate-100 dark:stroke-slate-800"
                      stroke-width="1"
                    ></line>

                    <rect
                      x="25"
                      y="56"
                      width="45"
                      height="20"
                      rx="6"
                      class="fill-slate-50 stroke-slate-200 dark:fill-slate-900 dark:stroke-slate-700"
                    ></rect>
                    <rect
                      x="25"
                      y="82"
                      width="45"
                      height="20"
                      rx="6"
                      class="fill-slate-50 stroke-slate-200 dark:fill-slate-900 dark:stroke-slate-700"
                    ></rect>
                    <rect
                      x="25"
                      y="108"
                      width="45"
                      height="20"
                      rx="6"
                      class="fill-slate-50 stroke-slate-200 dark:fill-slate-900 dark:stroke-slate-700"
                    ></rect>

                    <rect
                      x="30"
                      y="60"
                      width="25"
                      height="4"
                      rx="2"
                      class="fill-slate-300 dark:fill-slate-500"
                    ></rect>
                    <rect
                      x="30"
                      y="86"
                      width="30"
                      height="4"
                      rx="2"
                      class="fill-slate-300 dark:fill-slate-500"
                    ></rect>
                    <rect
                      x="30"
                      y="112"
                      width="20"
                      height="4"
                      rx="2"
                      class="fill-slate-300 dark:fill-slate-500"
                    ></rect>

                    <!-- In progress cards -->
                    <rect
                      x="100"
                      y="56"
                      width="50"
                      height="22"
                      rx="8"
                      class="fill-indigo-50 stroke-indigo-200 dark:fill-indigo-900/60 dark:stroke-indigo-700"
                    ></rect>
                    <rect
                      x="100"
                      y="86"
                      width="50"
                      height="22"
                      rx="8"
                      class="fill-indigo-50 stroke-indigo-200 dark:fill-indigo-900/60 dark:stroke-indigo-700"
                    ></rect>

                    <!-- In progress labels -->
                    <rect
                      x="106"
                      y="60"
                      width="26"
                      height="4"
                      rx="2"
                      class="fill-indigo-300 dark:fill-indigo-400"
                    ></rect>
                    <rect
                      x="106"
                      y="90"
                      width="30"
                      height="4"
                      rx="2"
                      class="fill-indigo-300 dark:fill-indigo-400"
                    ></rect>

                    <!-- Done cards -->
                    <rect
                      x="175"
                      y="60"
                      width="50"
                      height="18"
                      rx="8"
                      class="fill-emerald-50 stroke-emerald-200 dark:fill-emerald-900/60 dark:stroke-emerald-700"
                    ></rect>
                    <rect
                      x="175"
                      y="88"
                      width="50"
                      height="18"
                      rx="8"
                      class="fill-emerald-50 stroke-emerald-200 dark:fill-emerald-900/60 dark:stroke-emerald-700"
                    ></rect>

                    <!-- Done labels -->
                    <rect
                      x="181"
                      y="63"
                      width="28"
                      height="4"
                      rx="2"
                      class="fill-emerald-300 dark:fill-emerald-400"
                    ></rect>
                    <rect
                      x="181"
                      y="91"
                      width="22"
                      height="4"
                      rx="2"
                      class="fill-emerald-300 dark:fill-emerald-400"
                    ></rect>

                  </svg>
                </div>
              </div>
            </div>
          </div>

          <!-- Heading + copy under the illustration -->
          <div class="space-y-3">
            <h1 class="text-2xl font-semibold tracking-tight text-slate-900 dark:text-slate-50">
              Sign in to manage tasks across Organizations
            </h1>

            <p class="text-sm text-slate-600 dark:text-slate-300">
              Use this dashboard to triage tasks, assign work across locations,
              and keep visibility on who’s responsible for what in each
              organization.
            </p>

            <ul class="mt-2 space-y-2 text-sm text-slate-600 dark:text-slate-300">
              <li class="flex items-start gap-2">
                <span
                  class="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
                ></span>
                <span
                  >Two-level organizational RBAC with various roles.</span
                >
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
                ></span>
                <span>
                  Task creation, status updates, and assignment to org members.
                </span>
              </li>
              <li class="flex items-start gap-2">
                <span
                  class="mt-1 inline-block h-1.5 w-1.5 rounded-full bg-indigo-400"
                ></span>
                <span>
                  Support for users who belong to multiple organizations.
                </span>
              </li>
            </ul>
          </div>
        </section>

        <!-- Right side: login card (unchanged) -->
        <section class="card-elevated px-5 py-6 sm:px-7 sm:py-7 md:px-8 ">
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

          <!-- Toggle button for example logins -->
          <button
            type="button"
            (click)="showExamples = !showExamples"
            class="mb-3 inline-flex items-center gap-1 rounded-full border border-slate-700 bg-slate-900/70 px-2.5 py-1 text-[11px] font-medium text-slate-200 hover:bg-slate-800/80"
          >
            <span class="h-1.5 w-1.5 rounded-full bg-emerald-400"></span>
            <span>
              {{ showExamples ? "Hide example logins" : "Show example logins" }}
            </span>
            <span class="text-[10px] text-slate-400">
              {{ showExamples ? "▲" : "▼" }}
            </span>
          </button>

          <!-- Sample credentials helper (collapsible) -->
          <div
            *ngIf="showExamples"
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
                  class="flex-1 bg-transparent text-sm text-slate-100 placeholder:text-slate-500 focus:outline-none "
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
  showExamples = false;

  private returnUrl: string | null = null;

  constructor(
    private auth: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toast: ToastService 
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

        this.toast.show("Signed in successfully.", {
          type: "success",
          title: "Welcome back",
        });

        this.router.navigate([this.returnUrl || "/"]);
      },
      error: () => {
        this.loading = false;
        this.error = "Invalid email or password.";

        this.toast.show("Invalid email or password.", {
          type: "error",
          title: "Sign-in failed",
        });
      },
    });
  }

}
