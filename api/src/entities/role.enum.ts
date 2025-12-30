// apps/api/src/entities/role.enum.ts
export enum OrgRole {
  OWNER = "OWNER", // creator of organization
  ADMIN = "ADMIN", // manage users & tasks
  MANAGER = "MANAGER", // manage tasks for team
  MEMBER = "MEMBER", // standard user
  VIEWER = "VIEWER", // read-only
}

// Simple helper for role hierarchy
export const ROLE_PRIORITY: Record<OrgRole, number> = {
  [OrgRole.OWNER]: 5,
  [OrgRole.ADMIN]: 4,
  [OrgRole.MANAGER]: 3,
  [OrgRole.MEMBER]: 2,
  [OrgRole.VIEWER]: 1,
};

export function hasAtLeastRole(
  userRole: OrgRole,
  requiredRole: OrgRole
): boolean {
  return ROLE_PRIORITY[userRole] >= ROLE_PRIORITY[requiredRole];
}
