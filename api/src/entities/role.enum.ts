// apps/api/src/entities/role.enum.ts
export enum OrgRole {
  OWNER = "OWNER",
  ADMIN = "ADMIN",
  MANAGER = "MANAGER",
  MEMBER = "MEMBER",
  VIEWER = "VIEWER",
}

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
