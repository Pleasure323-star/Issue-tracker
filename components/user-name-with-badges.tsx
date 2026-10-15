import { AdminBadge } from "@/components/admin-badge";
import { isAdminRole, type UserRole } from "@/lib/roles";

export function UserNameWithBadges({
  name,
  role,
  className = "",
}: {
  name: string;
  role?: UserRole | null;
  className?: string;
}) {
  return (
    <span className={`inline-flex max-w-full items-center gap-1.5 ${className}`}>
      <span className="truncate">{name}</span>
      {isAdminRole(role) ? <AdminBadge /> : null}
    </span>
  );
}
