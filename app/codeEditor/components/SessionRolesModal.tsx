"use client";

import { Lock, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  ASSIGNABLE_ROLES,
  ROLE_LABELS,
  type AssignableRole,
  type PermissionLevel,
} from "../lib/permissions";
import type { Participant } from "./ParticipantAvatars";

interface SessionRolesModalProps {
  open: boolean;
  participants: Participant[];
  ownerEmail: string | null;
  currentUserEmail: string | null;
  canChangeRoles: boolean;
  onClose: () => void;
  onChangeRole: (
    targetEmail: string,
    role: AssignableRole,
  ) => Promise<void> | void;
}

function effectiveRole(
  email: string,
  ownerEmail: string | null,
  role: PermissionLevel | undefined,
): PermissionLevel {
  if (ownerEmail && email === ownerEmail) return "OWNER";
  return role ?? "VIEW";
}

export function SessionRolesModal({
  open,
  participants,
  ownerEmail,
  currentUserEmail,
  canChangeRoles,
  onClose,
  onChangeRole,
}: SessionRolesModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-lg border border-white/10 bg-background p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-xl font-semibold text-white">Permissions</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded-md p-1 text-white hover:bg-white/10"
            aria-label="Close"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {!canChangeRoles ? (
          <div className="mb-3 flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-3 py-2 text-xs text-muted-foreground">
            <Lock className="size-3.5" aria-hidden />
            Owner only — you can view roles but not change them.
          </div>
        ) : null}

        <div className="mb-4 max-h-72 space-y-2 overflow-y-auto">
          {participants.map((p) => {
            const role = effectiveRole(p.email, ownerEmail, p.role);
            const isOwnerRow = role === "OWNER";
            const isMe = currentUserEmail === p.email;
            const dropdownDisabled = !canChangeRoles || isOwnerRow;

            return (
              <div
                key={p.email}
                className="flex items-center justify-between gap-3 rounded-md border border-white/10 bg-white/5 px-3 py-2"
              >
                <div className="flex min-w-0 items-center gap-2">
                  <div
                    className="size-6 shrink-0 rounded-full"
                    style={{ backgroundColor: p.color ?? "#22d3ee" }}
                    aria-hidden
                  />
                  <div className="min-w-0">
                    <div className="truncate text-sm text-white">
                      {p.email}
                      {isMe ? (
                        <span className="ml-1 text-muted-foreground">(you)</span>
                      ) : null}
                    </div>
                    {isOwnerRow ? (
                      <div className="text-[11px] uppercase tracking-wide text-accent">
                        Owner
                      </div>
                    ) : null}
                  </div>
                </div>

                {isOwnerRow ? (
                  <span className="rounded-md border border-accent/40 bg-accent/10 px-2 py-1 text-[11px] font-medium text-accent">
                    All permissions
                  </span>
                ) : (
                  <select
                    value={role}
                    disabled={dropdownDisabled}
                    onChange={(e) => {
                      const next = e.target.value as AssignableRole;
                      void onChangeRole(p.email, next);
                    }}
                    className="rounded-md border border-white/10 bg-secondary px-2 py-1 text-xs text-white disabled:cursor-not-allowed disabled:opacity-60"
                  >
                    {ASSIGNABLE_ROLES.map((r) => (
                      <option key={r} value={r}>
                        {ROLE_LABELS[r]}
                      </option>
                    ))}
                  </select>
                )}
              </div>
            );
          })}
          {participants.length === 0 ? (
            <div className="rounded-md border border-dashed border-white/10 px-3 py-4 text-center text-sm text-muted-foreground">
              No participants yet
            </div>
          ) : null}
        </div>

        <div className="flex justify-end">
          <Button variant="outline" onClick={onClose}>
            Close
          </Button>
        </div>
      </div>
    </div>
  );
}
