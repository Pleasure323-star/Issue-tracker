/** Matches Prisma `Role` enum values (user | admin | super_admin). */
export type UserRole = "user" | "admin" | "super_admin";

/** Roles that should show the Admin badge in the UI. */
export function isAdminRole(role: UserRole | null | undefined): boolean {
  return role === "admin" || role === "super_admin";
}

/** Plain-text label for contexts that cannot render HTML (e.g. `<option>`). */
export function formatUserLabel(
  name: string,
  role: UserRole | null | undefined,
): string {
  return isAdminRole(role) ? `${name} (Admin)` : name;
}
