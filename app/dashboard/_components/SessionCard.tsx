import { Calendar, Coffee, Package } from "lucide-react";
import type { ProjectSession } from "../_types/session";

interface SessionCardProps {
  session: ProjectSession;
}

export default function SessionCard({ session }: SessionCardProps) {
  const timeAgo = getTimeAgo(session.createdAt);

  return (
    <div className="group card-noir p-5 flex flex-col gap-4 hover:border-primary/30 transition-all cursor-pointer">
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/20 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
            <Package className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-white group-hover:text-primary transition-colors">
              {session.name}
            </h3>
            <p className="text-xs text-muted-foreground">{session.group}</p>
          </div>
        </div>
      </div>
      {session.description && (
        <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
          {session.description}
        </p>
      )}
      <div className="flex items-center gap-4 pt-1 border-t border-white/5">
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Coffee className="h-3 w-3" />
          Java {session.javaVersion}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] text-muted-foreground">
          <Calendar className="h-3 w-3" />
          {timeAgo}
        </span>
      </div>
    </div>
  );
}

function getTimeAgo(date: Date): string {
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);

  if (diffMin < 1) return "Ahora";
  if (diffMin < 60) return `Hace ${diffMin}m`;

  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `Hace ${diffHrs}h`;

  const diffDays = Math.floor(diffHrs / 24);
  if (diffDays < 7) return `Hace ${diffDays}d`;

  return date.toLocaleDateString("es-ES", { day: "numeric", month: "short" });
}
