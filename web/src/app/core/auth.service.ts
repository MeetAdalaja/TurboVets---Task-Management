// web/src/app/core/auth.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import {
  BehaviorSubject,
  Observable,
  map,
  tap,
} from 'rxjs';
import { AuthState, OrgSummary } from './models';

const API_BASE_URL = 'http://localhost:3000/api';
const STORAGE_KEY = 'turbovets_auth_state';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private authStateSubject = new BehaviorSubject<AuthState | null>(null);
  authState$ = this.authStateSubject.asObservable();

  private orgsSubject = new BehaviorSubject<OrgSummary[]>([]);
  organizations$ = this.orgsSubject.asObservable();

  constructor(private http: HttpClient) {
    this.loadFromStorage();
  }

  // ---------- state helpers ----------

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
          // clear orgs on fresh login
          this.orgsSubject.next([]);
        }),
        map(() => void 0)
      );
  }

  logout(): void {
    this.setAuthState(null);
    this.orgsSubject.next([]);
  }

  loadOrganizations(): Observable<OrgSummary[]> {
    return this.http
      .get<OrgSummary[]>(`${API_BASE_URL}/me/organizations`)
      .pipe(
        tap((orgs) => {
          this.orgsSubject.next(orgs);
          const current = this.authStateSubject.value;
          if (current && !current.currentOrgId && orgs.length > 0) {
            this.setCurrentOrg(orgs[0]);
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
    if (match) this.setCurrentOrg(match);
  }
}
