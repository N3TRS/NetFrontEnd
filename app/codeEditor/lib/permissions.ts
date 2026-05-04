export type PermissionLevel =
  | "OWNER"
  | "VIEW_EDIT_EXECUTE_SAVE"
  | "VIEW_EDIT_EXECUTE"
  | "VIEW_EDIT"
  | "VIEW";

export type AssignableRole = Exclude<PermissionLevel, "OWNER">;

export const ASSIGNABLE_ROLES: readonly AssignableRole[] = [
  "VIEW_EDIT_EXECUTE_SAVE",
  "VIEW_EDIT_EXECUTE",
  "VIEW_EDIT",
  "VIEW",
];

export const ROLE_LABELS: Record<PermissionLevel, string> = {
  OWNER: "Owner",
  VIEW_EDIT_EXECUTE_SAVE: "Edit · Run · Save",
  VIEW_EDIT_EXECUTE: "Edit · Run",
  VIEW_EDIT: "Edit",
  VIEW: "View only",
};

export function isOwner(
  ownerEmail: string | null | undefined,
  userEmail: string | null | undefined,
): boolean {
  if (!ownerEmail || !userEmail) return false;
  return ownerEmail === userEmail;
}

export function canEdit(
  role: PermissionLevel | null | undefined,
  ownerEmail: string | null | undefined,
  userEmail: string | null | undefined,
): boolean {
  if (isOwner(ownerEmail, userEmail)) return true;
  if (role === null || role === undefined) return false;
  return role !== "VIEW";
}

export function canExecute(
  role: PermissionLevel | null | undefined,
  ownerEmail: string | null | undefined,
  userEmail: string | null | undefined,
): boolean {
  if (isOwner(ownerEmail, userEmail)) return true;
  return (
    role === "VIEW_EDIT_EXECUTE" ||
    role === "VIEW_EDIT_EXECUTE_SAVE" ||
    role === "OWNER"
  );
}

export function canSave(
  role: PermissionLevel | null | undefined,
  ownerEmail: string | null | undefined,
  userEmail: string | null | undefined,
): boolean {
  if (isOwner(ownerEmail, userEmail)) return true;
  return role === "VIEW_EDIT_EXECUTE_SAVE" || role === "OWNER";
}

export function canChangeRoles(
  ownerEmail: string | null | undefined,
  userEmail: string | null | undefined,
): boolean {
  return isOwner(ownerEmail, userEmail);
}
