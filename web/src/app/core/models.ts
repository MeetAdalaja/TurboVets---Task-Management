// web/src/app/core/models.ts

export type OrgRole = 'OWNER' | 'ADMIN' | 'MANAGER' | 'MEMBER' | 'VIEWER';

export interface OrgSummary {
  organizationId: string;
  organizationName: string;
  role: OrgRole;
}

export interface AuthState {
  token: string;
  email: string;
  currentOrgId?: string;
  currentOrgName?: string;
}

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';

export interface TaskUser {
  id: string;
  email: string;
  fullName: string;
}

export interface Task {
  id: string;
  title: string;
  description?: string;
  status: TaskStatus;
  dueDate?: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: TaskUser | null;
}

export interface OrgUser {
  userId: string;
  email: string;
  fullName: string;
  role: OrgRole;
}
