// web/src/app/app.ts
import { Component, OnInit, Inject, PLATFORM_ID } from "@angular/core";
import { isPlatformBrowser } from "@angular/common";
import { CommonModule, NgIf, NgFor } from "@angular/common";
import {
  Router,
  RouterLink,
  RouterOutlet,
  RouterLinkActive,
} from "@angular/router";
import { AuthService } from "./core/auth.service";
import { OrgSummary } from "./core/models";
import { ToastContainerComponent } from "./shared/toast-container.component";

@Component({
  standalone: true,
  selector: "app-root", // keep whatever Nx initially generated here
  imports: [
    CommonModule,
    RouterOutlet,
    RouterLink,
    RouterLinkActive,
    NgIf,
    NgFor,
    ToastContainerComponent 
  ],
  templateUrl: "./app.html",
  styleUrls: ["./app.css"],
})
export class AppComponent implements OnInit {
  organizations: OrgSummary[] = [];
  currentOrgId: string | null = null;
   isDarkMode = true;

  constructor(
    @Inject(PLATFORM_ID) private platformId: Object,
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
    this.initTheme();
  }

  private initTheme() {
    if (!isPlatformBrowser(this.platformId)) return;

    const stored = localStorage.getItem("theme");

    if (stored === "light") {
      this.isDarkMode = false;
      document.documentElement.classList.remove("dark");
    } else {
      // default to dark if nothing stored
      this.isDarkMode = true;
      document.documentElement.classList.add("dark");
    }
  }

  toggleTheme() {
    if (!isPlatformBrowser(this.platformId)) return;

    this.isDarkMode = !this.isDarkMode;

    if (this.isDarkMode) {
      document.documentElement.classList.add('dark');
      localStorage.setItem('theme', 'dark');
    } else {
      document.documentElement.classList.remove('dark');
      localStorage.setItem('theme', 'light');
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
    this.router.navigate(["/login"]);
  }
}
