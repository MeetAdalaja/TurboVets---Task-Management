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
  dueDate?: string | null;
  createdAt: string;
  updatedAt: string;
  createdBy?: TaskUser;
  assignedTo?: TaskUser | null;
}

export interface OrgUser {
  membershipId?: string;
  userId: string;
  email: string;
  fullName: string;
  role: OrgRole;
}

// for later if we add an Audit Log page
export interface AuditLogEntry {
  id: string;
  action: string;
  actorUserId: string;
  actorEmail?: string;
  organizationId: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown> | null;
  createdAt: string;
}
