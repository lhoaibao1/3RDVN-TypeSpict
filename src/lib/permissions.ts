/**
 * Permission helpers — Phase 8
 * Map roles → allowed actions (simplified from Spatie permissions)
 */

import { isOperationalAdmin, primaryRole } from "./role-hierarchy";

export type Action =
  | "user.view" | "user.create" | "user.update" | "user.delete"
  | "lead.view" | "lead.create" | "lead.update" | "lead.delete" | "lead.assign"
  | "sale_profile.view" | "sale_profile.create" | "sale_profile.approve"
  | "application.view" | "application.create" | "application.update"
  | "datacenter.view" | "datacenter.manage"
  | "team.view" | "team.manage"
  | "project.view" | "project.manage";

const ROLE_PERMISSIONS: Record<string, Action[]> = {
  Admin: [
    "user.view", "user.create", "user.update", "user.delete",
    "lead.view", "lead.create", "lead.update", "lead.delete", "lead.assign",
    "sale_profile.view", "sale_profile.create", "sale_profile.approve",
    "application.view", "application.create", "application.update",
    "datacenter.view", "datacenter.manage",
    "team.view", "team.manage",
    "project.view", "project.manage",
  ],
  "Sales Admin": [
    "user.view", "user.create", "user.update",
    "lead.view", "lead.create", "lead.update", "lead.assign",
    "sale_profile.view", "sale_profile.create", "sale_profile.approve",
    "application.view", "application.create", "application.update",
    "datacenter.view", "datacenter.manage",
    "team.view", "team.manage",
    "project.view", "project.manage",
  ],
  ZD: [
    "user.view", "user.create",
    "lead.view", "lead.create", "lead.update", "lead.assign",
    "sale_profile.view", "sale_profile.create", "sale_profile.approve",
    "application.view", "application.create", "application.update",
    "datacenter.view", "datacenter.manage",
    "team.view",
    "project.view",
  ],
  AM: [
    "user.view", "user.create",
    "lead.view", "lead.create", "lead.update", "lead.assign",
    "sale_profile.view", "sale_profile.create", "sale_profile.approve",
    "application.view", "application.create", "application.update",
    "datacenter.view",
    "team.view",
    "project.view",
  ],
  "Team Leader": [
    "user.view",
    "lead.view", "lead.create", "lead.update", "lead.assign",
    "sale_profile.view", "sale_profile.create", "sale_profile.approve",
    "application.view", "application.create", "application.update",
    "datacenter.view",
    "team.view",
    "project.view",
  ],
  "Direct Sale": [
    "lead.view", "lead.create", "lead.update",
    "sale_profile.view", "sale_profile.create",
    "application.view", "application.create",
    "datacenter.view",
    "project.view",
  ],
  Telesale: [
    "lead.view", "lead.create", "lead.update",
    "sale_profile.view", "sale_profile.create",
    "application.view", "application.create",
    "datacenter.view",
  ],
  CTV: [
    "lead.view", "lead.create",
    "sale_profile.view", "sale_profile.create",
    "application.view",
  ],
  "Courier Manager": ["lead.view", "sale_profile.view", "team.view"],
  Courier: ["lead.view", "sale_profile.view"],
};

export function can(roles: string[], action: Action): boolean {
  if (isOperationalAdmin(roles)) return true;
  const role = primaryRole(roles);
  if (!role) return false;
  const perms = ROLE_PERMISSIONS[role] || [];
  return perms.includes(action);
}

export function assertCan(roles: string[], action: Action) {
  if (!can(roles, action)) {
    throw new Error(`Không có quyền: ${action}`);
  }
}
