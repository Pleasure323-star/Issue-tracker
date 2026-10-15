/** Matches Prisma `Role` enum — kept local so helpers stay edge-safe. */
export type AppRole = "user" | "admin" | "super_admin";

/** Alias used by assignee selectors (ENDOR-6). */
export type UserRole = AppRole;

export const ROLES = {
  user: "user",
  admin: "admin",
  super_admin: "super_admin",
} as const satisfies Record<AppRole, AppRole>;

export const roleLabels: Record<AppRole, string> = {
  user: "User",
  admin: "Admin",
  super_admin: "Super admin",
};

/** Admin or super_admin — can access admin-gated features. */
export function isAdmin(role: AppRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

export function isSuperAdmin(role: AppRole | null | undefined): boolean {
  return role === "super_admin";
}

/** Plain-text label for `<option>` lists (badges can't render inside options). */
export function formatUserLabel(
  name: string,
  role: AppRole | null | undefined,
): string {
  if (isAdmin(role)) {
    return `${name} (Admin)`;
  }
  return name;
}
