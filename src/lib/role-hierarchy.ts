/**
 * Role Hierarchy - Ported from App\Support\RoleHierarchy.php
 */

export const ROLE_ORDER = [
  "Admin",
  "Sales Admin",
  "ZD",
  "AM",
  "Team Leader",
  "Courier Manager",
  "Courier",
  "Direct Sale",
  "Telesale",
  "CTV",
] as const;

export type RoleName = (typeof ROLE_ORDER)[number];

export const OPERATIONAL_ADMIN_ROLES: RoleName[] = ["Admin", "Sales Admin"];

export const SALES_ROLES: RoleName[] = ["Direct Sale", "Telesale", "CTV"];

export const COURIER_ROLES: RoleName[] = ["Courier"];

export const ASSIGNABLE: Record<RoleName, RoleName[]> = {
  Admin: [
    "Admin",
    "Sales Admin",
    "ZD",
    "AM",
    "Team Leader",
    "Courier Manager",
    "Courier",
    "Direct Sale",
    "Telesale",
    "CTV",
  ],
  "Sales Admin": [
    "ZD",
    "AM",
    "Team Leader",
    "Courier Manager",
    "Courier",
    "Direct Sale",
    "Telesale",
    "CTV",
  ],
  ZD: [
    "AM",
    "Team Leader",
    "Courier Manager",
    "Courier",
    "Direct Sale",
    "Telesale",
    "CTV",
  ],
  AM: [
    "Team Leader",
    "Courier Manager",
    "Courier",
    "Direct Sale",
    "Telesale",
    "CTV",
  ],
  "Team Leader": ["Direct Sale", "Telesale", "CTV"],
  "Courier Manager": ["Courier"],
  Courier: [],
  "Direct Sale": [],
  Telesale: [],
  CTV: [],
};

export function primaryRole(roles: string[]): RoleName | null {
  for (const role of ROLE_ORDER) {
    if (roles.includes(role)) return role;
  }
  return null;
}

export function isOperationalAdmin(roles: string[]): boolean {
  return roles.some((r) => OPERATIONAL_ADMIN_ROLES.includes(r as RoleName));
}

export function assignableRoles(actorRoles: string[]): RoleName[] {
  const role = primaryRole(actorRoles);
  if (!role) return [];
  return ASSIGNABLE[role] ?? [];
}

export function canCreateUsers(actorRoles: string[]): boolean {
  return assignableRoles(actorRoles).length > 0;
}
