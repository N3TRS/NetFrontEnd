import { useMemo } from "react";
import {
  canChangeRoles,
  canEdit,
  canExecute,
  canSave,
  isOwner,
  type PermissionLevel,
} from "../lib/permissions";

interface Args {
  ownerEmail: string | null;
  userEmail: string | null;
  role: PermissionLevel | null | undefined;
}

interface SessionPermissions {
  role: PermissionLevel | null;
  isOwner: boolean;
  canEdit: boolean;
  canExecute: boolean;
  canSave: boolean;
  canChangeRoles: boolean;
}

export function useSessionPermissions({
  ownerEmail,
  userEmail,
  role,
}: Args): SessionPermissions {
  return useMemo(
    () => ({
      role: role ?? null,
      isOwner: isOwner(ownerEmail, userEmail),
      canEdit: canEdit(role, ownerEmail, userEmail),
      canExecute: canExecute(role, ownerEmail, userEmail),
      canSave: canSave(role, ownerEmail, userEmail),
      canChangeRoles: canChangeRoles(ownerEmail, userEmail),
    }),
    [ownerEmail, userEmail, role],
  );
}
