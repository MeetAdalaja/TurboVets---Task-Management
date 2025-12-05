// web/src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  map,
  tap,
} from 'rxjs';
import { AuthState, OrgRole, OrgSummary } from './models';

const API_BASE_URL =
  window.location.hostname === 'localhost'
    ? 'http://localhost:3000/api'
    : '/api';

const STORAGE_KEY = 'turbovets_auth_state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState | null>(null);
  authState$ = this.authStateSubject.asObservable();

  private orgsSubject = new BehaviorSubject<OrgSummary[]>([]);
  /**
   * All orgs the current user belongs to.
   */
  organizations$ = this.orgsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  // ---------- basic state helpers ----------

  private setAuthState(state: AuthState | null): void {
    this.authStateSubject.next(state);
    if (state) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
  }

  private loadFromStorage(): void {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return;
      const parsed = JSON.parse(raw) as AuthState;
      this.authStateSubject.next(parsed);
    } catch {
      // ignore parse errors
    }
  }

  get token(): string | null {
    return this.authStateSubject.value?.token ?? null;
  }

  get isLoggedIn(): boolean {
    return !!this.token;
  }

  get email(): string | null {
    return this.authStateSubject.value?.email ?? null;
  }

  get currentOrgId(): string | null {
    return this.authStateSubject.value?.currentOrgId ?? null;
  }

  get currentOrgName(): string | null {
    return this.authStateSubject.value?.currentOrgName ?? null;
  }

  // ---------- role helpers ----------

  /**
   * Get the user's role in the currently selected organization.
   */
  getCurrentOrgRole(): OrgRole | null {
    const orgId = this.currentOrgId;
    if (!orgId) return null;
    const org = this.orgsSubject.value.find(
      (o) => o.organizationId === orgId
    );
    return org?.role ?? null;
  }

  get isAdminOrOwner(): boolean {
    const role = this.getCurrentOrgRole();
    return role === 'ADMIN' || role === 'OWNER';
  }

  get isManagerOrAbove(): boolean {
    const role = this.getCurrentOrgRole();
    return (
      role === 'MANAGER' ||
      role === 'ADMIN' ||
      role === 'OWNER'
    );
  }

  // ---------- API calls ----------

  login(email: string, password: string): Observable<void> {
    return this.http
      .post<{ access_token: string }>(`${API_BASE_URL}/auth/login`, {
        email,
        password,
      })
      .pipe(
        tap((res) => {
          const state: AuthState = {
            token: res.access_token,
            email,
          };
          this.setAuthState(state);
          this.orgsSubject.next([]);
        }),
        map(() => void 0)
      );
  }

  logout(): void {
    this.setAuthState(null);
    this.orgsSubject.next([]);
  }

  /**
   * Load organizations for the current user.
   * Automatically picks the first org if none selected yet.
   */
  loadOrganizations(): Observable<OrgSummary[]> {
    return this.http
      .get<OrgSummary[]>(`${API_BASE_URL}/me/organizations`)
      .pipe(
        tap((orgs) => {
          this.orgsSubject.next(orgs);
          const current = this.authStateSubject.value;
          if (current && !current.currentOrgId && orgs.length > 0) {
            this.setCurrentOrg(orgs[0]);
          } else if (current && current.currentOrgId) {
            // if we had a selected org but its name/role changed, sync it
            const match = orgs.find(
              (o) => o.organizationId === current.currentOrgId
            );
            if (match) {
              this.setCurrentOrg(match);
            }
          }
        })
      );
  }

  setCurrentOrg(org: OrgSummary): void {
    const current = this.authStateSubject.value;
    if (!current) return;

    const next: AuthState = {
      ...current,
      currentOrgId: org.organizationId,
      currentOrgName: org.organizationName,
    };
    this.setAuthState(next);
  }

  setCurrentOrgById(orgId: string): void {
    const orgs = this.orgsSubject.value;
    const match = orgs.find((o) => o.organizationId === orgId);
    if (match) {
      this.setCurrentOrg(match);
    }
  }
}
