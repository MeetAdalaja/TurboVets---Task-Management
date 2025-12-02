// web/src/app/features/org-users/org-users.service.ts
import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { OrgRole, OrgUser } from '../../core/models';
import { Observable } from 'rxjs';

const API_BASE_URL = 'http://localhost:3000/api';

export interface AddOrgUserInput {
  email: string;
  fullName: string;
  role: OrgRole;
  password?: string;
}

@Injectable({ providedIn: 'root' })
export class OrgUsersService {
  constructor(private http: HttpClient) {}

  getOrgUsers(): Observable<OrgUser[]> {
    return this.http.get<OrgUser[]>(`${API_BASE_URL}/org-users`);
  }

  addOrgUser(input: AddOrgUserInput): Observable<any> {
    return this.http.post(`${API_BASE_URL}/org-users`, input);
  }
}
