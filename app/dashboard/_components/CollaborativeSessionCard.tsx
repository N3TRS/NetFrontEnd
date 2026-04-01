"use client";

import { Users, Crown, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import type { SessionSummary } from "../_types/collaborative-session";

interface CollaborativeSessionCardProps {
  session: SessionSummary;
}

/**
 * Format relative time (e.g., "hace 2 horas")
 */
function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffMins < 1) return "ahora";
  if (diffMins < 60) return `hace ${diffMins} min`;
  if (diffHours < 24) return `hace ${diffHours}h`;
  if (diffDays === 1) return "ayer";
  if (diffDays < 7) return `hace ${diffDays} días`;
  
  return date.toLocaleDateString("es-ES", { 
    day: "numeric", 
    month: "short" 
  });
}

export default function CollaborativeSessionCard({ session }: CollaborativeSessionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/codeEditor?sessionId=${session.sessionId}`);
  };

  return (
    <div
      className="group card-noir p-5 flex flex-col gap-4 hover:border-primary/30 transition-all cursor-pointer"
      onClick={handleClick}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors truncate">
                {session.name}
              </h3>
              {session.isOwner && (
                <span title="Eres el dueño">
                  <Crown className="h-3.5 w-3.5 text-yellow-500 flex-shrink-0" />
                </span>
              )}
            </div>
            <p className="text-xs text-muted-foreground truncate">
              {session.isOwner ? "Tu sesión" : `Creada por ${session.owner}`}
            </p>
          </div>
        </div>
      </div>

      <div className="flex items-center justify-between pt-2 border-t border-white/5">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Users className="h-3 w-3" />
          {session.participantCount} {session.participantCount === 1 ? "participante" : "participantes"}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Clock className="h-3 w-3" />
          {formatRelativeTime(session.createdAt)}
        </span>
      </div>
    </div>
  );
}
