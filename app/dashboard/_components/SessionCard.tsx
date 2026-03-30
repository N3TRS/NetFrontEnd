"use client";
import { Coffee, Package } from "lucide-react";
import type { ProjectSession } from "../_types/session";
import { useRouter } from "next/navigation";

interface SessionCardProps {
  session: ProjectSession;
}

export default function SessionCard({ session }: SessionCardProps) {
  const router = useRouter();

  const handleClick = () => {
    if (typeof window === 'undefined') return;
    
    let userId = localStorage.getItem('collab:userId');
    if (!userId) {
      userId = `user-${Math.random().toString(36).slice(2, 10)}`;
      localStorage.setItem('collab:userId', userId);
    }

    const hasStructure = sessionStorage.getItem(
      `project-structure-${session.containerId}`
    ) !== null;
    
    const initParam = hasStructure ? '&initProject=true' : '';

    router.push(
      `/codeEditor?sessionId=${session.containerId}&userId=${userId}${initParam}`
    );
  };

  return (
    <div 
      className="group card-noir p-5 flex flex-col gap-4 hover:border-primary/30 transition-all cursor-pointer" 
      onClick={handleClick}
    >
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
      </div>
    </div>
  );
}
